import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { GridFSData } from '../helpers/gridfs-data';
import { ConfigService } from '../config/config.service';

@Injectable()
export class UploadDataService {
  private readonly CLIENT_AVATAR_PATH = '/avatar';
  private readonly CLIENT_DOCS_PATH = '/documents';

  constructor(private gridfs: GridFSData, private configService: ConfigService) {}

  /**
   *
   * @param data
   * @param schema
   */
  async uploadAttachment(data: any, schema: any, BUCKET_PATH: string) {
    return data.files.forEach((files) => {
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
            url: this.configService.get('url') + schema.id + '/' + files.originalname,
            ext: extname(files.originalname),
            type: 'document',
          },
          BUCKET_PATH + schema.id,
          [files.originalname],
        )
        .then(async (resultFile) => {
          let extFileName;
          for (const [k, v] of Object.entries(JSON.parse(JSON.stringify(resultFile)))) {
            if (k === '_id') {
              let fill = await this.gridfs.getFileOne(
                `${v}`,
                BUCKET_PATH + schema.id,
                schema.id,
                resultFile.metadata.filename,
              );
              resultFile.metadata.url = this.configService.get('url') + schema.id + '/' + resultFile.metadata.filename;
              schema.attachments === null
                ? (schema.attachments = { [`${v}`]: resultFile.metadata })
                : schema.attachments.set(v, resultFile.metadata);
            }
          }
          await schema.save();
        })
        .catch((reason) => console.log());
      return schema.attachments;
    });
  }

  /**
   *
   * @param data
   * @param schema
   */
  async uploadAvatar(data: any, schema: any, BUCKET_PATH: string) {
    return new Promise((resolve, reject) => {
      schema.avatar.clear();
      const collectionAvatar = new Map<string, any>();
      data.files.forEach((bulkFiles) => {
        const img = Buffer.from(bulkFiles.buffer.data).toString('base64');
        const fileNameClient = schema.id + extname(bulkFiles.originalname);
        this.gridfs
          .uploadFileString(
            img,
            fileNameClient,
            bulkFiles.mimetype,
            {
              url: 'https://fmedia.cleverton.ru/' + schema.id + '/' + schema.id + extname(bulkFiles.originalname),
              owner: schema.id,
              filename: bulkFiles.originalname,
              mimetype: bulkFiles.mimetype,
              size: bulkFiles.size,
              ext: extname(bulkFiles.originalname),
              type: 'avatar',
            },
            BUCKET_PATH + schema.id,
            [bulkFiles.originalname],
          )
          .then(async (resultFile) => {
            for (const [k, v] of Object.entries(JSON.parse(JSON.stringify(resultFile)))) {
              if (k === '_id') {
                collectionAvatar.set('id', v);
              }
              collectionAvatar.set(`${k}`, v);
            }
            schema.avatar = collectionAvatar;
            await schema.save();

            const picture = await this.gridfs.getFileOne(
              schema.avatar.get('id'),
              BUCKET_PATH + schema.id,
              schema.id,
              this.CLIENT_AVATAR_PATH,
            );
            const response = this.configService.get('url') + schema.id + '/' + schema.id + extname(picture);
            resolve(response);
          })
          .catch((reason) => {
            reject(reason);
            console.log();
          });
      });
    });
  }

  async showAvatar(schema: any, BUCKET_PATH: string) {
    const avatar = await this.gridfs.getFile(schema.avatar.get('id'), BUCKET_PATH + schema.id, schema.id);
    return 'https://fmedia.cleverton.ru/' + schema.id + '/' + schema.id + extname(avatar);
  }
}
