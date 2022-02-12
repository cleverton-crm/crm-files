import { HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { Core } from 'crm-core';
import { Connection, Model } from 'mongoose';
import { GridFSData } from '../helpers/gridfs-data';
import { ConfigService } from '../config/config.service';
import { UploadDataService } from './upload.service';

export class BaseUploadService {
  protected logger: Logger;
  protected schemaModel: Model<any>;
  protected BUCKET_PATH;
  private readonly CLIENT_AVATAR_PATH = '/avatar';
  private readonly CLIENT_DOCS_PATH = '/documents';

  constructor(
    public gridfs: GridFSData,
    public configService: ConfigService,
    public uploadService: UploadDataService,
  ) {}

  /**
   * Uploading data to the database and streaming the file to the upload folder
   * @param data
   */
  async upload(data: { owner: string; client: string; files: any; bucketName: string; comment: string }) {
    let schema, uploaded, resultFile;
    try {
      schema = await this.schemaModel.findOne({ _id: data.client }).exec();
      if (!schema) {
        throw new NotFoundException('Не найден такой объект');
      }
      uploaded = await this.uploadService.uploadAttachment(data, schema, this.BUCKET_PATH);
      resultFile = Core.ResponseDataAsync('Добавлен новый фаил', uploaded);
    } catch (e) {
      resultFile = Core.ResponseError(e.message, e.status, e.error);
    }

    return resultFile;
  }

  /**
   * Delete file from base
   * @param data
   */
  async deleteFile(data: { id: string; file: string; owner: any }) {
    let result, schema, fileContent;
    try {
      schema = await this.schemaModel.findOne({ _id: data.id }).exec();
      if (!schema) {
        throw new NotFoundException('Не найден такой объект');
      } else {
        const fileDataClient = await this.gridfs.getObject(data.file, this.BUCKET_PATH + data.id);
        if (!fileDataClient) throw new NotFoundException('Не найден фаил');
        fileContent = JSON.parse(JSON.stringify(fileDataClient));
        if (Object.entries(fileContent).length !== 0) {
          await this.gridfs.delete(data.file, this.BUCKET_PATH + data.id);
        }
      }

      result = Core.ResponseDataAsync('Фаил был удален', fileContent);
    } catch (e) {
      this.logger.error('Нет нет такого файла  ' + e);
      result = Core.ResponseError(e.message, e.status, e.error);
    }

    return result;
  }

  /**
   * List all files
   * @param data
   */
  async listFiles(data: { id: string; owner: any }) {
    let result;
    try {
      const bucket = this.BUCKET_PATH + data.id;
      const list = await this.gridfs.getFileList(bucket);
      result = Core.ResponseDataAsync('Список всех файлов', list);
    } catch (e) {
      result = Core.ResponseData(e.message, [], e.status, e.error);
    }

    return result;
  }

  /**
   * Download selected files
   * @param data
   */
  async download(data: { id: string; file: string; owner: any }) {
    let result;
    try {
      const schema = await this.schemaModel.findOne({ _id: data.id }).exec();
      if (!schema) {
        throw new NotFoundException('Объект отсутвует в системе');
      } else {
        const file = await this.gridfs.getFileOne(data.file, this.BUCKET_PATH + data.id, data.id);
        if (!file) throw new NotFoundException('Файл отсутвует');
        const url = this.configService.get('url') + data.id + `/` + file;
        result = Core.ResponseDataAsync('Ссылка на фаил', url);
      }
    } catch (e) {
      result = Core.ResponseError(e.response.message, e.response.statusCode, e.response.error);
    }

    return result;
  }

  /**
   * Upload avatar
   * @param data
   */
  async uploadAvatar(data: { owner: string; files: any; id: string }) {
    let result, resultUpload;
    try {
      const schema = await this.schemaModel.findOne({ _id: data.id }).exec();
      if (!schema) {
        throw new NotFoundException('Объект отсутвует в системе');
      } else {
        const clientFolder = this.BUCKET_PATH + schema.id;
        if (!schema) {
          return Core.ResponseError(
            'Объект не обнаружен, что то пошло не так.',
            HttpStatus.NOT_FOUND,
            'Not Found Object',
          );
        }
        if (schema.avatar.get('id') === undefined) {
          result = await this.uploadService.uploadAvatar(data, schema, this.BUCKET_PATH);
        } else {
          try {
            const fileDataClient = await this.gridfs.getObject(schema.avatar.get('id'), clientFolder);
            const avatar = JSON.parse(JSON.stringify(fileDataClient));
            if (Object.entries(avatar).length !== 0) {
              await this.gridfs.delete(schema.avatar.get('id'), clientFolder);
            }
          } catch (e) {
            this.logger.error('Нет данных в архиве. Будет создан новый');
          }
          resultUpload = await this.uploadService.uploadAvatar(data, schema, this.BUCKET_PATH);
        }
        result = Core.ResponseData('Изображение загружено!', resultUpload);
      }
    } catch (e) {
      result = Core.ResponseError(e.response.message, e.response.statusCode, e.response.error);
    }
    return result;
  }

  /**
   * Avatar
   * @param data
   */
  async avatar(data: { owner: string; id: string }) {
    let result;
    try {
      const schema = await this.schemaModel.findOne({ _id: data.id }).exec();
      if (!schema) {
        throw new NotFoundException('Нет такой клиента');
      } else {
        const response = await this.uploadService.showAvatar(schema, this.BUCKET_PATH);
        result = Core.ResponseData('Ссылка на изображение', response);
      }
    } catch (e) {
      result = Core.ResponseError(e.response.message, e.response.statusCode, e.response.error);
    }
    return result;
  }
}
