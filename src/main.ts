import { NestFactory } from '@nestjs/core';
import { FileModule } from './file.module';
import { TcpOptions, Transport } from '@nestjs/microservices';
import { cyan } from 'cli-color';
import { INestApplication, Logger } from '@nestjs/common';
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

let app: INestApplication;
const logger = new Logger('NestApplication');

async function gracefulShutdown(): Promise<void> {
  if (app !== undefined) {
    await app.close();
    logger.warn('Application closed!');
  }
  process.exit(0);
}

process.once('SIGTERM', async () => {
  logger.error('SIGTERM: Graceful shutdown... ');
  await gracefulShutdown();
});

process.once('SIGINT', async () => {
  logger.error('SIGINT: Graceful shutdown... ');
  await gracefulShutdown();
});
