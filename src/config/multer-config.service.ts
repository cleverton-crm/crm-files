import { Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { GridFsStorage } from 'multer-gridfs-storage';
import { getBoolean } from '../helpers/global';

@Injectable()
export class GridFsMulterConfigService implements MulterOptionsFactory {
  // @ts-ignore
  private readonly gridFsStorage: GridFsStorage;
  constructor() {
    let urlMongo;
    const replica = process.env.MONGO_REPLICA;
    const auth = process.env.MONGO_ENABLE;
    const user = process.env.MONGO_ROOT_USER;
    const password = process.env.MONGO_ROOT_PASSWORD;
    const host1 = process.env.MONGO_HOST1;
    const host2 = process.env.MONGO_HOST2;
    const host3 = process.env.MONGO_HOST3;
    const base = process.env.MONGO_DATABASE;
    const port1 = process.env.MONGO_PORT1;
    const port2 = process.env.MONGO_PORT2;
    const port3 = process.env.MONGO_PORT3;

    if (getBoolean(replica)) {
      urlMongo = `mongodb://${user}:${password}@${host1}:${port1},${host2}:${port2},${host3}:${port3}/${base}?authSource=admin`;
    } else {
      urlMongo = `mongodb://${user}:${password}@${host1}:${port1}/${base}?authSource=admin`;
    }

    this.gridFsStorage = new GridFsStorage({
      url: urlMongo,
      options: { useUnifiedTopology: true },
      file: (req, file) => {
        return new Promise((resolve, reject) => {
          const filename = file.originalname.trim();
          const fileInfo = {
            filename: filename,
          };
          resolve(fileInfo);
        });
      },
    });
  }

  createMulterOptions(): MulterModuleOptions {
    return {
      storage: this.gridFsStorage,
    };
  }
}
