import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsDateString } from 'class-validator';
import { TaskPriority } from '../task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category_id?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  due_date?: string;

  @IsDateString()
  @IsOptional()
  due_time?: string;

  @IsDateString()
  @IsOptional()
  notification_time?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  responsible_person?: string;
}