import { IsNumber, IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';
import { Theme } from '../user-setting.entity';

export class UpdateUserSettingDto {
  @IsNumber()
  @IsOptional()
  daily_goal?: number;

  @IsEnum(Theme)
  @IsOptional()
  theme?: Theme;

  @IsBoolean()
  @IsOptional()
  notifications_enabled?: boolean;

  @IsString()
  @IsOptional()
  language?: string;
}