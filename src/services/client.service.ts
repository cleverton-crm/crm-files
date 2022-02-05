import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Core } from 'crm-core';
import { GridFSData } from '../helpers/gridfs-data';
import { extname } from 'path';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class ClientService {
  private logger: Logger
  private readonly clientModel;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private gridfs: GridFSData,
    private configService: ConfigService
  ) {
    this.clientModel = this.connection.model('Clients');
    this.logger = new Logger(ClientService.name);
  }

  async upload(data: {
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
              url:'',
              ext: extname(files.originalname)
            },
            data.bucketName,
          )
          .then(async (resultFile) => {
            let extFileName
            for (const [k, v] of Object.entries(
              JSON.parse(JSON.stringify(resultFile)),
            )) {


              if (k === '_id') {
               let fill = await this.gridfs.getFileOne(`${v}`,'client_' + clientData.id,clientData.id,resultFile.metadata.filename)
                resultFile.metadata.url = this.configService.get('url') +  clientData.id + '/' + resultFile.metadata.filename;
                clientData.attachments === null
                  ? clientData.attachments = {[`${v}`]: resultFile.metadata}
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

  async listFiles( data: {id: string, owner:any }) {
    const bucket = 'client_'+ data.id
    console.log(bucket);
    const result = Core.ResponseDataAsync('add attachment file', await this.gridfs.getFileList(bucket));
    return result
  }


  async downloadFiles(data: {id: string, file: string, owner:any }) {
    console.log(data);
    const file = await this.gridfs.getFileOne(data.file,'client_' + data.id,data.id)
    const result = Core.ResponseDataAsync('add attachment file', file);
    return result
  }
}
