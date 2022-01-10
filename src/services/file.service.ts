import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Core } from 'crm-core';

import { Profile } from '../schemas/profile.schema';
import { extname } from 'path';
import { GridFSData } from '../helpers/gridfs-data';

@Injectable()
export class FileService {
  private readonly profileModel;
  private readonly clientModel;
  private readonly userModel;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private gridfs: GridFSData,
  ) {
    this.profileModel = this.connection.model('Profile');
    this.clientModel = this.connection.model('Clients');
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

  async documentsClientsUpload(data: {
    client: string;
    files: any;
    bucketName: string;
  }) {
    let clientData = await this.clientModel
      .findOne({ _id: data.client })
      .exec();
    const respo = data.files.forEach((files) => {
      const file = Buffer.from(files.buffer.data).toString('base64');
      this.gridfs
        .uploadFileString(
          file,
          files.originalname,
          files.mimetype,
          {
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
    return Core.ResponseDataAsync('add attachment file', respo);
  }
}
