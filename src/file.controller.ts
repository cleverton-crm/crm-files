import { Controller } from '@nestjs/common';
import { FileService } from './file.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';

@Controller()
export class FileController {
  constructor(private readonly profileService: FileService) {}

  @MessagePattern('files:list')
  async list(@Payload() data: any): Promise<any> {
    return await this.profileService.list();
  }

  @MessagePattern('files:avatar')
  async uploadAvatar(@Payload() data: any): Promise<any> {
    return await this.profileService.uploadAvatarFile(data);
  }

  @MessagePattern('files:avatar:show')
  async showAvatar(@Payload() data: any): Promise<any> {
    return await this.profileService.showAvatar(data);
  }
}
