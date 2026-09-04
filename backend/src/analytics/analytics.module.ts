import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Task } from '../tasks/task.entity';
import { Category } from '../categories/category.entity';
import { UserSetting } from '../user-settings/user-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Category, UserSetting])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}