import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Core } from 'crm-core';
import { GridFSPromise } from 'gridfs-promise';
import { Profile } from './schemas/profile.schema';

@Injectable()
export class FileService {
  private readonly profileModel;
  private readonly userModel;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private gridfs: GridFSPromise,
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
    let result;
    const profile = await this.profileModel.findOne({ _id: data.id }).exec();

    const avatar = await this.gridfs.getFile(
      profile.avatar.get('id'),
      profile.avatar.get('filename'),
    );
    return Core.ResponseDataAsync('show avatar', avatar);
  }




  private async uploadAvatarString(data: any, profile: Profile) {
    data.files.forEach((bulkFiles) => {
      const img = Buffer.from(bulkFiles.buffer.data).toString('base64');
      this.gridfs
        .uploadFileString(img, bulkFiles.originalname, bulkFiles.mimetype, {
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
