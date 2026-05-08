import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Patient } from './patient.entity';
import { AIResult } from './ai-result.entity';

export enum ScanType {
  XRAY = 'xray',
  CT = 'ct',
  MRI = 'mri',
}

export enum ScanStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
}

@Entity('scans')
@Index(['patientId'])
@Index(['status'])
@Index(['scanType'])
export class Scan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column({ type: 'enum', enum: ScanType })
  scanType: ScanType;

  @Column({ length: 500, nullable: true })
  s3Key: string;

  @Column({ length: 1000, nullable: true })
  s3Url: string;

  @Column({ type: 'enum', enum: ScanStatus, default: ScanStatus.PENDING })
  status: ScanStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 255, nullable: true })
  originalFileName: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ length: 100, nullable: true })
  mimeType: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  // ── Relations ──────────────────────────────────────────────
  @ManyToOne(() => Patient, (patient) => patient.scans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @OneToMany(() => AIResult, (aiResult) => aiResult.scan, { cascade: true })
  aiResults: AIResult[];
}
