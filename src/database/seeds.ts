import 'dotenv/config';
import { AppDataSource } from './data-source';
import { userSeeder } from './seeders/user.seeder';

async function run() {
  try {
    console.log('DB_PASSWORD type:', typeof process.env.DB_PASS);
    console.log('DB_PASSWORD value:', process.env.DB_PASS);

    await AppDataSource.initialize();
    await userSeeder(AppDataSource);
    await AppDataSource.destroy();

    console.log('Seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
}

run();
