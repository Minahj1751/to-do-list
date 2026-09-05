import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { CategoriesModule } from './categories/categories.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { RecurringTasksModule } from './recurring-tasks/recurring-tasks.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UserSettingsModule } from './user-settings/user-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],

      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: Number(configService.get<string>('DATABASE_PORT', '3306')),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD', ''),
        database: configService.get<string>('DATABASE_NAME'),

        entities: [__dirname + '/**/*.entity{.ts,.js}'],

        synchronize:
          configService.get<string>('NODE_ENV') === 'development',
      }),

      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    TasksModule,
    CategoriesModule,
    SubtasksModule,
    RecurringTasksModule,
    AnalyticsModule,
    UserSettingsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }