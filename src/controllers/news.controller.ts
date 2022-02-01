import { Controller } from '@nestjs/common';
import { NewsService } from '../services';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}


  @MessagePattern('files:news:picture:upload')
  async uploadNewsPicture(@Payload() data: any) {
    console.log(data);
    return await this.newsService.uploadNewsPicture(data);
  }

  @MessagePattern('files:news:picture:show')
  async showNewsPicture(@Payload() data: any): Promise<any> {
    return await this.newsService.showNewsPicture(data);
  }
}