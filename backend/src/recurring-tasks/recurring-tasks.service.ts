import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringTask, RepeatType } from './recurring-task.entity';
import { CreateRecurringTaskDto } from './dto/create-recurring-task.dto';
import { UpdateRecurringTaskDto } from './dto/update-recurring-task.dto';
import { Task } from '../tasks/task.entity';

@Injectable()
export class RecurringTasksService {
  constructor(
    @InjectRepository(RecurringTask)
    private recurringTaskRepository: Repository<RecurringTask>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(userId: string, createRecurringTaskDto: CreateRecurringTaskDto) {
    // Verify the task belongs to the user
    const task = await this.taskRepository.findOne({ where: { id: createRecurringTaskDto.task_id } });
    if (!task || task.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const recurringTask = this.recurringTaskRepository.create({
      task_id: createRecurringTaskDto.task_id,
      repeat_type: createRecurringTaskDto.repeat_type,
      repeat_interval: createRecurringTaskDto.repeat_interval,
      start_date: createRecurringTaskDto.start_date ? new Date(createRecurringTaskDto.start_date) : undefined,
      end_date: createRecurringTaskDto.end_date ? new Date(createRecurringTaskDto.end_date) : undefined,
    });
    return this.recurringTaskRepository.save(recurringTask);
  }

  async findAll(userId: string) {
    // Get all recurring tasks for user's tasks
    const tasks = await this.taskRepository.find({ where: { user_id: userId } });
    const taskIds = tasks.map(t => t.id);

    return this.recurringTaskRepository
      .createQueryBuilder('recurringTask')
      .leftJoinAndSelect('recurringTask.task', 'task')
      .where('recurringTask.task_id IN (:...taskIds)', { taskIds })
      .orderBy('recurringTask.created_at', 'DESC')
      .getMany();
  }

  async findOne(userId: string, id: string) {
    const recurringTask = await this.recurringTaskRepository.findOne({ 
      where: { id },
      relations: { task: true }
    });
    if (!recurringTask) {
      throw new NotFoundException('Recurring task not found');
    }

    // Verify the parent task belongs to the user
    if (recurringTask.task.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return recurringTask;
  }

  async update(userId: string, id: string, updateRecurringTaskDto: UpdateRecurringTaskDto) {
    const recurringTask = await this.findOne(userId, id);
    
    if (updateRecurringTaskDto.start_date) {
      recurringTask.start_date = new Date(updateRecurringTaskDto.start_date);
    }
    if (updateRecurringTaskDto.end_date) {
      recurringTask.end_date = new Date(updateRecurringTaskDto.end_date);
    }
    if (updateRecurringTaskDto.repeat_type) {
      recurringTask.repeat_type = updateRecurringTaskDto.repeat_type;
    }
    if (updateRecurringTaskDto.repeat_interval !== undefined) {
      recurringTask.repeat_interval = updateRecurringTaskDto.repeat_interval;
    }
    
    return this.recurringTaskRepository.save(recurringTask);
  }

  async remove(userId: string, id: string) {
    const recurringTask = await this.findOne(userId, id);
    await this.recurringTaskRepository.remove(recurringTask);
    return { message: 'Recurring task deleted successfully' };
  }

  async processRecurringTasks() {
    // This would be called by a cron job to create new task instances
    // For now, this is a placeholder for the recurring task logic
    const recurringTasks = await this.recurringTaskRepository
      .createQueryBuilder('recurringTask')
      .leftJoinAndSelect('recurringTask.task', 'task')
      .where('recurringTask.repeat_type != :repeatType', { repeatType: RepeatType.DOES_NOT_REPEAT })
      .getMany();

    const newTasks = [];
    for (const recurringTask of recurringTasks) {
      // Logic to create new task instances based on repeat pattern
      // This would be implemented with proper date calculations
    }

    return newTasks;
  }
}