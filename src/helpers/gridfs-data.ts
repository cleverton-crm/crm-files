import { ObjectID, UUID } from 'bson';
import * as fs from 'fs';
import { Document, GridFSBucket, GridFSBucketReadStream, MongoClient, MongoClientOptions } from 'mongodb';
import * as path from 'path';
import { Readable } from 'stream';
import { mkdirSync } from 'fs';
import { NotFoundException } from '@nestjs/common';

export interface IGridFSObject {
  _id: ObjectID;
  length: number;
  chunkSize: number;
  uploadDate: Date;
  md5?: string;
  filename: string;
  contentType?: string | undefined;
  metadata?: Document | undefined;
}

export class GridFSData {
  set ClientConnection(value: MongoClient) {
    this._ClientConnection = value;
  }

  get connection(): MongoClient | null {
    return this._ClientConnection;
  }

  private databaseName: string;

  private readonly connectionUrl: string | undefined;
  private readonly mongoClientOptions: MongoClientOptions | undefined;

  private basePath: string;
  private bucketName: string;
  private closeConnectionAutomatically = false;

  private _ClientConnection: MongoClient | null = null;

  public maxTimeMS = 3000;

  /**
   * Constructor
   * @param {string} mongoUrl
   * @param {string} databaseName
   * @param {MongoClientOptions} mongoOptions
   * @param {string} bucketName
   * @param {string} basePath
   * @param {boolean} closeConnectionAutomatically
   */
  constructor(
    databaseName: string,
    mongoUrl?: string | null,
    mongoOptions?: MongoClientOptions | null,
    bucketName?: string,
    basePath?: string,
    closeConnectionAutomatically?: boolean,
  ) {
    this.databaseName = databaseName;

    if (mongoUrl) {
      this.connectionUrl = mongoUrl;
    }

    if (mongoOptions) {
      this.mongoClientOptions = mongoOptions;
    }

    this.bucketName = bucketName || 'fs';

    this.basePath = basePath || `${__dirname}/../cache`;

    if (closeConnectionAutomatically) {
      this.closeConnectionAutomatically = closeConnectionAutomatically;
    }
  }

