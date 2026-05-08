import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';
import { Scan } from '../entities/scan.entity';
import { AIResult } from '../entities/ai-result.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    User,
    Patient,
    Scan,
    AIResult,
  ],
  migrations: ['src/migrations/*.{ts,js}'],
  synchronize: false,
  logging: true,
});