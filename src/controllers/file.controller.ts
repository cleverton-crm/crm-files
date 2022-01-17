import { Controller } from '@nestjs/common';
import { FileService } from '../services/file.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @MessagePattern('files:list')
  async list(@Payload() data: any): Promise<any> {
    return await this.fileService.list();
  }

  @MessagePattern('files:avatar')
  async uploadAvatar(@Payload() data: any): Promise<any> {
    return await this.fileService.uploadAvatarFile(data);
  }

  @MessagePattern('files:avatar:show')
  async showAvatar(@Payload() data: any): Promise<any> {
    return await this.fileService.showAvatar(data);
  }

  @MessagePattern('files:clients:upload')
  async uploadClientsDocuments(@Payload() data: any): Promise<any> {
    return await this.fileService.documentsClientsUpload(data);
  }

  @MessagePattern('files:news:picture:upload')
  async uploadNewsPicture(@Payload() data: any) {
    console.log(data);
    return await this.fileService.uploadNewsPicture(data);
  }

  @MessagePattern('files:news:picture:show')
  async showNewsPicture(@Payload() data: any): Promise<any> {
    return await this.fileService.showNewsPicture(data);
  }
}
