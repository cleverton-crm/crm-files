import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Core } from 'crm-core';
import { GridFSPromise } from 'gridfs-promise';
import { GridFsMulterConfigService } from './config/multer-config.service';
import { Profile } from './schemas/profile.schema';

@Injectable()
export class FileService {
  private readonly profileModel;
  private readonly userModel;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private gridfs: GridFSPromise,
    private fileName: GridFsMulterConfigService,
  ) {
    this.profileModel = this.connection.model('Profile');
    this.userModel = this.connection.model('User');
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

  /**
   * Создаем профиль простого пользователя
   * @param data
   */
  async createProfileEmpty(data: Profiles.Params.EmptyData) {
    const profile = new this.profileModel({
      owner: data.owner,
      email: data.email,
    });
    await profile.save();
    return Core.ResponseDataAsync('Create profile', profile);
  }

  /**
   * Create
   * @param persona
   */
  async createProfilePersona(persona: Profiles.Params.CreatePersona) {
    const profile = new this.profileModel({ ...persona, type: 'user' });
    await profile.save();
    return Core.ResponseDataAsync('Create persona', profile);
  }

  async createProfileDoctor(doctor: Profiles.Params.CreatePersona) {
    const profile = new this.profileModel({ ...doctor, type: 'doctor' });
    console.log(profile);
    return Core.ResponseDataAsync('Create doctor', profile);
  }

  async getMeData(data: { id: string }) {
    let result;
    const profile = await this.profileModel.findOne({ _id: data.id });
    try {
      result = {
        statusCode: HttpStatus.OK,
        message: 'Congratulations! You has been refresh token',
        data: profile,
      };
    } catch (e) {
      result = {
        statusCode: e.status,
        message: e.message,
        errors: e.error,
      };
    }

    return Core.ResponseDataAsync('My profile', profile);
  }

  async uploadAvatar(file: string) {}

  async getProfile(persona: { owner: string }) {
    const profile = await this.profileModel.findOne({ owner: persona.owner });
    return profile;
  }

  async createProfile(data: Core.Profiles.Update) {
    console.log(data);
    const profile = await this.profileModel
      .findOneAndUpdate({ _id: data.id }, data, { new: true })
      .exec();
    console.log('Profile ', profile);
    return Core.ResponseDataAsync('Добавлены данные', profile, 200);
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
