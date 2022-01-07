import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileProvider } from './schemas/profile.provider';
import { JwtConfigService } from './providers/jwt.servises';
import { MongoConfigService } from './providers/mongo.service';
import { GridFsMulterConfigService } from './config/multer-config.service';
import { MulterModule } from '@nestjs/platform-express';
import { GridFSPromise } from 'gridfs-promise';
import { ConfigService } from './config/config.service';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ConfigService,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '..', './upload'),
      exclude: ['/v2*', '/api*'],
    }),
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    MulterModule.registerAsync({
      useClass: GridFsMulterConfigService,
    }),
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeatureAsync([ProfileProvider]),
  ],
  controllers: [FileController],
  providers: [
    GridFsMulterConfigService,
    FileService,
    ConfigService,
    {
      provide: GridFSPromise,
      useFactory: async (configService: ConfigService) => {
        return new GridFSPromise(
          configService.get('base'),
          configService.getUrlMongo(),
          {},
          'fs',
          './upload',
        );
      },
      inject: [ConfigService],
    },
  ],
})
export class FileModule {}
