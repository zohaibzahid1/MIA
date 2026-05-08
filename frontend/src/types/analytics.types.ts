export interface ScanTypeCount {
  scanType: string;
  count: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface UserAnalytics {
  totalPatients: number;
  totalScans: number;
  averageScansPerPatient: number;
  scanTypeDistribution: ScanTypeCount[];
  statusBreakdown: StatusCount[];
}
