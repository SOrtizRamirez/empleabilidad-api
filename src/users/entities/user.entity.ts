import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { Vacancy } from '../../vacancies/entities/vacancy.entity';
import { Application } from '../../applications/entities/application.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 160, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @Index()
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CODER,
  })
  role: Role;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Vacancy, (vacancy) => vacancy.createdBy)
  vacanciesCreated: Vacancy[];

  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];
}
