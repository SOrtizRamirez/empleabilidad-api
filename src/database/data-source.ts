import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity'; 
import { Vacancy } from '../vacancies/entities/vacancy.entity';
import { Application } from '../applications/entities/application.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User, Vacancy, Application],
  synchronize: false,
});
