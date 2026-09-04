import { Controller, Get, Put, Body, UseGuards, Request, Post } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UpdateUserSettingDto } from './dto/update-user-setting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user-settings')
@UseGuards(JwtAuthGuard)
export class UserSettingsController {
  constructor(private userSettingsService: UserSettingsService) {}

  @Get()
  findOne(@Request() req) {
    return this.userSettingsService.findOne(req.user.id);
  }

  @Put()
  update(@Request() req, @Body() updateUserSettingDto: UpdateUserSettingDto) {
    return this.userSettingsService.update(req.user.id, updateUserSettingDto);
  }

  @Post('reset')
  resetToDefaults(@Request() req) {
    return this.userSettingsService.resetToDefaults(req.user.id);
  }
}