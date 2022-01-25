import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Core } from 'crm-core';

import { Profile } from '../schemas/profile.schema';
import { extname } from 'path';
import { GridFSData } from '../helpers/gridfs-data';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class ProfileService {
  private readonly profileModel;
  private readonly userModel;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private gridfs: GridFSData,
    private configService: ConfigService
  ) {
    this.profileModel = this.connection.model('Profile');
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
    if(!profile) {return  Core.ResponseError('Профиль не обнаружен, что то пошло не так.',
      HttpStatus.NOT_FOUND,'Not Found Profile')}
    if (profile.avatar.get('id') === undefined) {
      result = await this.uploadAvatarString(data, profile);
    } else {
      try {
        await this.gridfs.delete(profile.avatar.id);
      } catch (e) {
        result = Core.ResponseError('Обновить аватарку не возможно', e.status, e.error);
      }
      result = await this.uploadAvatarString(data, profile);
    }

    const picture = await this.gridfs.getFile(
      profile.avatar.get('id'),
      profile.id,
    );
    const response =
      this.configService.get('url') + profile.id + extname(picture);


    return Core.ResponseDataAsync('Upload avatar', response);
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

}
