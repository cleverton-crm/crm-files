import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProfileService } from '../services';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @MessagePattern('files:profile:upload')
  async uploadFilesClient(@Payload() data: any): Promise<any> {
    return await this.profileService.upload(data);
  }

  @MessagePattern('files:profile:list')
  async listFilesClient(@Payload() data: any): Promise<any> {
    return await this.profileService.listFiles(data);
  }

  @MessagePattern('files:profile:delete')
  async deleteFilesClient(@Payload() data: any): Promise<any> {
    return await this.profileService.deleteFile(data);
  }

  @MessagePattern('files:profile:download')
  async downloadFilesClient(@Payload() data: any): Promise<any> {
    return await this.profileService.download(data);
  }

  @MessagePattern('files:profile:avatar:upload')
  async uploadAvatarClient(@Payload() data: any): Promise<any> {
    return await this.profileService.uploadAvatar(data);
  }

  @MessagePattern('files:profile:avatar:show')
  async showAvatarClient(@Payload() data: any): Promise<any> {
    return await this.profileService.avatar(data);
  }
}
