import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSetting, Theme } from './user-setting.entity';
import { UpdateUserSettingDto } from './dto/update-user-setting.dto';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSetting)
    private userSettingRepository: Repository<UserSetting>,
  ) {}

  async findOne(userId: string) {
    let userSetting = await this.userSettingRepository.findOne({ 
      where: { user_id: userId } 
    });

    if (!userSetting) {
      // Create default settings for new user
      userSetting = this.userSettingRepository.create({
        user_id: userId,
        daily_goal: 5,
        theme: Theme.SYSTEM,
        notifications_enabled: true,
        language: 'en',
      });
      await this.userSettingRepository.save(userSetting);
    }

    return userSetting;
  }

  async update(userId: string, updateUserSettingDto: UpdateUserSettingDto) {
    const userSetting = await this.findOne(userId);
    Object.assign(userSetting, updateUserSettingDto);
    return this.userSettingRepository.save(userSetting);
  }

  async resetToDefaults(userId: string) {
    const userSetting = await this.findOne(userId);
    userSetting.daily_goal = 5;
    userSetting.theme = Theme.SYSTEM;
    userSetting.notifications_enabled = true;
    userSetting.language = 'en';
    return this.userSettingRepository.save(userSetting);
  }
}