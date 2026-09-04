import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from '../tasks/task.entity';

export enum RepeatType {
  DOES_NOT_REPEAT = 'does_not_repeat',
  DAILY = 'daily',
  WEEKDAYS = 'weekdays',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

@Entity('recurring_tasks')
export class RecurringTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  task_id: string;

  @Column({
    type: 'enum',
    enum: RepeatType,
    default: RepeatType.DOES_NOT_REPEAT,
  })
  repeat_type: RepeatType;

  @Column({ nullable: true })
  repeat_interval: number;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @ManyToOne(() => Task, task => task.recurring_tasks)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}