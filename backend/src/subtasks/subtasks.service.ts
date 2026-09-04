import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subtask } from './subtask.entity';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { Task } from '../tasks/task.entity';

@Injectable()
export class SubtasksService {
  constructor(
    @InjectRepository(Subtask)
    private subtaskRepository: Repository<Subtask>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(userId: string, taskId: string, createSubtaskDto: CreateSubtaskDto) {
    // Verify the task belongs to the user
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task || task.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const subtask = this.subtaskRepository.create({
      ...createSubtaskDto,
      task_id: taskId,
    });
    return this.subtaskRepository.save(subtask);
  }

  async findByTask(userId: string, taskId: string) {
    // Verify the task belongs to the user
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task || task.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.subtaskRepository.find({
      where: { task_id: taskId },
      order: { created_at: 'ASC' },
    });
  }

  async findOne(userId: string, id: string) {
    const subtask = await this.subtaskRepository.findOne({ where: { id } });
    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }

    // Verify the parent task belongs to the user
    const task = await this.taskRepository.findOne({ where: { id: subtask.task_id } });
    if (!task || task.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return subtask;
  }

  async update(userId: string, id: string, updateSubtaskDto: UpdateSubtaskDto) {
    const subtask = await this.findOne(userId, id);
    Object.assign(subtask, updateSubtaskDto);
    return this.subtaskRepository.save(subtask);
  }

  async remove(userId: string, id: string) {
    const subtask = await this.findOne(userId, id);
    await this.subtaskRepository.remove(subtask);
    return { message: 'Subtask deleted successfully' };
  }

  async getTaskProgress(userId: string, taskId: string) {
    const subtasks = await this.findByTask(userId, taskId);
    const total = subtasks.length;
    const completed = subtasks.filter(s => s.is_completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      percentage,
    };
  }
}