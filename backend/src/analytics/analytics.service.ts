import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../tasks/task.entity';
import { Category } from '../categories/category.entity';
import { UserSetting } from '../user-settings/user-setting.entity';

export interface DailyStats {
  date: string;
  completed: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  icon?: string;
  total: number;
  completed: number;
  completionRate: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(UserSetting)
    private userSettingRepository: Repository<UserSetting>,
  ) {}

  async getDashboard(userId: string) {
    const totalTasks = await this.taskRepository.count({ where: { user_id: userId } });
    const completedTasks = await this.taskRepository.count({ 
      where: { user_id: userId, status: TaskStatus.COMPLETED } 
    });
    const pendingTasks = await this.taskRepository.count({ 
      where: { user_id: userId, status: TaskStatus.PENDING } 
    });
    const overdueTasks = await this.taskRepository.count({ 
      where: { user_id: userId, status: TaskStatus.OVERDUE } 
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Get today's progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCompleted = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.status = :status', { status: TaskStatus.COMPLETED })
      .andWhere('task.completed_at >= :today', { today })
      .andWhere('task.completed_at < :tomorrow', { tomorrow })
      .getCount();

    // Get user's daily goal
    const userSetting = await this.userSettingRepository.findOne({ 
      where: { user_id: userId } 
    });
    const dailyGoal = userSetting?.daily_goal || 5;

    const todayProgress = {
      completed: todayCompleted,
      goal: dailyGoal,
      percentage: Math.round((todayCompleted / dailyGoal) * 100),
    };

    // Calculate streak
    const streak = await this.calculateStreak(userId, dailyGoal);

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      todayProgress,
      streak,
    };
  }

  async getDailyStats(userId: string, days: number = 7) {
    const stats: DailyStats[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const completed = await this.taskRepository
        .createQueryBuilder('task')
        .where('task.user_id = :userId', { userId })
        .andWhere('task.status = :status', { status: TaskStatus.COMPLETED })
        .andWhere('task.completed_at >= :date', { date })
        .andWhere('task.completed_at < :nextDate', { nextDate })
        .getCount();

      stats.push({
        date: date.toISOString().split('T')[0],
        completed,
      });
    }

    return stats.reverse();
  }

  async getWeeklyStats(userId: string) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const completed = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.status = :status', { status: TaskStatus.COMPLETED })
      .andWhere('task.completed_at >= :startOfWeek', { startOfWeek })
      .andWhere('task.completed_at < :endOfWeek', { endOfWeek })
      .getCount();

    const total = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.created_at >= :startOfWeek', { startOfWeek })
      .andWhere('task.created_at < :endOfWeek', { endOfWeek })
      .getCount();

    return {
      startOfWeek: startOfWeek.toISOString().split('T')[0],
      endOfWeek: endOfWeek.toISOString().split('T')[0],
      completed,
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  async getMonthlyStats(userId: string) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const completed = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.status = :status', { status: TaskStatus.COMPLETED })
      .andWhere('task.completed_at >= :startOfMonth', { startOfMonth })
      .andWhere('task.completed_at < :endOfMonth', { endOfMonth })
      .getCount();

    const total = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.created_at >= :startOfMonth', { startOfMonth })
      .andWhere('task.created_at < :endOfMonth', { endOfMonth })
      .getCount();

    return {
      month: today.toLocaleString('default', { month: 'long' }),
      year: today.getFullYear(),
      completed,
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  async getCategoryStats(userId: string) {
    const categories = await this.categoryRepository.find({ 
      where: { user_id: userId } 
    });

    const stats: CategoryStats[] = [];
    for (const category of categories) {
      const total = await this.taskRepository.count({ 
        where: { category_id: category.id } 
      });
      const completed = await this.taskRepository.count({ 
        where: { category_id: category.id, status: TaskStatus.COMPLETED } 
      });

      stats.push({
        categoryId: category.id,
        categoryName: category.name,
        icon: category.icon,
        total,
        completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }

    return stats;
  }

  private async calculateStreak(userId: string, dailyGoal: number): Promise<number> {
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (true) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const completed = await this.taskRepository
        .createQueryBuilder('task')
        .where('task.user_id = :userId', { userId })
        .andWhere('task.status = :status', { status: TaskStatus.COMPLETED })
        .andWhere('task.completed_at >= :currentDate', { currentDate })
        .andWhere('task.completed_at < :nextDate', { nextDate })
        .getCount();

      if (completed >= dailyGoal) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}