export enum ScanType {
  XRAY = 'XRAY',
  CT = 'CT',
  MRI = 'MRI',
}

export enum ScanStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export enum AIResultStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface Scan {
  id: string;
  patientId: string;
  scanType: ScanType;
  s3Key: string | null;
  s3Url: string | null;
  status: ScanStatus;
  notes: string | null;
  originalFileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AIResult {
  id: string;
  scanId: string;
  modelName: string;
  modelVersion: string | null;
  status: AIResultStatus;
  predictions: unknown;
  confidenceScore: number | null;
  resultData: unknown;
  processedAt: string | null;
  processingDurationMs: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScanInput {
  patientId: string;
  scanType: ScanType;
  notes?: string;
  originalFileName: string;
  mimeType?: string;
  fileSize?: number;
}

export interface PresignedUploadResponse {
  scanId: string;
  uploadUrl: string;
  s3Key: string;
  expiresAt: string;
}
