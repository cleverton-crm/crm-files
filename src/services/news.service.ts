import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Core } from 'crm-core';

import { Profile } from '../schemas/profile.schema';
import { extname } from 'path';
import { GridFSData } from '../helpers/gridfs-data';
import { News } from '../schemas/news.schema';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class NewsService {

  private readonly newsModel;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private gridfs: GridFSData,
    private configService: ConfigService
  ) {

    this.newsModel = this.connection.model('News');
  }



  private async uploadNewsPictureString(data: any, news: News) {
    data.files.forEach((bulkFiles) => {
      const img = Buffer.from(bulkFiles.buffer.data).toString('base64');
      this.gridfs
        .uploadFileString(img, bulkFiles.originalname, bulkFiles.mimetype, {
          url:
            this.configService.get('url') +
            news.id +
            extname(bulkFiles.originalname),
          owner: news.id,
          filename: bulkFiles.originalname,
          mimetype: bulkFiles.mimetype,
          size: bulkFiles.size,
        })
        .then(async (resultFile) => {
          for (const [k, v] of Object.entries(
            JSON.parse(JSON.stringify(resultFile)),
          )) {
            if (k === '_id') {
              news.picture.set('id', v);
            }
            news.picture.set(k, v);
          }
          await news.save();
        })
        .catch((reason) => console.log());
      return news.picture;
    });
  }

  async uploadNewsPicture(data: { newsID: string; files: any }) {
    let result;
    const news = await this.newsModel
      .findOne({ _id: data.newsID })
      .exec();
    if(!news) { return  Core.ResponseError('Не найдена новость с таким ID',
      HttpStatus.NOT_FOUND, 'Not found news');}
    if (news.picture.get('id') === undefined) {
      result = await this.uploadNewsPictureString(data, news);

    } else {
      try {
        await this.gridfs.delete(news.picture.id);
      } catch (e) {
        result = Core.ResponseError('Error! Delete news picture not allowed', e.status, e.error);
      }
      result = await this.uploadNewsPictureString(data, news);
    }

    const picture = await this.gridfs.getFile(
      news.picture.get('id'),
      news.id,
    );
    const response =
      this.configService.get('url') + news.id + extname(picture);

    return Core.ResponseDataAsync('Upload news picture', response);
  }

  async showNewsPicture(data: any) {
    const news = await this.newsModel.findOne({ _id: data.id }).exec();

    const picture = await this.gridfs.getFile(
      news.picture.get('id'),
      news.id,
    );
    const response =
      this.configService.get('url') + news.id + extname(picture);

    return Core.ResponseDataAsync('Show picture', response);
  }
}
