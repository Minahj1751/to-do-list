import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query, Patch } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, createTaskDto);
  }

  @Get()
  findAll(@Request() req, @Query() filters: any) {
    return this.tasksService.findAll(req.user.id, filters);
  }

  @Get('today')
  getTodayTasks(@Request() req) {
    return this.tasksService.getTodayTasks(req.user.id);
  }

  @Get('upcoming')
  getUpcomingTasks(@Request() req) {
    return this.tasksService.getUpcomingTasks(req.user.id);
  }

  @Get('overdue')
  getOverdueTasks(@Request() req) {
    return this.tasksService.getOverdueTasks(req.user.id);
  }

  @Get('completed')
  getCompletedTasks(@Request() req) {
    return this.tasksService.getCompletedTasks(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.tasksService.findOne(req.user.id, id);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(req.user.id, id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.tasksService.remove(req.user.id, id);
  }

  @Patch(':id/complete')
  markComplete(@Request() req, @Param('id') id: string) {
    return this.tasksService.markComplete(req.user.id, id);
  }

  @Patch(':id/incomplete')
  markIncomplete(@Request() req, @Param('id') id: string) {
    return this.tasksService.markIncomplete(req.user.id, id);
  }
}