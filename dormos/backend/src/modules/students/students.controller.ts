import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { StudentsService } from './students.service'
import {
  AllocateRoomDto,
  BulkActionDto,
  CreateStudentDto,
  StudentQueryDto,
  UpdateStudentDto,
} from './dto/student.dto'

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'List students with filters + pagination' })
  list(@Query() query: StudentQueryDto) {
    return this.studentsService.list(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single student' })
  getOne(@Param('id') id: string) {
    return this.studentsService.getOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a student (optionally allocate a bed)' })
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a student' })
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a student and release the bed' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id)
  }

  @Post(':id/allocate')
  @ApiOperation({ summary: 'Allocate a student to a bed' })
  allocate(@Param('id') id: string, @Body() dto: AllocateRoomDto) {
    return this.studentsService.allocate(id, dto)
  }

  @Post('bulk/actions')
  @ApiOperation({ summary: 'Bulk actions (delete students)' })
  bulkAction(@Body() dto: BulkActionDto) {
    return this.studentsService.bulkAction(dto)
  }
}
