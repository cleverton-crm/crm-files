import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LeadsService } from '../services/leads.service';

@Controller()
export class DealsController {
  constructor(private readonly leadsService: LeadsService) {}

  @MessagePattern('files:leads:upload')
  async uploadFilesClient(@Payload() data: any): Promise<any> {
    return await this.leadsService.upload(data);
  }

  @MessagePattern('files:leads:list')
  async listFilesClient(@Payload() data: any): Promise<any> {
    return await this.leadsService.listFiles(data);
  }

  @MessagePattern('files:leads:delete')
  async deleteFilesClient(@Payload() data: any): Promise<any> {
    return await this.leadsService.deleteFile(data);
  }

  @MessagePattern('files:leads:download')
  async downloadFilesClient(@Payload() data: any): Promise<any> {
    return await this.leadsService.download(data);
  }

  @MessagePattern('files:leads:avatar:upload')
  async uploadAvatarClient(@Payload() data: any): Promise<any> {
    return await this.leadsService.uploadAvatar(data);
  }

  @MessagePattern('files:leads:avatar:show')
  async showAvatarClient(@Payload() data: any): Promise<any> {
    return await this.leadsService.avatar(data);
  }
}
