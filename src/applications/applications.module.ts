import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application } from './entities/application.entity';
import { Vacancy } from '../vacancies/entities/vacancy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Vacancy])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
