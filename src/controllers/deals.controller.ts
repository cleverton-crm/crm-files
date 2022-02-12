import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DealsService } from '../services/deals.service';

@Controller()
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @MessagePattern('files:deals:upload')
  async uploadFilesClient(@Payload() data: any): Promise<any> {
    return await this.dealsService.upload(data);
  }

  @MessagePattern('files:deals:list')
  async listFilesClient(@Payload() data: any): Promise<any> {
    return await this.dealsService.listFiles(data);
  }

  @MessagePattern('files:deals:delete')
  async deleteFilesClient(@Payload() data: any): Promise<any> {
    return await this.dealsService.deleteFile(data);
  }

  @MessagePattern('files:deals:download')
  async downloadFilesClient(@Payload() data: any): Promise<any> {
    return await this.dealsService.download(data);
  }

  @MessagePattern('files:deals:avatar:upload')
  async uploadAvatarClient(@Payload() data: any): Promise<any> {
    return await this.dealsService.uploadAvatar(data);
  }

  @MessagePattern('files:deals:avatar:show')
  async showAvatarClient(@Payload() data: any): Promise<any> {
    return await this.dealsService.avatar(data);
  }
}
