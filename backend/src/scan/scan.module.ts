import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scan } from '../entities/scan.entity';
import { AIResult } from '../entities/ai-result.entity';
import { ScanService } from './scan.service';
import { ScanResolver } from './scan.resolver';
import { PatientModule } from '../patient/patient.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Scan, AIResult]),
    PatientModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [ScanService, ScanResolver],
  exports: [ScanService],
})
export class ScanModule {}
