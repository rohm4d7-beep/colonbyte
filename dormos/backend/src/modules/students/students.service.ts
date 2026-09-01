import { Injectable, NotFoundException } from '@nestjs/common'
import { BedStatus, FeeStatus, Prisma, RoomStatus, StudentStatus } from '@prisma/client'
import { PrismaService } from '../../database'
import {
  AllocateRoomDto,
  BulkActionDto,
  CreateStudentDto,
  StudentQueryDto,
  UpdateStudentDto,
} from './dto/student.dto'

const studentInclude = {
  room: true,
  bed: true,
} satisfies Prisma.StudentInclude

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: StudentQueryDto) {
    const {
      hostelId,
      search,
      status,
      feeStatus,
      roomId,
      department,
      university,
      page = 1,
      limit = 20,
    } = query

    const where: Prisma.StudentWhereInput = { hostelId }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cnic: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { registrationNo: { contains: search, mode: 'insensitive' } },
        { university: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status) where.status = status as StudentStatus
    if (feeStatus) where.feeStatus = feeStatus as FeeStatus
    if (roomId) where.roomId = roomId
    if (department) where.department = department
    if (university) where.university = university

    const [items, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        include: studentInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.student.count({ where }),
    ])

    return {
      items: items.map(toStudentDto),
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    }
  }

  async getOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: studentInclude,
    })
    if (!student) throw new NotFoundException('Student not found')
    return toStudentDto(student)
  }

  async create(dto: CreateStudentDto) {
    const { bedId, roomId, guardian, emergencyContact, ...data } = dto
    const dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined
    const admissionDate = dto.admissionDate ? new Date(dto.admissionDate) : undefined

    return this.prisma.$transaction(async (tx) => {
      const roomIdToUse =
        roomId ??
        (bedId ? (await tx.bed.findUnique({ where: { id: bedId } }))?.roomId : undefined)

      const student = await tx.student.create({
        data: {
          ...data,
          guardian: (guardian ?? undefined) as Prisma.InputJsonValue | undefined,
          emergencyContact: (emergencyContact ?? undefined) as Prisma.InputJsonValue | undefined,
          dateOfBirth,
          admissionDate,
          roomId: roomIdToUse ?? undefined,
          bedId: bedId ?? undefined,
        },
        include: studentInclude,
      })

      if (bedId) {
        await tx.bed.update({
          where: { id: bedId },
          data: { status: BedStatus.Occupied },
        })
        await tx.room.update({
          where: { id: roomIdToUse! },
          data: { status: RoomStatus.Occupied },
        })
      }

      await tx.hostel.update({
        where: { id: dto.hostelId },
        data: { studentCount: { increment: 1 } },
      })

      return toStudentDto(student)
    })
  }

  async update(id: string, dto: UpdateStudentDto) {
    const existing = await this.prisma.student.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Student not found')

    const { bedId, roomId, guardian, emergencyContact, ...data } = dto
    const dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined
    const admissionDate = dto.admissionDate ? new Date(dto.admissionDate) : undefined

    return this.prisma.$transaction(async (tx) => {
      const nextRoomId = roomId !== undefined ? (roomId || null) : existing.roomId
      const nextBedId = bedId !== undefined ? (bedId || null) : existing.bedId

      if (nextBedId && nextBedId !== existing.bedId) {
        await tx.bed.update({
          where: { id: nextBedId },
          data: { status: BedStatus.Occupied },
        })
      }

      if (existing.bedId && nextBedId !== existing.bedId) {
        await tx.bed.update({
          where: { id: existing.bedId },
          data: { status: BedStatus.Vacant },
        })
      }

      const student = await tx.student.update({
        where: { id },
        data: {
          ...data,
          guardian: (guardian ?? undefined) as Prisma.InputJsonValue | undefined,
          emergencyContact: (emergencyContact ?? undefined) as Prisma.InputJsonValue | undefined,
          dateOfBirth,
          admissionDate,
          roomId: nextRoomId,
          bedId: nextBedId,
        },
        include: studentInclude,
      })

      await this.syncRoomStatus(tx, nextRoomId)
      if (existing.roomId && existing.roomId !== nextRoomId) {
        await this.syncRoomStatus(tx, existing.roomId)
      }

      return toStudentDto(student)
    })
  }

  async remove(id: string) {
    const existing = await this.prisma.student.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Student not found')

    await this.prisma.$transaction(async (tx) => {
      await tx.student.delete({ where: { id } })

      if (existing.bedId) {
        await tx.bed.update({
          where: { id: existing.bedId },
          data: { status: BedStatus.Vacant },
        })
      }
      if (existing.roomId) {
        await this.syncRoomStatus(tx, existing.roomId)
      }
      await tx.hostel.update({
        where: { id: existing.hostelId },
        data: { studentCount: { decrement: 1 } },
      })
    })

    return { success: true }
  }

  async allocate(id: string, dto: AllocateRoomDto) {
    const existing = await this.prisma.student.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Student not found')

    const bed = await this.prisma.bed.findUnique({
      where: { id: dto.bedId },
      include: { student: true },
    })
    if (!bed) throw new NotFoundException('Bed not found')
    if (bed.status === BedStatus.Occupied && bed.student?.id !== id) {
      throw new NotFoundException('This bed is already occupied')
    }

    return this.prisma.$transaction(async (tx) => {
      if (existing.bedId) {
        await tx.bed.update({
          where: { id: existing.bedId },
          data: { status: BedStatus.Vacant },
        })
      }

      const student = await tx.student.update({
        where: { id },
        data: {
          bedId: dto.bedId,
          roomId: dto.roomId ?? bed.roomId,
          status: StudentStatus.Active,
        },
        include: studentInclude,
      })

      await tx.bed.update({
        where: { id: dto.bedId },
        data: { status: BedStatus.Occupied },
      })
      await this.syncRoomStatus(tx, bed.roomId)
      if (existing.roomId && existing.roomId !== bed.roomId) {
        await this.syncRoomStatus(tx, existing.roomId)
      }

      return toStudentDto(student)
    })
  }

  async bulkAction(dto: BulkActionDto) {
    const { studentIds, delete: shouldDelete } = dto

    if (shouldDelete) {
      const students = await this.prisma.student.findMany({
        where: { id: { in: studentIds } },
      })
      await this.prisma.$transaction(async (tx) => {
        for (const student of students) {
          await tx.student.delete({ where: { id: student.id } })
          if (student.bedId) {
            await tx.bed.update({
              where: { id: student.bedId },
              data: { status: BedStatus.Vacant },
            })
          }
          if (student.roomId) {
            await this.syncRoomStatus(tx, student.roomId)
          }
        }
        await tx.hostel.update({
          where: { id: students[0]?.hostelId ?? '' },
          data: { studentCount: { decrement: students.length } },
        })
      })
      return { success: true, deleted: students.length }
    }

    return { success: true, deleted: 0 }
  }

  private async syncRoomStatus(
    tx: Prisma.TransactionClient,
    roomId?: string | null,
  ): Promise<void> {
    if (!roomId) return
    const occupants = await tx.student.count({ where: { roomId } })
    const room = await tx.room.findUnique({ where: { id: roomId }, select: { status: true } })
    if (!room || room.status === RoomStatus.Cleaning || room.status === RoomStatus.Maintenance) return
    await tx.room.update({
      where: { id: roomId },
      data: { status: occupants > 0 ? RoomStatus.Occupied : RoomStatus.Vacant },
    })
  }
}

function toStudentDto(student: any) {
  return {
    ...student,
    monthlyFee: Number(student.monthlyFee ?? 0),
    outstandingDues: Number(student.outstandingDues ?? 0),
  }
}
