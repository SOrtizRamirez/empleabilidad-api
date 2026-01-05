import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { User } from '../../users/entities/user.entity';
import { Vacancy } from '../../vacancies/entities/vacancy.entity';

@Entity({ name: 'applications' })
@Unique('uq_user_vacancy', ['userId', 'vacancyId'])
export class Application {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Index()
  @ManyToOne(() => User, (user) => user.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Index()
  @ManyToOne(() => Vacancy, (vacancy) => vacancy.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vacancy_id' })
  vacancy: Vacancy;

  @Column({ name: 'vacancy_id', type: 'bigint' })
  vacancyId: string;

  @Index()
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
