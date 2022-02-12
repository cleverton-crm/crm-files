import { Controller } from '@nestjs/common';
import { ClientService } from '../services';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @MessagePattern('files:clients:upload')
  async uploadFilesClient(@Payload() data: any): Promise<any> {
    return await this.clientService.upload(data);
  }

  @MessagePattern('files:clients:list')
  async listFilesClient(@Payload() data: any): Promise<any> {
    return await this.clientService.listFiles(data);
  }

  @MessagePattern('files:clients:delete')
  async deleteFilesClient(@Payload() data: any): Promise<any> {
    return await this.clientService.deleteFile(data);
  }

  @MessagePattern('files:clients:download')
  async downloadFilesClient(@Payload() data: any): Promise<any> {
    return await this.clientService.download(data);
  }

  @MessagePattern('files:client:avatar:upload')
  async uploadAvatarClient(@Payload() data: any): Promise<any> {
    return await this.clientService.uploadAvatar(data);
  }

  @MessagePattern('files:client:avatar:show')
  async showAvatarClient(@Payload() data: any): Promise<any> {
    return await this.clientService.avatar(data);
  }
}
