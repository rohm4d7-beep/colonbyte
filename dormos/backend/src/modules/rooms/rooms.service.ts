import { Injectable, NotFoundException } from '@nestjs/common'
import { BedStatus, Prisma, RoomStatus, RoomType } from '@prisma/client'
import { PrismaService } from '../../database'
import { CreateRoomDto, RoomQueryDto, UpdateRoomDto } from './dto/room.dto'

const roomInclude = {
  beds: { orderBy: { label: 'asc' as const } },
  students: true,
  building: true,
} satisfies Prisma.RoomInclude

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: RoomQueryDto) {
    const {
      hostelId,
      search,
      floor,
      status,
      type,
      page = 1,
      limit = 20,
    } = query

    const where: Prisma.RoomWhereInput = { hostelId }

    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { building: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (floor) where.floor = floor
    if (status) where.status = status as RoomStatus
    if (type) where.type = type as RoomType

    const [items, total] = await this.prisma.$transaction([
      this.prisma.room.findMany({
        where,
        include: roomInclude,
        orderBy: [{ floor: 'asc' }, { number: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.room.count({ where }),
    ])

    return {
      items: items.map(toRoomDto),
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    }
  }

  async getOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: roomInclude,
    })
    if (!room) throw new NotFoundException('Room not found')
    return toRoomDto(room)
  }

  async create(dto: CreateRoomDto) {
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          hostelId: dto.hostelId,
          buildingId: dto.buildingId ?? null,
          number: dto.number,
          floor: dto.floor ?? 1,
          capacity: dto.capacity ?? 2,
          type: dto.type ?? RoomType.Twin,
          ac: dto.ac ?? false,
          attachedBathroom: dto.attachedBathroom ?? false,
          furniture: dto.furniture ?? [],
          status: dto.status ?? RoomStatus.Vacant,
          cleaningStatus: dto.cleaningStatus,
          maintenanceStatus: dto.maintenanceStatus,
          rentPerBed: dto.rentPerBed ?? 0,
          beds: {
            create: this.bedPayloads(dto.capacity ?? 2),
          },
        },
        include: roomInclude,
      })

      await this.syncHostelCounts(tx, dto.hostelId)

      return toRoomDto(room)
    })
  }

  async update(id: string, dto: UpdateRoomDto) {
    const existing = await this.prisma.room.findUnique({
      where: { id },
      include: { beds: true },
    })
    if (!existing) throw new NotFoundException('Room not found')

    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.update({
        where: { id },
        data: {
          buildingId: dto.buildingId,
          number: dto.number,
          floor: dto.floor,
          capacity: dto.capacity,
          type: dto.type,
          ac: dto.ac,
          attachedBathroom: dto.attachedBathroom,
          furniture: dto.furniture,
          status: dto.status,
          cleaningStatus: dto.cleaningStatus,
          maintenanceStatus: dto.maintenanceStatus,
          rentPerBed: dto.rentPerBed,
        },
        include: roomInclude,
      })

      if (dto.capacity !== undefined && dto.capacity !== existing.capacity) {
        await this.syncBeds(tx, id, dto.capacity, existing.beds.length)
        await this.syncHostelCounts(tx, existing.hostelId)
      }

      return toRoomDto(room)
    })
  }

  async remove(id: string) {
    const existing = await this.prisma.room.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Room not found')

    const occupants = await this.prisma.student.count({ where: { roomId: id } })
    if (occupants > 0) {
      throw new NotFoundException('Cannot delete a room with occupants')
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.room.delete({ where: { id } })
      await this.syncHostelCounts(tx, existing.hostelId)
    })

    return { success: true }
  }

  async floors(hostelId: string) {
    const floors = await this.prisma.room.groupBy({
      by: ['floor'],
      where: { hostelId },
      _count: { _all: true },
      _sum: { capacity: true },
    })
    return floors.map((f) => ({
      floor: f.floor,
      rooms: f._count._all,
      beds: f._sum.capacity ?? 0,
    }))
  }

  private bedPayloads(capacity: number): { label: string }[] {
    return Array.from({ length: capacity }, (_, i) => ({ label: String(i + 1) }))
  }

  private async syncBeds(
    tx: Prisma.TransactionClient,
    roomId: string,
    capacity: number,
    current: number,
  ): Promise<void> {
    if (capacity > current) {
      const labels = Array.from({ length: capacity }, (_, i) => String(i + 1))
      await tx.bed.createMany({
        data: labels.slice(current).map((label) => ({
          roomId,
          label,
          status: BedStatus.Vacant,
        })),
      })
    } else if (capacity < current) {
      const extra = await tx.bed.findMany({
        where: { roomId, status: BedStatus.Vacant },
        orderBy: { label: 'desc' },
        take: current - capacity,
      })
      if (extra.length < current - capacity) {
        throw new NotFoundException('Cannot reduce capacity: not enough vacant beds')
      }
      await tx.bed.deleteMany({
        where: { id: { in: extra.map((b) => b.id) } },
      })
    }
  }

  private async syncHostelCounts(tx: Prisma.TransactionClient, hostelId: string): Promise<void> {
    const [bedCount, occupiedBeds] = await Promise.all([
      tx.bed.count({ where: { room: { hostelId } } }),
      tx.bed.count({ where: { room: { hostelId }, status: BedStatus.Occupied } }),
    ])
    const occupancy = bedCount > 0 ? Math.round((occupiedBeds / bedCount) * 100) : 0
    await tx.hostel.update({
      where: { id: hostelId },
      data: { bedCount, occupancy },
    })
  }
}

function toRoomDto(room: any) {
  const students = room.students ?? []
  return {
    ...room,
    rentPerBed: Number(room.rentPerBed ?? 0),
    beds: (room.beds ?? []).map((bed: any) => ({
      ...bed,
      studentId: students.find((s: any) => s.bedId === bed.id)?.id ?? null,
    })),
  }
}
