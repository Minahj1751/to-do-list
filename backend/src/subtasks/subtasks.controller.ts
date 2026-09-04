import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SubtasksService } from './subtasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks/:taskId/subtasks')
@UseGuards(JwtAuthGuard)
export class SubtasksController {
  constructor(private subtasksService: SubtasksService) {}

  @Post()
  create(@Request() req, @Param('taskId') taskId: string, @Body() createSubtaskDto: CreateSubtaskDto) {
    return this.subtasksService.create(req.user.id, taskId, createSubtaskDto);
  }

  @Get()
  findByTask(@Request() req, @Param('taskId') taskId: string) {
    return this.subtasksService.findByTask(req.user.id, taskId);
  }

  @Get('progress')
  getTaskProgress(@Request() req, @Param('taskId') taskId: string) {
    return this.subtasksService.getTaskProgress(req.user.id, taskId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.subtasksService.findOne(req.user.id, id);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateSubtaskDto: UpdateSubtaskDto) {
    return this.subtasksService.update(req.user.id, id, updateSubtaskDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.subtasksService.remove(req.user.id, id);
  }
}