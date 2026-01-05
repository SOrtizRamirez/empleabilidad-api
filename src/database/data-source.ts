import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Vacancy } from '../vacancies/entities/vacancy.entity';
import { Application } from '../applications/entities/application.entity';

const hasUrl = !!process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(hasUrl
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USER,
        password: String(process.env.DB_PASS ?? ''),
        database: process.env.DB_NAME,
      }),
  synchronize: false,
  migrationsRun: false,
  entities: [User, Vacancy, Application],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  schema: 'public'
});
