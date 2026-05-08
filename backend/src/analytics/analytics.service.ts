import { Injectable, Logger } from '@nestjs/common';
import { PatientService } from '../patient/patient.service';
import { ScanService } from '../scan/scan.service';

export interface UserAnalytics {
  totalPatients: number;
  totalScans: number;
  averageScansPerPatient: number;
  scanTypeDistribution: { scanType: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly patientService: PatientService,
    private readonly scanService: ScanService,
  ) {}

  async getUserAnalytics(userId: number): Promise<UserAnalytics> {
    this.logger.log(`Computing analytics for user ${userId}`);

    const [totalPatients, totalScans, scanTypeDistribution, statusBreakdown] =
      await Promise.all([
        this.patientService.countByUser(userId),
        this.scanService.countByUser(userId),
        this.scanService.scanTypeDistribution(userId),
        this.scanService.statusBreakdown(userId),
      ]);

    const averageScansPerPatient =
      totalPatients > 0
        ? Math.round((totalScans / totalPatients) * 100) / 100
        : 0;

    this.logger.log(
      `Analytics for user ${userId}: patients=${totalPatients}, scans=${totalScans}, avg=${averageScansPerPatient}`,
    );

    return {
      totalPatients,
      totalScans,
      averageScansPerPatient,
      scanTypeDistribution,
      statusBreakdown,
    };
  }
}
