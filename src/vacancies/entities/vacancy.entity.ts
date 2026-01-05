import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VacancyStatus } from '../../common/enums/vacancy-status.enum';
import { User } from '../../users/entities/user.entity';
import { Application } from '../../applications/entities/application.entity';
import { VacancySeniority } from '../../common/enums/vacancy-seniority.enum';

@Entity({ name: 'vacancies' })
export class Vacancy {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 140 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 140 })
  company: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  location?: string | null;

  @Column({
    name: 'salary_min',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  salaryMin?: string | null;

  @Column({
    name: 'salary_max',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  salaryMax?: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: VacancyStatus,
    default: VacancyStatus.OPEN,
  })
  status: VacancyStatus;

  @ManyToOne(() => User, (user) => user.vacanciesCreated, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', type: 'bigint' })
  createdById: string;

  @OneToMany(() => Application, (application) => application.vacancy)
  applications: Application[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'enum', enum: VacancySeniority, nullable: true })
  seniority: VacancySeniority | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  technologies: string[];
}
