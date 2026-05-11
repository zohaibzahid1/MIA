import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scan, ScanStatus, ScanType } from '../entities/scan.entity';
import { AIResult, AIResultStatus } from '../entities/ai-result.entity';
import { S3Service, PresignedUploadResult } from '../s3/s3.service';
import { PatientService } from '../patient/patient.service';

interface MockAiInferenceResult {
  predictions: Record<string, any>[];
  confidenceScore: number;
  resultData: Record<string, any>;
}

interface ExternalAiInferenceResult {
  predictions: Record<string, any>[];
  confidenceScore: number | null;
  resultData: Record<string, any>;
}

interface FilteredPrediction {
  prediction: string;
  confidencePercent: number;
  confidenceScore: number;
  details?: Record<string, any>;
}

@Injectable()
export class ScanService {
  private readonly logger = new Logger(ScanService.name);
  private static readonly DEFAULT_AI_INFERENCE_URL =
    'https://Faraz8-fyp-medical-image-ai-service-v1-1.hf.space/v1/infer';

  private static readonly SCAN_TYPE_MAP: Record<string, ScanType> = {
    xray: ScanType.XRAY,
    'x-ray': ScanType.XRAY,
    ct: ScanType.CT,
    mri: ScanType.MRI,
  };

  constructor(
    @InjectRepository(Scan)
    private readonly scanRepo: Repository<Scan>,

    @InjectRepository(AIResult)
    private readonly aiResultRepo: Repository<AIResult>,

    private readonly s3Service: S3Service,
    private readonly patientService: PatientService,
    private readonly configService: ConfigService,
  ) {}

  // ── Queries ────────────────────────────────────────────────

