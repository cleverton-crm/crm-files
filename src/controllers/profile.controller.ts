import { Controller } from '@nestjs/common';
import { ProfileService } from '../services/';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

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
