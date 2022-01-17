import { Module } from '@nestjs/common';
import { FileController } from './controllers/file.controller';
import { FileService } from './services/file.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileProvider } from './providers/profile.provider';
import { JwtConfigService } from './providers/jwt.servises';
import { MongoConfigService } from './providers/mongo.service';
import { GridFsMulterConfigService } from './config/multer-config.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from './config/config.service';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { GridFSData } from './helpers/gridfs-data';
import { CompanyProviderSchema } from './providers/company.provider';
import { ClientsProviderSchema } from './providers/client.provider';
import { NewsProviderSchema } from './providers/news.provider';

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
    MongooseModule.forFeatureAsync([
      ProfileProvider,
      CompanyProviderSchema,
      ClientsProviderSchema,
      NewsProviderSchema
    ]),
  ],
  controllers: [FileController],
  providers: [
    GridFsMulterConfigService,
    FileService,
    ConfigService,
    {
      provide: GridFSData,
      useFactory: async (configService: ConfigService) => {
        return new GridFSData(
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
