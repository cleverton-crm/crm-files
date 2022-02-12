import { Controller } from '@nestjs/common';
import { ClientService } from '../services';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CompanyService } from '../services/company.service';

@Controller()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @MessagePattern('files:company:upload')
  async uploadFilesClient(@Payload() data: any): Promise<any> {
    return await this.companyService.upload(data);
  }

  @MessagePattern('files:company:list')
  async listFilesClient(@Payload() data: any): Promise<any> {
    return await this.companyService.listFiles(data);
  }

  @MessagePattern('files:company:delete')
  async deleteFilesClient(@Payload() data: any): Promise<any> {
    return await this.companyService.deleteFile(data);
  }

  @MessagePattern('files:company:download')
  async downloadFilesClient(@Payload() data: any): Promise<any> {
    return await this.companyService.download(data);
  }

  @MessagePattern('files:company:avatar:upload')
  async uploadAvatarClient(@Payload() data: any): Promise<any> {
    return await this.companyService.uploadAvatar(data);
  }

  @MessagePattern('files:company:avatar:show')
  async showAvatarClient(@Payload() data: any): Promise<any> {
    return await this.companyService.avatar(data);
  }
}
