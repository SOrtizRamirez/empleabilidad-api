import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacanciesService } from './vacancies.service';
import { VacanciesController } from './vacancies.controller';
import { Vacancy } from './entities/vacancy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vacancy])],
  controllers: [VacanciesController],
  providers: [VacanciesService],
  exports: [TypeOrmModule],
})
export class VacanciesModule {}
