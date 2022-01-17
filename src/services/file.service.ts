import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Core } from 'crm-core';

import { Profile } from '../schemas/profile.schema';
import { extname } from 'path';
import { GridFSData } from '../helpers/gridfs-data';
import { News } from '../schemas/news.schema';

@Injectable()
export class FileService {
  private readonly profileModel;
  private readonly newsModel;
  private readonly clientModel;
  private readonly userModel;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private gridfs: GridFSData,
  ) {
    this.profileModel = this.connection.model('Profile');
    this.clientModel = this.connection.model('Clients');
    this.newsModel = this.connection.model('News');
  }

  /**
   * Upload avatar max 10
   * @param data
   */
  async uploadAvatarFile(data: { userID: string; files: any }) {
    let result;
    const profile = await this.profileModel
      .findOne({ _id: data.userID })
      .exec();
    if (profile.avatar.get('id') === undefined) {
      result = await this.uploadAvatarString(data, profile);
    } else {
      try {
        await this.gridfs.delete(profile.avatar.id);
      } catch (e) {
        result = Core.ResponseError('Upgrade avatar', e.status, e.error);
      }
      result = await this.uploadAvatarString(data, profile);
    }

    return Core.ResponseDataAsync('Upload avatar', result);
  }

  async showAvatar(data: any) {
    const profile = await this.profileModel.findOne({ _id: data.id }).exec();

    const avatar = await this.gridfs.getFile(
      profile.avatar.get('id'),
      profile.id,
    );
    const response =
      'https://fmedia.cleverton.ru/' + profile.id + extname(avatar);

    return Core.ResponseDataAsync('show avatar', response);
  }

  async list() {
    const avatars = await this.gridfs.getFileList();
    return Core.ResponseDataAsync('show list files', avatars);
  }

  private async uploadAvatarString(data: any, profile: Profile) {
    data.files.forEach((bulkFiles) => {
      const img = Buffer.from(bulkFiles.buffer.data).toString('base64');
      this.gridfs
        .uploadFileString(img, bulkFiles.originalname, bulkFiles.mimetype, {
          url:
            'https://fmedia.cleverton.ru/' +
            profile.id +
            extname(bulkFiles.originalname),
          owner: profile.id,
          filename: bulkFiles.originalname,
          mimetype: bulkFiles.mimetype,
          size: bulkFiles.size,
        })
        .then(async (resultFile) => {
          for (const [k, v] of Object.entries(
            JSON.parse(JSON.stringify(resultFile)),
          )) {
            if (k === '_id') {
              profile.avatar.set('id', v);
            }
            profile.avatar.set(k, v);
          }
          await profile.save();
        })
        .catch((reason) => console.log());
      return profile.avatar;
    });
  }

  private async uploadNewsPictureString(data: any, news: News) {
    data.files.forEach((bulkFiles) => {
      const img = Buffer.from(bulkFiles.buffer.data).toString('base64');
      this.gridfs
        .uploadFileString(img, bulkFiles.originalname, bulkFiles.mimetype, {
          url:
            'https://fmedia.cleverton.ru/' +
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

  async documentsClientsUpload(data: {
    owner: string;
    client: string;
    files: any;
    bucketName: string;
    comment: string;
  }) {
    let clientData, uploaded, resultFile;
    try {
      clientData = await this.clientModel.findOne({ _id: data.client }).exec();
      if (!clientData) {
        throw new NotFoundException('Не найден такой контакт (клиент)');
      }
      uploaded = data.files.forEach((files) => {
        const file = Buffer.from(files.buffer.data).toString('base64');
        this.gridfs
          .uploadFileString(
            file,
            files.originalname,
            files.mimetype,
            {
              owner: data.owner,
              dateCreate: new Date(),
              comments: data.comment,
              filename: files.originalname,
              mimetype: files.mimetype,
              size: files.size,
            },
            data.bucketName,
          )
          .then(async (resultFile) => {
            for (const [k, v] of Object.entries(
              JSON.parse(JSON.stringify(resultFile)),
            )) {
              if (k === '_id') {
                clientData.attachments.set('id', v);
              }
            }
            await clientData.save();
          })
          .catch((reason) => console.log());
        return clientData.attachments;
      });
      resultFile = Core.ResponseDataAsync('add attachment file', uploaded);
    } catch (e) {
      resultFile = Core.ResponseError(e.message, e.status, e.error);
    }

    return resultFile;
  }

  async uploadNewsPicture(data: { newsID: string; files: any }) {
    let result;
    const news = await this.newsModel
      .findOne({ _id: data.newsID })
      .exec();
    if (news.picture.get('id') === undefined) {
      result = await this.uploadNewsPictureString(data, news);
    } else {
      try {
        await this.gridfs.delete(news.picture.id);
      } catch (e) {
        result = Core.ResponseError('Upgrade news picture', e.status, e.error);
      }
      result = await this.uploadNewsPictureString(data, news);
    }

    return Core.ResponseDataAsync('Upload news picture', result);
  }

  async showNewsPicture(data: any) {
    const news = await this.newsModel.findOne({ _id: data.id }).exec();

    const picture = await this.gridfs.getFile(
      news.picture.get('id'),
      news.id,
    );
    const response =
      'https://fmedia.cleverton.ru/' + news.id + extname(picture);

    return Core.ResponseDataAsync('Show picture', response);
  }
}
