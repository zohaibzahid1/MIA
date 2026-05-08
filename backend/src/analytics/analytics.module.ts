import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsResolver } from './analytics.resolver';
import { PatientModule } from '../patient/patient.module';
import { ScanModule } from '../scan/scan.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PatientModule,
    ScanModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [AnalyticsService, AnalyticsResolver],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
