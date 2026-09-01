import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { RoomsService } from './rooms.service'
import { CreateRoomDto, RoomQueryDto, UpdateRoomDto } from './dto/room.dto'

@ApiTags('rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'List rooms with filters + pagination' })
  list(@Query() query: RoomQueryDto) {
    return this.roomsService.list(query)
  }

  @Get('floors')
  @ApiOperation({ summary: 'Get room/bed counts per floor' })
  floors(@Query('hostelId') hostelId: string) {
    return this.roomsService.floors(hostelId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single room with beds' })
  getOne(@Param('id') id: string) {
    return this.roomsService.getOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a room with beds' })
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room' })
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id)
  }
}
