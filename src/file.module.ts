import { Module } from '@nestjs/common';
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
import { ClientService, NewsService, ProfileService } from './services';
import { ClientController, NewsController, ProfileController } from './controllers';
import { UploadDataService } from './services/upload.service';
import { DealsProviderSchema } from './providers/deals.provider';
import { CarsProviderSchema } from './providers/cars.provider';
import { CompanyController } from './controllers/company.controller';
import { CompanyService } from './services/company.service';
import { CarsService } from './services/cars.service';
import { DealsService } from './services/deals.service';
import { CarsController } from './controllers/cars.controller';
import { LeadsService } from './services/leads.service';
import { DealsController } from './controllers/deals.controller';
import { LeadsController } from './controllers/leads.controller';

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
      NewsProviderSchema,
      DealsProviderSchema,
      CarsProviderSchema,
    ]),
  ],
  controllers: [
    ClientController,
    ProfileController,
    NewsController,
    CompanyController,
    CarsController,
    DealsController,
    LeadsController,
  ],
  providers: [
    GridFsMulterConfigService,
    ClientService,
    ProfileService,
    NewsService,
    ConfigService,
    CompanyService,
    CarsService,
    DealsService,
    LeadsService,
    UploadDataService,
    {
      provide: GridFSData,
      useFactory: async (configService: ConfigService) => {
        return new GridFSData(configService.get('base'), configService.getUrlMongo(), {}, 'fs', './upload');
      },
      inject: [ConfigService],
    },
  ],
})
export class FileModule {}
