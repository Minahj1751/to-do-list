export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

export interface Task {
  id: string;
  user_id: string;
  category_id?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  start_date?: string;
  due_date?: string;
  due_time?: string;
  notification_time?: string;
  completed_at?: string;
  tags?: string[];
  responsible_person?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  subtasks?: Subtask[];
  recurring_tasks?: RecurringTask[];
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  category_id?: string;
  priority?: TaskPriority;
  start_date?: string;
  due_date?: string;
  due_time?: string;
  notification_time?: string;
  tags?: string[];
  responsible_person?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  category_id?: string;
  priority?: TaskPriority;
  start_date?: string;
  due_date?: string;
  due_time?: string;
  notification_time?: string;
  tags?: string[];
  responsible_person?: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryDto {
  name: string;
  icon?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  icon?: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSubtaskDto {
  title: string;
}

export interface UpdateSubtaskDto {
  title?: string;
  is_completed?: boolean;
}

export enum RepeatType {
  DOES_NOT_REPEAT = 'does_not_repeat',
  DAILY = 'daily',
  WEEKDAYS = 'weekdays',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export interface RecurringTask {
  id: string;
  task_id: string;
  repeat_type: RepeatType;
  repeat_interval?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  task?: Task;
}

export interface CreateRecurringTaskDto {
  task_id: string;
  repeat_type: RepeatType;
  repeat_interval?: number;
  start_date?: string;
  end_date?: string;
}

export interface UpdateRecurringTaskDto {
  repeat_type?: RepeatType;
  repeat_interval?: number;
  start_date?: string;
  end_date?: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  todayProgress: {
    completed: number;
    goal: number;
    percentage: number;
  };
  streak: number;
}

export interface DailyStats {
  date: string;
  completed: number;
}

export interface WeeklyStats {
  startOfWeek: string;
  endOfWeek: string;
  completed: number;
  total: number;
  completionRate: number;
}

export interface MonthlyStats {
  month: string;
  year: number;
  completed: number;
  total: number;
  completionRate: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  icon?: string;
  total: number;
  completed: number;
  completionRate: number;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export interface UserSettings {
  id: string;
  user_id: string;
  daily_goal: number;
  theme: Theme;
  notifications_enabled: boolean;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserSettingsDto {
  daily_goal?: number;
  theme?: Theme;
  notifications_enabled?: boolean;
  language?: string;
}