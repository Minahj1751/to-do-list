import { IsDateString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { RepeatType } from '../recurring-task.entity';

export class UpdateRecurringTaskDto {
  @IsEnum(RepeatType)
  @IsOptional()
  repeat_type?: RepeatType;

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