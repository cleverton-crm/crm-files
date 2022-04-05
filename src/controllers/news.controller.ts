import { Controller } from '@nestjs/common';
import { NewsService } from '../services';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}


  @MessagePattern('files:news:avatar:upload')
  async uploadNewsPicture(@Payload() data: any) {
    return await this.newsService.uploadAvatar(data);
  }

  @MessagePattern('files:news:avatar:show')
  async showNewsPicture(@Payload() data: any): Promise<any> {
    return await this.newsService.avatar(data);
  }
}