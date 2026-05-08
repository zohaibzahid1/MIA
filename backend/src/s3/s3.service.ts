import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface PresignedUploadResult {
  uploadUrl: string;
  s3Key: string;
  expiresAt: Date;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly presignedUrlExpiry: number; // seconds

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET', 'medical-scans');
    this.presignedUrlExpiry = this.configService.get<number>('S3_PRESIGNED_URL_EXPIRY', 3600);

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });

    this.logger.log(`S3 service initialized — bucket: ${this.bucketName}, region: ${this.region}`);
  }

  /**
   * Generate a pre-signed PUT URL so the client can upload directly to S3.
   *
   * Key format: scans/{patientId}/{uuid}/{originalFileName}
   */
  async generatePresignedUploadUrl(
    patientId: string,
    originalFileName: string,
    mimeType?: string,
  ): Promise<PresignedUploadResult> {
    const sanitizedName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const s3Key = `scans/${patientId}/${uuidv4()}/${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: mimeType || 'application/octet-stream',
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.presignedUrlExpiry,
    });

    const expiresAt = new Date(Date.now() + this.presignedUrlExpiry * 1000);

    this.logger.log(`Generated pre-signed upload URL for key: ${s3Key}`);

    return { uploadUrl, s3Key, expiresAt };
  }

  /**
   * Generate a pre-signed GET URL for downloading/viewing a scan.
   */
  async generatePresignedDownloadUrl(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.presignedUrlExpiry,
    });

    this.logger.log(`Generated pre-signed download URL for key: ${s3Key}`);
    return downloadUrl;
  }

  /**
   * Build the public S3 URL (non-signed) for storage in the DB.
   */
  buildS3Url(s3Key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${s3Key}`;
  }

  /**
   * Delete an object from S3.
   */
  async deleteObject(s3Key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    await this.s3Client.send(command);
    this.logger.log(`Deleted S3 object: ${s3Key}`);
  }
}
