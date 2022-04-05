import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { GridFSData } from '../helpers/gridfs-data';
import { ConfigService } from 'src/config/config.service';
import { UploadDataService } from './upload.service';
import { BaseUploadService } from './base-upload.service';
import { News, NewsModel } from '../schemas/news.schema';

@Injectable()
export class NewsService extends BaseUploadService {
  protected BUCKET_PATH = 'news_';

  constructor(
    @InjectConnection() protected connection: Connection,
    public gridfs: GridFSData,
    public configService: ConfigService,
    public uploadService: UploadDataService,
  ) {
    super(gridfs, configService, uploadService);
    this.schemaModel = this.connection.model('News') as NewsModel<News>;
    this.logger = new Logger(NewsService.name);
  }
}
