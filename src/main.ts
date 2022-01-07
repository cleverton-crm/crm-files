import { NestFactory } from '@nestjs/core';
import { FileModule } from './file.module';
import { TcpOptions, Transport } from '@nestjs/microservices';
import { cyan } from 'cli-color';
import { Logger } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import * as helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('FilesModule');

  const config = new ConfigService();
  const api = await NestFactory.create(FileModule);

  // apps.use(helmet());
  api.enableCors();

  const app = await NestFactory.createMicroservice(FileModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: config.get('port'),
    },
  } as TcpOptions);

  logger.log(
    cyan(`Files microservice started on TCP port: ${config.get('port')}`),
  );
  await app.listen();
  await api.listen(config.get('api'), () => {
    logger.log(cyan(`Started listening on port ${config.get('api')}`));
    if (typeof process.send === 'function') {
      process.send('ready');
    }
  });
}
bootstrap();