  /**
   * Returns a stream of a file from the GridFS.
   * @param {string} id
   * @param bucketData
   * @return {Promise<GridFSBucketReadStream>}
   */
  public getFileStream(id: string, bucketData: string = 'fs'): Promise<GridFSBucketReadStream> {
    return new Promise<GridFSBucketReadStream>((resolve, reject) => {
      this.connectDB()
        .then((client) => {
          const connection = client.db(this.databaseName);
          const bucket = new GridFSBucket(connection, {
            bucketName: bucketData || this.bucketName,
          });

          bucket
            .find({ _id: new ObjectID(id) }, { maxTimeMS: this.maxTimeMS })
            .toArray()
            .then(async (result) => {
              if (this.closeConnectionAutomatically) {
                await client.close();
              }

              if (result.length > 0) {
                resolve(bucket.openDownloadStream(new ObjectID(id)));
              } else {
                reject();
              }
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Save the File from the GridFs to the filesystem and get the Path back
   * @param {string} id
   * @param {string} fileName
   * @param {string} filePath
   * @param bucketData
   * @return {Promise<string>}
   */
  public getFile(id: string, bucketData: string = 'fs', filePath?: string, fileName?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.connectDB()
        .then((client) => {
          const connection = client.db(this.databaseName);
          const bucket = new GridFSBucket(connection, {
            bucketName: bucketData || this.bucketName,
          });

          return bucket
            .find({ $or: [{ _id: new ObjectID(id) }, { name: fileName }] }, { maxTimeMS: this.maxTimeMS })
            .toArray()
            .then(async (result) => {
              if (!result || result.length === 0) {
                reject(new NotFoundException('Не правильно указан ID файла'));
              }

              if (!fileName) {
                fileName = result[0].filename;
              } else {
                if (path.extname(fileName) === '') {
                  fileName = fileName.concat(path.extname(result[0].filename));
                }
              }

              if (!filePath) {
                filePath = '';
              }

              if (this.basePath.charAt(this.basePath.length - 1) !== '/') {
                filePath += '/';
              }

              let fullPath = `${this.basePath}/${filePath}`;

              if (!fs.existsSync(`${fullPath}`)) {
                mkdirSync(fullPath);
              }

              bucket
                .openDownloadStream(new ObjectID(id))
                .once('error', async (error) => {
                  if (this.closeConnectionAutomatically) {
                    await client.close();
                  }
                  reject(error);
                })
                .once('end', async () => {
                  if (this.closeConnectionAutomatically) {
                    await client.close();
                  }
                  resolve(`${fileName}`);
                })
                .pipe(fs.createWriteStream(`${fullPath}${fileName}`));
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public getFileOne(
    id: string,
    bucketData: string = 'fs',
    filePath?: string,
    fileKind?: string,
    fileName?: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.connectDB()
        .then((client) => {
          const connection = client.db(this.databaseName);
          const bucket = new GridFSBucket(connection, {
            bucketName: bucketData || this.bucketName,
          });

          return bucket
            .find({ _id: new ObjectID(id) }, { maxTimeMS: this.maxTimeMS })
            .toArray()
            .then(async (result) => {
              if (!result || result.length === 0) {
                reject(new NotFoundException('Нет файла с указанным ID'));
              }

              if (!fileName) {
                fileName = result[0].filename;
              } else {
                if (path.extname(fileName) === '') {
                  fileName = fileName.concat(path.extname(result[0].filename));
                }
              }

              if (!filePath) {
                filePath = '';
              }

              if (this.basePath.charAt(this.basePath.length - 1) !== '/') {
                filePath += `/`;
              }

              let fullPath = `${this.basePath}/${filePath}`;

              if (!fs.existsSync(`${fullPath}`)) {
                mkdirSync(fullPath);
              }

              bucket
                .openDownloadStream(new ObjectID(id))
                .once('error', async (error) => {
                  if (this.closeConnectionAutomatically) {
                    await client.close();
                  }
                  reject(error);
                })
                .once('end', async () => {
                  if (this.closeConnectionAutomatically) {
                    await client.close();
                  }
                  resolve(`${fileName}`);
                })
                .pipe(fs.createWriteStream(`${fullPath}${fileName}`));
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public getFileName(fileName: string, filePath?: string, bucketData: string = 'fs', id?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.connectDB()
        .then((client) => {
          const connection = client.db(this.databaseName);
          const bucket = new GridFSBucket(connection, {
            bucketName: bucketData || this.bucketName,
          });

          return bucket
            .find({ name: fileName }, { maxTimeMS: this.maxTimeMS })
            .toArray()
            .then(async (result) => {
              if (!result || result.length === 0) {
                throw new Error('Object not found');
              }

              if (!fileName) {
                fileName = result[0].filename;
              } else {
                if (path.extname(fileName) === '') {
                  fileName = fileName.concat(path.extname(result[0].filename));
                }
              }

              if (!filePath) {
                filePath = '';
              }

              if (this.basePath.charAt(this.basePath.length - 1) !== '/') {
                filePath += '/';
              }

              if (!fs.existsSync(`${this.basePath}${filePath}`)) {
                throw new Error('Path not found');
              }

              bucket
                .openDownloadStream(new ObjectID(id))
                .once('error', async (error) => {
                  if (this.closeConnectionAutomatically) {
                    await client.close();
                  }
                  reject(error);
                })
                .once('end', async () => {
                  if (this.closeConnectionAutomatically) {
                    await client.close();
                  }
                  resolve(`${this.basePath}${filePath}${fileName}`);
                })
                .pipe(fs.createWriteStream(`${this.basePath}${filePath}${fileName}`));
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Get a single Object
   * @param {string} id
   * @param bucketData
   * @return {Promise<IGridFSObject>}
   */
  public getObject(id: string, bucketData: string = 'fs'): Promise<IGridFSObject | void> {
    return new Promise((resolve, reject) => {
      this.connectDB()
        .then((client) => {
          const connection = client.db(this.databaseName);
          const bucket = new GridFSBucket(connection, {
            bucketName: bucketData || this.bucketName,
          });
          try {
            bucket
              .find({ _id: new ObjectID(id) }, { maxTimeMS: this.maxTimeMS })
              .toArray()
              .then(async (result: IGridFSObject[]) => {
                if (this.closeConnectionAutomatically) {
                  await client.close();
                }
                if (result.length > 0) {
                  resolve(result[0]);
                } else {
                  reject(new NotFoundException('Файла с таким ID не найден.'));
                }
              });
          } catch (e) {
            reject(new NotFoundException('Не правильно указан ID файла'));
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public getFileList(bucketData: string = 'fs'): Promise<IGridFSObject[] | void> {
    return new Promise((resolve, reject) => {
      this.connectDB()
        .then((client) => {
          const connection = client.db(this.databaseName);
          const bucket = new GridFSBucket(connection, {
            bucketName: bucketData || this.bucketName,
          });

          bucket
            .find()
            .toArray()
            .then(async (result: IGridFSObject[]) => {
              if (this.closeConnectionAutomatically) {
                await client.close();
              }

              if (result.length > 0) {
                resolve(result);
              } else {
                reject(new NotFoundException('Файлы не найдены'));
              }
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Upload a file directly from a fs Path
   * @param {string} uploadFilePath
   * @param {string} targetFileName
   * @param {string} type
   * @param {object} meta
   * @param {boolean} deleteFile
   * @return {Promise<IGridFSObject>}
   */
  public uploadFile(
    uploadFilePath: string,
    targetFileName: string,
    type: string,
    meta: object,
    deleteFile: boolean = true,
    bucketData: string = 'fs',
  ): Promise<IGridFSObject> {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(uploadFilePath)) {
        reject(new Error('File not found'));
      }

      this.connectDB()
        .then((client) => {
          const connection = client.db(this.databaseName);
          const bucket = new GridFSBucket(connection, {
            bucketName: bucketData || this.bucketName,
          });

          fs.createReadStream(uploadFilePath)
            .pipe(
              bucket.openUploadStream(targetFileName, {
                contentType: type,
                metadata: meta,
              }),
            )
            .on('error', async (err) => {
              if (this.closeConnectionAutomatically) {
                await client.close();
              }

              if (fs.existsSync(uploadFilePath) && deleteFile) {
                fs.unlinkSync(uploadFilePath);
              }

              reject(err);
            })
            .on('finish', async (item: IGridFSObject) => {
              if (this.closeConnectionAutomatically) {
                await client.close();
              }

              if (fs.existsSync(uploadFilePath) && deleteFile) {
                fs.unlinkSync(uploadFilePath);
              }

              resolve(item);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Upload a file directly from a fs Path
   * @param {string} uploadData
   * @param {string} targetFileName
   * @param {string} type
   * @param {object} meta
   * @return {Promise<IGridFSObject>}
   */
  public uploadFileString(
    uploadData: string,
    targetFileName: string,
    type: string,
    meta: object,
    bucketData: string = 'fs',
    realname: string[] = [],
  ): Promise<IGridFSObject> {
    return new Promise((resolve, reject) => {
      this.connectDB()
        .then((client) => {
          const connection = client.db(this.databaseName);
          const bucket = new GridFSBucket(connection, {
            bucketName: bucketData || this.bucketName,
          });

          const binary = Buffer.from(uploadData, 'base64');
          const readable = Readable.from(binary);

          readable
            .pipe(
              bucket.openUploadStream(targetFileName, {
                contentType: type,
                metadata: meta,
                aliases: realname,
              }),
            )
            .on('error', async (err) => {
              if (this.closeConnectionAutomatically) {
                await client.close();
              }

              reject(err);
            })
            .on('finish', async (item: IGridFSObject) => {
              if (this.closeConnectionAutomatically) {
                await client.close();
              }

              resolve(item);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Delete an File from the GridFS
   * @param {string} id
   * @return {Promise<boolean>}
   */
  public delete(id: string, bucketData: string = 'fs', filePath?: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.connectDB()
        .then((client) => {
          const connection = client.db(this.databaseName);
          const bucket = new GridFSBucket(connection, {
            bucketName: bucketData || this.bucketName,
          });

          bucket.delete(new ObjectID(id), async (err, th) => {
            if (this.closeConnectionAutomatically) {
              await client.close();
            }

            if (err) {
              reject(err);
            }

            if (this.basePath.charAt(this.basePath.length - 1) !== '/') {
              filePath += '/';
            }

            if (filePath) {
              if (this.basePath.charAt(this.basePath.length - 1) !== '/') {
                filePath += '/';
              }
              const fullPath = `${this.basePath}${filePath}`;
              console.log(fullPath);
              //fs.unlinkSync(fullPath);
            }

            resolve(true);
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Close the Connection, if the connection is not needed anymore
   */
  public async closeConnection() {
    if (this._ClientConnection) {
      await this._ClientConnection.close();
    }

    return true;
  }

  /**
   * Connect to the Database and return a promise Object
   */
  private async connectDB(): Promise<MongoClient> {
    if (this._ClientConnection) {
      return this._ClientConnection;
    }

    if (!this.connectionUrl) {
      throw new Error('No Connection String given. Can´t connect to MongoDB.');
    }

    return (this._ClientConnection = await MongoClient.connect(this.connectionUrl));
  }
}
