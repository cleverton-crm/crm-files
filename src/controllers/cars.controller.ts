import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CarsService } from '../services/cars.service';

@Controller()
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @MessagePattern('files:cars:upload')
  async uploadFilesClient(@Payload() data: any): Promise<any> {
    return await this.carsService.upload(data);
  }

  @MessagePattern('files:cars:list')
  async listFilesClient(@Payload() data: any): Promise<any> {
    return await this.carsService.listFiles(data);
  }

  @MessagePattern('files:cars:delete')
  async deleteFilesClient(@Payload() data: any): Promise<any> {
    return await this.carsService.deleteFile(data);
  }

  @MessagePattern('files:cars:download')
  async downloadFilesClient(@Payload() data: any): Promise<any> {
    return await this.carsService.download(data);
  }

  @MessagePattern('files:cars:avatar:upload')
  async uploadAvatarClient(@Payload() data: any): Promise<any> {
    return await this.carsService.uploadAvatar(data);
  }

  @MessagePattern('files:cars:avatar:show')
  async showAvatarClient(@Payload() data: any): Promise<any> {
    return await this.carsService.avatar(data);
  }
}
