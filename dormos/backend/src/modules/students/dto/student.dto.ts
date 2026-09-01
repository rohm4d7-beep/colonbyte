import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'
import { FeeStatus, Gender, StudentStatus } from '@prisma/client'

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  hostelId!: string

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsNotEmpty()
  cnic!: string

  @IsEnum(Gender)
  gender!: Gender

  @IsOptional()
  @IsString()
  dateOfBirth?: string

  @IsString()
  @IsNotEmpty()
  phone!: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  bloodGroup?: string

  @IsOptional()
  @IsString()
  medicalNotes?: string

  @IsOptional()
  @IsString()
  university?: string

  @IsOptional()
  @IsString()
  department?: string

  @IsOptional()
  @IsString()
  semester?: string

  @IsOptional()
  @IsString()
  registrationNo?: string

  @IsOptional()
  @IsString()
  admissionDate?: string

  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus

  @IsOptional()
  @IsEnum(FeeStatus)
  feeStatus?: FeeStatus

  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyFee?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  outstandingDues?: number

  @IsOptional()
  @IsString()
  roomId?: string

  @IsOptional()
  @IsString()
  bedId?: string

  @IsOptional()
  @IsString()
  messPlan?: string

  @IsOptional()
  @IsObject()
  guardian?: Record<string, unknown>

  @IsOptional()
  @IsObject()
  emergencyContact?: Record<string, unknown>
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  cnic?: string

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender

  @IsOptional()
  @IsString()
  dateOfBirth?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  bloodGroup?: string

  @IsOptional()
  @IsString()
  medicalNotes?: string

  @IsOptional()
  @IsString()
  university?: string

  @IsOptional()
  @IsString()
  department?: string

  @IsOptional()
  @IsString()
  semester?: string

  @IsOptional()
  @IsString()
  registrationNo?: string

  @IsOptional()
  @IsString()
  admissionDate?: string

  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus

  @IsOptional()
  @IsEnum(FeeStatus)
  feeStatus?: FeeStatus

  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyFee?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  outstandingDues?: number

  @IsOptional()
  @IsString()
  roomId?: string

  @IsOptional()
  @IsString()
  bedId?: string

  @IsOptional()
  @IsString()
  messPlan?: string

  @IsOptional()
  @IsObject()
  guardian?: Record<string, unknown>

  @IsOptional()
  @IsObject()
  emergencyContact?: Record<string, unknown>
}

export class StudentQueryDto {
  @IsString()
  @IsNotEmpty()
  hostelId!: string

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  feeStatus?: string

  @IsOptional()
  @IsString()
  roomId?: string

  @IsOptional()
  @IsString()
  department?: string

  @IsOptional()
  @IsString()
  university?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number
}

export class AllocateRoomDto {
  @IsString()
  @IsNotEmpty()
  bedId!: string

  @IsOptional()
  @IsString()
  roomId?: string
}

export class BulkMoveDto {
  @IsArray()
  @IsString({ each: true })
  studentIds!: string[]

  @IsString()
  @IsNotEmpty()
  bedId!: string
}

export class BulkActionDto {
  @IsArray()
  @IsString({ each: true })
  studentIds!: string[]

  @IsOptional()
  @IsBoolean()
  delete?: boolean
}
