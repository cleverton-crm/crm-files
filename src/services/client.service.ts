import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Core } from 'crm-core';
import { GridFSData } from '../helpers/gridfs-data';

@Injectable()
export class ClientService {

  private readonly clientModel;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private gridfs: GridFSData,
  ) {
    this.clientModel = this.connection.model('Clients');

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
        const file = Buffer.alloc(files.buffer.data).toString('base64');
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
}
