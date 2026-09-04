import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateSubtaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  is_completed?: boolean;
}