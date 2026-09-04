import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurringTasksService } from './recurring-tasks.service';
import { RecurringTasksController } from './recurring-tasks.controller';
import { RecurringTask } from './recurring-task.entity';
import { Task } from '../tasks/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecurringTask, Task])],
  controllers: [RecurringTasksController],
  providers: [RecurringTasksService],
  exports: [RecurringTasksService],
})
export class RecurringTasksModule {}