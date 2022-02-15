import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { GridFSData } from '../helpers/gridfs-data';
import { ConfigService } from 'src/config/config.service';
import { UploadDataService } from './upload.service';
import { Companies } from '../schemas/company.schema';
import { BaseUploadService } from './base-upload.service';

@Injectable()
export class CompanyService extends BaseUploadService {
  protected BUCKET_PATH = 'company_';

  constructor(
    @InjectConnection() protected connection: Connection,
    public gridfs: GridFSData,
    public configService: ConfigService,
    public uploadService: UploadDataService,
  ) {
    super(gridfs, configService, uploadService);
    this.schemaModel = this.connection.model('Companies') as Model<Companies>;
    this.logger = new Logger(CompanyService.name);
  }
}
