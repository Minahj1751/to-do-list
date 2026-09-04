import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(userId: string, createTaskDto: CreateTaskDto) {
    const task = this.taskRepository.create({
      ...createTaskDto,
      user_id: userId,
      status: TaskStatus.PENDING,
    });

    // Check if task is overdue based on due date
    if (createTaskDto.due_date) {
      const dueDate = new Date(createTaskDto.due_date);
      const now = new Date();
      if (dueDate < now) {
        task.status = TaskStatus.OVERDUE;
      }
    }

    return this.taskRepository.save(task);
  }

  async findAll(userId: string, filters?: any) {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.category', 'category')
      .leftJoinAndSelect('task.subtasks', 'subtasks')
      .where('task.user_id = :userId', { userId });

    if (filters?.status) {
      queryBuilder.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters?.priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority: filters.priority });
    }

    if (filters?.category_id) {
      queryBuilder.andWhere('task.category_id = :categoryId', { categoryId: filters.category_id });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.due_date) {
      queryBuilder.andWhere('task.due_date = :dueDate', { dueDate: filters.due_date });
    }

    // Sorting
    const sortField = filters?.sort_by || 'created_at';
    const sortOrder = filters?.sort_order || 'DESC';
    queryBuilder.orderBy(`task.${sortField}`, sortOrder);

    return queryBuilder.getMany();
  }

  async findOne(userId: string, id: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: {
        category: true,
        subtasks: true,
        recurring_tasks: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async update(userId: string, id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(userId, id);

    // Update task status based on due date if changed
    if (updateTaskDto.due_date) {
      const dueDate = new Date(updateTaskDto.due_date);
      const now = new Date();
      if (dueDate < now && task.status !== TaskStatus.COMPLETED) {
        task.status = TaskStatus.OVERDUE;
      }
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(userId: string, id: string) {
    const task = await this.findOne(userId, id);
    await this.taskRepository.remove(task);
    return { message: 'Task deleted successfully' };
  }

  async markComplete(userId: string, id: string) {
    const task = await this.findOne(userId, id);
    task.status = TaskStatus.COMPLETED;
    task.completed_at = new Date();
    return this.taskRepository.save(task);
  }

  async markIncomplete(userId: string, id: string) {
    const task = await this.findOne(userId, id);
    task.status = TaskStatus.PENDING;
    task.completed_at = null as any;
    
    // Check if task should be overdue
    if (task.due_date && new Date(task.due_date) < new Date()) {
      task.status = TaskStatus.OVERDUE;
    }
    
    return this.taskRepository.save(task);
  }

  async getTodayTasks(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.category', 'category')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.due_date >= :today', { today })
      .andWhere('task.due_date < :tomorrow', { tomorrow })
      .orderBy('task.due_date', 'ASC')
      .getMany();
  }

  async getUpcomingTasks(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.category', 'category')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.due_date > :today', { today })
      .andWhere('task.status != :completed', { completed: TaskStatus.COMPLETED })
      .orderBy('task.due_date', 'ASC')
      .getMany();
  }

  async getOverdueTasks(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.category', 'category')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.due_date < :today', { today })
      .andWhere('task.status != :completed', { completed: TaskStatus.COMPLETED })
      .orderBy('task.due_date', 'ASC')
      .getMany();
  }

  async getCompletedTasks(userId: string) {
    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.category', 'category')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.status = :completed', { completed: TaskStatus.COMPLETED })
      .orderBy('task.completed_at', 'DESC')
      .getMany();
  }
}