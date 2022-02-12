import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSData } from '../helpers/gridfs-data';
import { ConfigService } from 'src/config/config.service';
import { UploadDataService } from './upload.service';
import { BaseUploadService } from './base-upload.service';

@Injectable()
export class CarsService extends BaseUploadService {
  protected BUCKET_PATH = 'cars_';

  constructor(
    @InjectConnection() protected connection: Connection,
    public gridfs: GridFSData,
    public configService: ConfigService,
    public uploadService: UploadDataService,
  ) {
    super(gridfs, configService, uploadService);
    this.schemaModel = this.connection.model('Cars');
    this.logger = new Logger(CarsService.name);
  }
}
