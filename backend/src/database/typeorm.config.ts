import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { User } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';
import { Scan } from '../entities/scan.entity';
import { AIResult } from '../entities/ai-result.entity';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const typeOrmConfig: TypeOrmModuleOptions = {
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
  synchronize: false, // Use migrations instead
};