import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Scan } from './scan.entity';

export enum AIResultStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('ai_results')
@Index(['scanId'])
export class AIResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  scanId: string;

  @Column({ length: 100 })
  modelName: string;

  @Column({ length: 50, nullable: true })
  modelVersion: string;

  @Column({
    type: 'enum',
    enum: AIResultStatus,
    default: AIResultStatus.PENDING,
  })
  status: AIResultStatus;

  /** Top-level predictions array stored as JSONB */
  @Column({ type: 'jsonb', nullable: true })
  predictions: Record<string, any>[];

  /** Overall confidence score (0-1) */
  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  confidenceScore: number;

  /** Flexible structured result data (heatmaps, bounding boxes, etc.) */
  @Column({ type: 'jsonb', nullable: true })
  resultData: Record<string, any>;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt: Date;

  /** Processing duration in milliseconds */
  @Column({ type: 'int', nullable: true })
  processingDurationMs: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  // ── Relations ──────────────────────────────────────────────
  @ManyToOne(() => Scan, (scan) => scan.aiResults, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scanId' })
  scan: Scan;
}
