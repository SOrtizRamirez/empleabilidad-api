import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';

export const userSeeder = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(User);

  const usersToSeed = [
    {
      fullName: 'Admin User',
      email: 'admin@riwi.com',
      role: Role.ADMIN,
      rawPassword: 'Password123',
    },
    {
      fullName: 'Manager User',
      email: 'manager@riwi.com',
      role: Role.GESTOR,
      rawPassword: 'Password123',
    },
  ];

  for (const u of usersToSeed) {
    const exists = await repo.findOne({ where: { email: u.email } });
    if (exists) continue;

    const passwordHash = await bcrypt.hash(u.rawPassword, 10);

    const user = repo.create({
      fullName: u.fullName,      
      email: u.email,
      passwordHash,             
      role: u.role,
      isActive: true,  
    } as any);

    await repo.save(user);
  }

  console.log('User seeders executed successfully');
};
