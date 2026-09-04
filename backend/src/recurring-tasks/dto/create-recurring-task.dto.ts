import { IsDateString, IsEnum, IsOptional, IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { RepeatType } from '../recurring-task.entity';

export class CreateRecurringTaskDto {
  @IsString()
  @IsNotEmpty()
  task_id!: string;

  @IsEnum(RepeatType)
  repeat_type!: RepeatType;

  @IsNumber()
  @IsOptional()
  repeat_interval?: number;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;
}