import { Controller } from '@nestjs/common';
import { ClientService } from '../services';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}



  @MessagePattern('files:clients:upload')
  async uploadClientsDocuments(@Payload() data: any): Promise<any> {
    return await this.clientService.documentsClientsUpload(data);
  }

}
