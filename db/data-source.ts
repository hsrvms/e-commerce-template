import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

const envPath = `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`;
config({ path: envPath });

const configService = new ConfigService();
console.log('db.host:', configService.get<string>('POSTGRES_HOST'));
console.log('path:', envPath);

export default new DataSource({
  type: 'postgres',
  host: configService.get<string>('POSTGRES_HOST'),
  port: configService.get<number>('POSTGRES_PORT'),
  database: configService.get<string>('POSTGRES_DB'),
  username: configService.get<string>('POSTGRES_USER'),
  password: configService.get<string>('POSTGRES_PASSWORD'),
  migrations: ['db/migrations/**'],
  entities: ['dist/**/*.entity.js'],
});
