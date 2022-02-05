import { Controller } from '@nestjs/common';
import { ClientService } from '../services';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}



  @MessagePattern('files:clients:upload')
  async uploadFiles(@Payload() data: any): Promise<any> {
    return await this.clientService.upload(data);
  }

  @MessagePattern('files:clients:list')
  async listFiles(@Payload() data: any): Promise<any> {
    return await this.clientService.listFiles(data);
  }

  @MessagePattern('files:clients:download')
  async downloadFiles(@Payload() data: any): Promise<any> {
    return await this.clientService.downloadFiles(data);
  }

}
