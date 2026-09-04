import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RecurringTasksService } from './recurring-tasks.service';
import { CreateRecurringTaskDto } from './dto/create-recurring-task.dto';
import { UpdateRecurringTaskDto } from './dto/update-recurring-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recurring-tasks')
@UseGuards(JwtAuthGuard)
export class RecurringTasksController {
  constructor(private recurringTasksService: RecurringTasksService) {}

  @Post()
  create(@Request() req, @Body() createRecurringTaskDto: CreateRecurringTaskDto) {
    return this.recurringTasksService.create(req.user.id, createRecurringTaskDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.recurringTasksService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.recurringTasksService.findOne(req.user.id, id);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateRecurringTaskDto: UpdateRecurringTaskDto) {
    return this.recurringTasksService.update(req.user.id, id, updateRecurringTaskDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.recurringTasksService.remove(req.user.id, id);
  }
}