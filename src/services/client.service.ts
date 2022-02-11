import { HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Core } from 'crm-core';
import { GridFSData } from '../helpers/gridfs-data';
import { extname } from 'path';
import { ConfigService } from 'src/config/config.service';
import { Profile } from '../schemas/profile.schema';
import { Clients } from 'src/schemas/client.schema';

@Injectable()
export class ClientService {
  private logger: Logger;
  private readonly clientModel;
  private CLIENT_PATH = 'client_';
  private readonly CLIENT_AVATAR_PATH = '/avatar';
  private readonly CLIENT_DOCS_PATH = '/documents';

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private gridfs: GridFSData,
    private configService: ConfigService,
  ) {
    this.clientModel = this.connection.model('Clients');
    this.logger = new Logger(ClientService.name);
  }

  async upload(data: { owner: string; client: string; files: any; bucketName: string; comment: string }) {
    let clientData, uploaded, resultFile;
    try {
      clientData = await this.clientModel.findOne({ _id: data.client }).exec();
      if (!clientData) {
        throw new NotFoundException('Не найден такой контакт (клиент)');
      }
      uploaded = data.files.forEach((files) => {
        const file = Buffer.from(files.buffer.data).toString('base64');
        //const picture = await this.gridfs.getFileName();
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
              url: '',
              ext: extname(files.originalname),
              type: 'document',
            },
            data.bucketName,
          )
          .then(async (resultFile) => {
            let extFileName;
            for (const [k, v] of Object.entries(JSON.parse(JSON.stringify(resultFile)))) {
              if (k === '_id') {
                let fill = await this.gridfs.getFileOne(
                  `${v}`,
                  this.CLIENT_PATH + clientData.id,
                  clientData.id,
                  resultFile.metadata.filename,
                );
                resultFile.metadata.url =
                  this.configService.get('url') + clientData.id + '/' + resultFile.metadata.filename;
                clientData.attachments === null
                  ? (clientData.attachments = { [`${v}`]: resultFile.metadata })
                  : clientData.attachments.set(v, resultFile.metadata);
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

  async listFiles(data: { id: string; owner: any }) {
    const bucket = 'client_' + data.id;

    const result = Core.ResponseDataAsync('add attachment file', await this.gridfs.getFileList(bucket));
    return result;
  }

  async downloadFiles(data: { id: string; file: string; owner: any }) {
    const file = await this.gridfs.getFileOne(data.file, this.CLIENT_PATH + data.id, data.id);
    const url = this.configService.get('url') + data.id + `/` + file;

    const result = Core.ResponseDataAsync('add attachment file', url);
    return result;
  }

  async uploadAvatarFile(data: { owner: string; files: any; id: string }) {
    let result, deletedFile;
    const clientData = await this.clientModel.findOne({ _id: data.id }).exec();

    const clientFolder = this.CLIENT_PATH + clientData.id;
    const clientAvatar = clientData.id + this.CLIENT_AVATAR_PATH;

    if (!clientData) {
      return Core.ResponseError('Объект не обнаружен, что то пошло не так.', HttpStatus.NOT_FOUND, 'Not Found Object');
    }
    if (clientData.avatar.get('id') === undefined) {
      result = await this.uploadAvatarString(data, clientData);
    } else {
      try {
        const fileDataClient = await this.gridfs.getObject(clientData.avatar.get('id'), clientFolder);
        const avatar = JSON.parse(JSON.stringify(fileDataClient));

        if (Object.entries(avatar).length !== 0) {
          await this.gridfs.delete(clientData.avatar.get('id'), clientFolder);
        }
      } catch (e) {
        this.logger.error('Нет данных в архиве. Будут созданы новый');
      }

      result = await this.uploadAvatarString(data, clientData);
    }

    return Core.ResponseData('Upload avatar', result);
  }

  async showAvatar(data: { owner: string; id: string }) {
    const client = await this.clientModel.findOne({ _id: data.id }).exec();

    const avatar = await this.gridfs.getFile(client.avatar.get('id'), this.CLIENT_PATH + client.id, client.id);
    const response = 'https://fmedia.cleverton.ru/' + client.id + '/' + client.id + extname(avatar);

    return Core.ResponseDataAsync('show avatar', response);
  }

  private async uploadAvatarString(data: any, client: Clients) {
    return new Promise((resolve, reject) => {
      const clientFolder = this.CLIENT_PATH + client.id;
      const clientAvatar = client.id + this.CLIENT_AVATAR_PATH;
      client.avatar.clear();
      const collectionAvatar = new Map<string, any>();
      data.files.forEach((bulkFiles) => {
        const img = Buffer.from(bulkFiles.buffer.data).toString('base64');
        const fileNameClient = client.id + extname(bulkFiles.originalname);
        this.gridfs
          .uploadFileString(
            img,
            fileNameClient,
            bulkFiles.mimetype,
            {
              url: 'https://fmedia.cleverton.ru/' + client.id + '/' + client.id + extname(bulkFiles.originalname),
              owner: client.id,
              filename: bulkFiles.originalname,
              mimetype: bulkFiles.mimetype,
              size: bulkFiles.size,
              type: 'avatar',
            },
            'client_' + client.id,
            [bulkFiles.originalname],
          )
          .then(async (resultFile) => {
            for (const [k, v] of Object.entries(JSON.parse(JSON.stringify(resultFile)))) {
              if (k === '_id') {
                collectionAvatar.set('id', v);
              }
              collectionAvatar.set(`${k}`, v);
            }
            client.avatar = collectionAvatar;
            await client.save();

            const picture = await this.gridfs.getFileOne(
              client.avatar.get('id'),
              clientFolder,
              client.id,
              this.CLIENT_AVATAR_PATH,
            );
            const response = this.configService.get('url') + client.id + '/' + client.id + extname(picture);
            resolve(response);
          })
          .catch((reason) => {
            reject(reason);
            console.log();
          });
      });
    });
  }
}