  async findAllByPatient(patientId: string, userId: number): Promise<Scan[]> {
    // Verify patient ownership
    await this.patientService.findOneById(patientId, userId);

    this.logger.log(`Fetching scans for patient ${patientId}`);
    return this.scanRepo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
      relations: ['aiResults'],
    });
  }

  async findOneById(id: string): Promise<Scan> {
    const scan = await this.scanRepo.findOne({
      where: { id },
      relations: ['patient', 'aiResults'],
    });

    if (!scan) {
      throw new NotFoundException(`Scan ${id} not found`);
    }

    return scan;
  }

  async getPresignedViewUrl(scanId: string, userId: number): Promise<string> {
    const scan = await this.findOneById(scanId);

    // Verify ownership through the scan's patient relationship.
    await this.patientService.findOneById(scan.patientId, userId);

    if (!scan.s3Key) {
      throw new BadRequestException('Scan does not have an uploaded S3 object');
    }

    return this.s3Service.generatePresignedDownloadUrl(scan.s3Key);
  }

  // ── Upload Flow ────────────────────────────────────────────

  private normalizeScanType(scanType: unknown): ScanType {
    if (typeof scanType !== 'string') {
      throw new BadRequestException('scanType must be a string');
    }

    const normalized = scanType.trim().toLowerCase();
    const mapped = ScanService.SCAN_TYPE_MAP[normalized];

    if (!mapped) {
      throw new BadRequestException(
        `Invalid scanType: ${scanType}. Allowed values: XRAY, CT, MRI`,
      );
    }

    return mapped;
  }

  private async runMockAiInference(scan: Scan): Promise<MockAiInferenceResult> {
    // Simulate model latency while the real model API integration is pending.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const topFindingsByType: Record<ScanType, string> = {
      [ScanType.XRAY]: 'Mild bilateral lower-lobe infiltrates',
      [ScanType.CT]: 'No acute intracranial abnormality',
      [ScanType.MRI]: 'No focal enhancing lesion detected',
    };

    const topFinding = topFindingsByType[scan.scanType] ?? 'No acute finding';
    const confidenceScore = 0.9125;

    return {
      predictions: [
        {
          label: topFinding,
          probability: confidenceScore,
          severity: 'mild',
        },
        {
          label: 'No critical abnormality',
          probability: 0.9671,
          severity: 'none',
        },
      ],
      confidenceScore,
      resultData: {
        summary: topFinding,
        recommendation: 'Clinical correlation advised. Follow-up if symptoms persist.',
        model: 'mock-medical-model',
        simulated: true,
      },
    };
  }

  private getInferenceModality(scanType: ScanType): string {
    const modalityMap: Record<ScanType, string> = {
      [ScanType.XRAY]: 'xray',
      [ScanType.CT]: 'ct_scan',
      [ScanType.MRI]: 'brain_mri',
    };

    return modalityMap[scanType] ?? 'xray';
  }

  private toNumberOrNull(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return null;
  }

  private normalizePredictions(raw: unknown): Record<string, any>[] {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const candidate = item as Record<string, any>;
        const probability = this.toNumberOrNull(
          candidate.probability ?? candidate.score ?? candidate.confidence,
        );

        return {
          label:
            typeof candidate.label === 'string'
              ? candidate.label
              : typeof candidate.class === 'string'
                ? candidate.class
                : typeof candidate.finding === 'string'
                  ? candidate.finding
                  : 'Unknown',
          probability,
          severity:
            typeof candidate.severity === 'string' ? candidate.severity : null,
        };
      });
  }

  private normalizePercentValue(value: unknown): number | null {
    const numeric = this.toNumberOrNull(value);
    if (numeric === null) {
      return null;
    }

    // Accept either 0-100 percentages or 0-1 fractions.
    if (numeric <= 1) {
      return Math.max(0, Math.min(100, numeric * 100));
    }

    return Math.max(0, Math.min(100, numeric));
  }

  private clampPercent(value: number): number {
    return Math.max(0, Math.min(100, value));
  }

  private mapCtClassLabel(label: string): string {
    if (label === 'normal') {
      return 'No cancer';
    }

    return label
      .replace(/_/g, ' ')
      .replace(/\./g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private pickCtPrediction(modelOutput: Record<string, any>): FilteredPrediction | null {
    const classProbabilities =
      (modelOutput?.class_probabilities as Record<string, unknown>) || {};
    const entries = Object.entries(classProbabilities)
      .map(([label, value]) => ({
        label,
        percent: this.normalizePercentValue(value),
      }))
      .filter((item): item is { label: string; percent: number } =>
        item.percent !== null,
      );

    if (entries.length === 0) {
      return null;
    }

    const highest = entries.reduce((best, current) =>
      current.percent > best.percent ? current : best,
    );

    return {
      prediction: this.mapCtClassLabel(highest.label),
      confidencePercent: highest.percent,
      confidenceScore: highest.percent / 100,
      details: {
        highestClass: highest.label,
        classProbabilities: entries.reduce<Record<string, number>>(
          (acc, entry) => {
            acc[entry.label] = entry.percent;
            return acc;
          },
          {},
        ),
      },
    };
  }

  private pickXrayPrediction(modelOutput: Record<string, any>): FilteredPrediction | null {
    const predictedClass =
      typeof modelOutput?.predicted_class === 'string'
        ? modelOutput.predicted_class
        : null;

    const rawProbabilityCancer = this.toNumberOrNull(modelOutput?.probability_cancer);
    const rawProbabilityNoCancer = this.toNumberOrNull(
      modelOutput?.probability_no_cancer,
    );

    let probabilityCancer: number | null = null;
    let probabilityNoCancer: number | null = null;

    if (rawProbabilityCancer !== null && rawProbabilityNoCancer !== null) {
      // If any side is already clearly in 0-100 range, treat both as percentages.
      if (rawProbabilityCancer > 1 || rawProbabilityNoCancer > 1) {
        probabilityCancer = this.clampPercent(rawProbabilityCancer);
        probabilityNoCancer = this.clampPercent(rawProbabilityNoCancer);
      } else {
        // If both are <= 1 and look like fractions, convert to percentages.
        const pairSum = rawProbabilityCancer + rawProbabilityNoCancer;
        if (pairSum <= 1.0001) {
          probabilityCancer = this.clampPercent(rawProbabilityCancer * 100);
          probabilityNoCancer = this.clampPercent(rawProbabilityNoCancer * 100);
        } else {
          probabilityCancer = this.clampPercent(rawProbabilityCancer);
          probabilityNoCancer = this.clampPercent(rawProbabilityNoCancer);
        }
      }
    } else {
      probabilityCancer = this.normalizePercentValue(rawProbabilityCancer);
      probabilityNoCancer = this.normalizePercentValue(rawProbabilityNoCancer);
    }

    let highestPercent: number | null = null;
    if (probabilityCancer !== null || probabilityNoCancer !== null) {
      highestPercent = Math.max(probabilityCancer ?? 0, probabilityNoCancer ?? 0);
    }

    if (!predictedClass && highestPercent === null) {
      return null;
    }

    const finalPercent = highestPercent ?? 0;

    return {
      prediction: predictedClass || 'Unknown',
      confidencePercent: finalPercent,
      confidenceScore: finalPercent / 100,
      details: {
        probabilityCancer,
        probabilityNoCancer,
      },
    };
  }

  private filterInferenceResponse(
    raw: Record<string, any>,
    modality: string,
    imageUrl: string,
  ): ExternalAiInferenceResult {
    const modelOutput =
      (raw?.modelOutput as Record<string, any>) ||
      (raw?.result as Record<string, any>) ||
      (raw?.data as Record<string, any>) ||
      raw;

    let selectedPrediction: FilteredPrediction | null = null;
    if (modality === 'ct_scan') {
      selectedPrediction = this.pickCtPrediction(modelOutput);
    } else if (modality === 'xray') {
      selectedPrediction = this.pickXrayPrediction(modelOutput);
    } else if (modality === 'brain_mri') {
      selectedPrediction =
        this.pickCtPrediction(modelOutput) ?? this.pickXrayPrediction(modelOutput);
    }

    const genericPredictionsSource =
      raw?.predictions ?? raw?.result?.predictions ?? raw?.data?.predictions;
    const genericPredictions = this.normalizePredictions(genericPredictionsSource);

    const predictions = selectedPrediction
      ? [
          {
            label: selectedPrediction.prediction,
            probability: selectedPrediction.confidenceScore,
            confidencePercent: selectedPrediction.confidencePercent,
            ...selectedPrediction.details,
          },
        ]
      : genericPredictions;

    const confidenceScore =
      selectedPrediction?.confidenceScore ??
      this.toNumberOrNull(raw?.confidenceScore) ??
      this.toNumberOrNull(raw?.confidence_score) ??
      this.toNumberOrNull(raw?.result?.confidenceScore) ??
      this.toNumberOrNull(raw?.result?.confidence_score) ??
      (genericPredictions.length > 0
        ? Math.max(
            ...genericPredictions.map((p) => this.toNumberOrNull(p.probability) ?? 0),
          )
        : null);

    const summary =
      selectedPrediction?.prediction ||
      (typeof raw?.summary === 'string' && raw.summary) ||
      (typeof raw?.result?.summary === 'string' && raw.result.summary) ||
      (predictions.length > 0 ? String(predictions[0].label) : 'No findings');

    return {
      predictions,
      confidenceScore,
      resultData: {
        summary,
        prediction: summary,
        confidencePercent:
          selectedPrediction?.confidencePercent ??
          (confidenceScore !== null ? Math.round(confidenceScore * 10000) / 100 : null),
        modality,
        imageUrl,
        provider: 'huggingface-space',
        endpoint: this.getAiInferenceUrl(),
        status:
          typeof raw?.status === 'string'
            ? raw.status
            : raw?.success === true
              ? 'success'
              : 'completed',
        modelOutput: {
          model_name: modelOutput?.model_name ?? null,
          module: modelOutput?.module ?? null,
          predicted_class: modelOutput?.predicted_class ?? null,
          timestamp: modelOutput?.timestamp ?? null,
          disclaimer: modelOutput?.disclaimer ?? null,
          class_probabilities: modelOutput?.class_probabilities ?? null,
          probability_cancer: modelOutput?.probability_cancer ?? null,
          probability_no_cancer: modelOutput?.probability_no_cancer ?? null,
        },
      },
    };
  }

  private getAiInferenceUrl(): string | null {
    return (
      this.configService.get<string>(
        'AI_INFERENCE_URL',
        ScanService.DEFAULT_AI_INFERENCE_URL,
      ) ?? null
    );
  }

  private async runExternalAiInference(scan: Scan): Promise<ExternalAiInferenceResult> {
    if (!scan.s3Key) {
      throw new BadRequestException(
        `Scan ${scan.id} has no S3 key for inference input`,
      );
    }

    const modality = this.getInferenceModality(scan.scanType);
    const imageUrl = await this.s3Service.generatePresignedDownloadUrl(scan.s3Key);
    const inferenceUrl = this.getAiInferenceUrl();

    if (!inferenceUrl) {
      throw new BadRequestException('AI inference URL is not configured');
    }

    // Pull the secured scan image from S3, then forward to model API as multipart.
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new BadRequestException(
        `Failed to fetch scan image for inference (HTTP ${imageResponse.status})`,
      );
    }

    const imageType =
      scan.mimeType || imageResponse.headers.get('content-type') || 'image/png';
    const imageArrayBuffer = await imageResponse.arrayBuffer();

    const form = new FormData();
    form.append('modality', modality);
    form.append('image_url', imageUrl);
    form.append(
      'image',
      new Blob([imageArrayBuffer], { type: imageType }),
      scan.originalFileName || `${scan.id}.png`,
    );

    const inferenceResponse = await fetch(inferenceUrl, {
      method: 'POST',
      body: form,
    });
    const rawResponse = (await inferenceResponse.json().catch(() => ({}))) as Record<
      string,
      any
    >;

    if (!inferenceResponse.ok) {
      throw new BadRequestException(
        `Inference request failed (HTTP ${inferenceResponse.status})`,
      );
    }
  return this.filterInferenceResponse(rawResponse, modality, imageUrl);
  }

  /**
   * Step 1: Client calls initiateScanUpload
   *  - Creates a PENDING scan record
   *  - Generates a pre-signed S3 upload URL
   *  - Returns the URL + s3Key to the client
   */
  async initiateScanUpload(
    userId: number,
    input: {
      patientId: string;
      scanType: string;
      notes?: string;
      originalFileName: string;
      mimeType?: string;
      fileSize?: number;
    },
  ): Promise<{ scan: Scan; presigned: PresignedUploadResult }> {
    // Verify patient ownership
    await this.patientService.findOneById(input.patientId, userId);

    const normalizedScanType = this.normalizeScanType(input.scanType);

    // Generate pre-signed URL
    const presigned = await this.s3Service.generatePresignedUploadUrl(
      input.patientId,
      input.originalFileName,
      input.mimeType,
    );

    // Create scan record in PENDING status
    const scan = this.scanRepo.create({
      patientId: input.patientId,
      scanType: normalizedScanType,
      status: ScanStatus.PENDING,
      s3Key: presigned.s3Key,
      s3Url: this.s3Service.buildS3Url(presigned.s3Key),
      notes: input.notes,
      originalFileName: input.originalFileName,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
    });

    const savedScan = await this.scanRepo.save(scan);
    this.logger.log(`Scan initiated: ${savedScan.id} → key: ${presigned.s3Key}`);

    return { scan: savedScan, presigned };
  }

  /**
   * Step 2: Client confirms the upload completed successfully.
   * Transitions status from PENDING → UPLOADED.
   */
  async confirmUpload(scanId: string, s3Key: string): Promise<Scan> {
    const scan = await this.findOneById(scanId);

    if (scan.s3Key !== s3Key) {
      throw new BadRequestException('S3 key mismatch');
    }

    if (scan.status !== ScanStatus.PENDING) {
      throw new BadRequestException(
        `Cannot confirm upload for scan in status: ${scan.status}`,
      );
    }

    scan.status = ScanStatus.UPLOADED;
    const uploadedScan = await this.scanRepo.save(scan);
    this.logger.log(`Scan upload confirmed: ${uploadedScan.id}`);

    await this.scanRepo.update(scan.id, { status: ScanStatus.PROCESSING });

    const aiResult = await this.aiResultRepo.save(
      this.aiResultRepo.create({
        scanId: scan.id,
        modelName: 'hf-medical-image-ai-service',
        modelVersion: 'v1',
        status: AIResultStatus.PENDING,
      }),
    );

    const processingStartedAt = Date.now();

    try {
      // const modelOutput = await this.runMockAiInference(scan);
      const modelOutput = await this.runExternalAiInference(scan);
      const processingDurationMs = Date.now() - processingStartedAt;

      await this.aiResultRepo.update(aiResult.id, {
        status: AIResultStatus.COMPLETED,
        predictions: modelOutput.predictions,
        confidenceScore:
          modelOutput.confidenceScore !== null
            ? modelOutput.confidenceScore
            : undefined,
        resultData: modelOutput.resultData,
        processedAt: new Date(),
        processingDurationMs,
      });

      await this.scanRepo.update(scan.id, { status: ScanStatus.PROCESSED });
      this.logger.log(`AI processing completed for scan ${scan.id}`);
    } catch (error) {
      const processingDurationMs = Date.now() - processingStartedAt;

      await this.aiResultRepo.update(aiResult.id, {
        status: AIResultStatus.FAILED,
        resultData: {
          error: error instanceof Error ? error.message : 'Inference failed',
        } as any,
        processedAt: new Date(),
        processingDurationMs,
      });

      await this.scanRepo.update(scan.id, { status: ScanStatus.FAILED });
      this.logger.error(`AI processing failed for scan ${scan.id}`, error as any);
    }

    return this.findOneById(scan.id);
  }

  // ── Mutations ──────────────────────────────────────────────

  async update(id: string, input: Partial<Scan>): Promise<Scan> {
    const scan = await this.findOneById(id);

    if (input.scanType !== undefined) {
      input.scanType = this.normalizeScanType(input.scanType);
    }

    Object.assign(scan, input);
    const updated = await this.scanRepo.save(scan);
    this.logger.log(`Scan updated: ${updated.id}`);
    return updated;
  }

  async softDelete(id: string): Promise<boolean> {
    await this.findOneById(id);
    await this.scanRepo.softDelete(id);
    this.logger.log(`Scan soft-deleted: ${id}`);
    return true;
  }

  async restore(id: string): Promise<Scan> {
    const scan = await this.scanRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!scan) {
      throw new NotFoundException(`Scan ${id} not found`);
    }

    await this.scanRepo.restore(id);
    this.logger.log(`Scan restored: ${id}`);
    return this.findOneById(id);
  }

  // ── AI Results ─────────────────────────────────────────────

  async findAIResultsByScan(scanId: string): Promise<AIResult[]> {
    return this.aiResultRepo.find({
      where: { scanId },
      order: { createdAt: 'DESC' },
    });
  }

  async createAIResult(input: Partial<AIResult>): Promise<AIResult> {
    // Verify the scan exists
    await this.findOneById(input.scanId!);

    if (!input.status) {
      input.status = AIResultStatus.COMPLETED;
    }

    const aiResult = this.aiResultRepo.create(input);
    const saved = await this.aiResultRepo.save(aiResult);

    // Auto-transition scan status to PROCESSED
    await this.scanRepo.update(input.scanId!, {
      status: ScanStatus.PROCESSED,
    });

    this.logger.log(`AI result created: ${saved.id} for scan ${input.scanId}`);
    return saved;
  }

  // ── Analytics Helpers ──────────────────────────────────────

  async countByUser(userId: number): Promise<number> {
    return this.scanRepo
      .createQueryBuilder('scan')
      .innerJoin('scan.patient', 'patient')
      .where('patient.userId = :userId', { userId })
      .andWhere('scan.deletedAt IS NULL')
      .getCount();
  }

  async scanTypeDistribution(
    userId: number,
  ): Promise<{ scanType: string; count: number }[]> {
    const result = await this.scanRepo
      .createQueryBuilder('scan')
      .select('scan.scanType', 'scanType')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('scan.patient', 'patient')
      .where('patient.userId = :userId', { userId })
      .andWhere('scan.deletedAt IS NULL')
      .groupBy('scan.scanType')
      .getRawMany();

    return result.map((r) => ({
      scanType: r.scanType,
      count: parseInt(r.count, 10),
    }));
  }

  async statusBreakdown(
    userId: number,
  ): Promise<{ status: string; count: number }[]> {
    const result = await this.scanRepo
      .createQueryBuilder('scan')
      .select('scan.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('scan.patient', 'patient')
      .where('patient.userId = :userId', { userId })
      .andWhere('scan.deletedAt IS NULL')
      .groupBy('scan.status')
      .getRawMany();

    return result.map((r) => ({
      status: r.status,
      count: parseInt(r.count, 10),
    }));
  }
}
