import { getBoolean } from '../helpers/global';

export class ConfigService {
  private readonly config: { [key: string]: any } = null;

  constructor() {
    this.config = {
      url: 'https://fmedia.cleverton.ru/',
      api: process.env.FILES_PORT,
      port: process.env.FILES_SERVICE_PORT,
      jwt_secret: process.env.JWT_SECRET || 'i_dont_not_use_secret_key',
      jwt_access: process.env.JWT_ACCESS_EXP || '1m',
      jwt_refresh: process.env.JWT_REFRESH_EXP || '2m',
    };
    this.config.baseUri = process.env.BASE_URL;
    this.config.gatewayPort = process.env.API_GATEWAY_PORT;
    this.config.replica = process.env.MONGO_REPLICA;
    this.config.auth = process.env.MONGO_ENABLE;
    this.config.user = process.env.MONGO_ROOT_USER;
    this.config.password = process.env.MONGO_ROOT_PASSWORD;
    this.config.host1 = process.env.MONGO_HOST1;
    this.config.host2 = process.env.MONGO_HOST2;
    this.config.host3 = process.env.MONGO_HOST3;
    this.config.base = process.env.MONGO_DATABASE;
    this.config.port1 = process.env.MONGO_PORT1;
    this.config.port2 = process.env.MONGO_PORT2;
    this.config.port3 = process.env.MONGO_PORT3;
  }

  get(key: string): any {
    return this.config[key];
  }
  getUrlMongo(): string {
    if (getBoolean(this.config.replica)) {
      return `mongodb://${this.config.user}:${this.config.password}@${this.config.host1}:${this.config.port1},${this.config.host2}:${this.config.port2},${this.config.host3}:${this.config.port3}/${this.config.base}?authSource=admin`;
    } else {
      return `mongodb://${this.config.user}:${this.config.password}@${this.config.host1}:${this.config.port1}/${this.config.base}?authSource=admin`;
    }
  }
}
