import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AnalyticsService, DailyStats, CategoryStats } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@Request() req) {
    return this.analyticsService.getDashboard(req.user.id);
  }

  @Get('daily')
  getDailyStats(@Request() req, @Query('days') days?: string): Promise<DailyStats[]> {
    return this.analyticsService.getDailyStats(req.user.id, days ? parseInt(days) : 7);
  }

  @Get('weekly')
  getWeeklyStats(@Request() req) {
    return this.analyticsService.getWeeklyStats(req.user.id);
  }

  @Get('monthly')
  getMonthlyStats(@Request() req) {
    return this.analyticsService.getMonthlyStats(req.user.id);
  }

  @Get('categories')
  getCategoryStats(@Request() req): Promise<CategoryStats[]> {
    return this.analyticsService.getCategoryStats(req.user.id);
  }
}