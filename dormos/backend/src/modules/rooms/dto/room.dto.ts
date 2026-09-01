import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'
import { CleaningStatus, RoomMaintenanceStatus, RoomStatus, RoomType } from '@prisma/client'

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  hostelId!: string

  @IsOptional()
  @IsString()
  buildingId?: string

  @IsString()
  @IsNotEmpty()
  number!: string

  @IsOptional()
  @IsInt()
  @Min(1)
  floor?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  capacity?: number

  @IsOptional()
  @IsEnum(RoomType)
  type?: RoomType

  @IsOptional()
  @IsBoolean()
  ac?: boolean

  @IsOptional()
  @IsBoolean()
  attachedBathroom?: boolean

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  furniture?: string[]

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus

  @IsOptional()
  @IsEnum(CleaningStatus)
  cleaningStatus?: CleaningStatus

  @IsOptional()
  @IsEnum(RoomMaintenanceStatus)
  maintenanceStatus?: RoomMaintenanceStatus

  @IsOptional()
  @IsInt()
  @Min(0)
  rentPerBed?: number
}

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  buildingId?: string

  @IsOptional()
  @IsString()
  number?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  floor?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  capacity?: number

  @IsOptional()
  @IsEnum(RoomType)
  type?: RoomType

  @IsOptional()
  @IsBoolean()
  ac?: boolean

  @IsOptional()
  @IsBoolean()
  attachedBathroom?: boolean

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  furniture?: string[]

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus

  @IsOptional()
  @IsEnum(CleaningStatus)
  cleaningStatus?: CleaningStatus

  @IsOptional()
  @IsEnum(RoomMaintenanceStatus)
  maintenanceStatus?: RoomMaintenanceStatus

  @IsOptional()
  @IsInt()
  @Min(0)
  rentPerBed?: number
}

export class RoomQueryDto {
  @IsString()
  @IsNotEmpty()
  hostelId!: string

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  floor?: number

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  type?: string

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
