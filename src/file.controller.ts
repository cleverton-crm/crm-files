import { Controller, Get, Req } from '@nestjs/common';
import { FileService } from './file.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';

@Controller()
export class FileController {
  constructor(private readonly profileService: FileService) {}

  /**
   * Создаем
   * @param profileData
   * @param req
   */
  @MessagePattern('profile:new')
  async createProfile(
    @Payload() profileData: Core.Profiles.Update,
  ): Promise<any> {
    return await this.profileService.createProfile(profileData);
  }

  @MessagePattern('profile:get:id')
  async createPersona(@Payload() persona: { owner: string }): Promise<any> {
    return await this.profileService.getProfile(persona);
  }

  @MessagePattern('profile:me')
  async findMe(@Payload() data: { id: string }): Promise<any> {
    return await this.profileService.getMeData(data);
  }

  @MessagePattern('profile:avatar')
  async uploadAvatar(@Payload() data: any): Promise<any> {
    return await this.profileService.uploadAvatarFile(data);
  }

  @MessagePattern('profile:avatar:show')
  async showAvatar(@Payload() data: any): Promise<any> {
    return await this.profileService.showAvatar(data);
  }
}
