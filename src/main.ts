import { NestFactory } from '@nestjs/core';
import { FileModule } from './file.module';
import { TcpOptions, Transport } from '@nestjs/microservices';
import { cyan } from 'cli-color';
import { Logger } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import * as helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('ProfileModule');

  const config = new ConfigService();
  const apps = await NestFactory.create(FileModule);

  // apps.use(helmet());
  apps.enableCors();

  const app = await NestFactory.createMicroservice(FileModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: config.get('port'),
    },
  } as TcpOptions);

  logger.log(
    cyan(`Profile microservice started on TCP port: ${config.get('port')}`),
  );
  await app.listen();
  await apps.listen(config.get('port'), () => {
    logger.log(cyan(`Started listening on port ${config.get('port')}`));
    if (typeof process.send === 'function') {
      process.send('ready');
    }
  });
}
bootstrap();
