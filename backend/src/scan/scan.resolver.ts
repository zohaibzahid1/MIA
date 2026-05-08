import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { ScanService } from './scan.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Resolver('Scan')
@UseGuards(JwtAuthGuard)
export class ScanResolver {
  private readonly logger = new Logger(ScanResolver.name);

  constructor(private readonly scanService: ScanService) {}

  // ── Queries ────────────────────────────────────────────────

  @Query('scansByPatient')
  async scansByPatient(
    @Args('patientId') patientId: string,
    @Context() ctx: any,
  ) {
    const userId = ctx.req.user.id;
    this.logger.log(`[scansByPatient] patientId=${patientId}, user=${userId}`);
    return this.scanService.findAllByPatient(patientId, userId);
  }

  @Query('scan')
  async scan(@Args('id') id: string) {
    this.logger.log(`[scan] id=${id}`);
    return this.scanService.findOneById(id);
  }

  @Query('aiResultsByScan')
  async aiResultsByScan(@Args('scanId') scanId: string) {
    this.logger.log(`[aiResultsByScan] scanId=${scanId}`);
    return this.scanService.findAIResultsByScan(scanId);
  }

  @Query('scanViewUrl')
  async scanViewUrl(
    @Args('scanId') scanId: string,
    @Context() ctx: any,
  ) {
    const userId = ctx.req.user.id;
    this.logger.log(`[scanViewUrl] scanId=${scanId}, user=${userId}`);
    return this.scanService.getPresignedViewUrl(scanId, userId);
  }

  // ── Mutations ──────────────────────────────────────────────

  @Mutation('initiateScanUpload')
  async initiateScanUpload(
    @Args('input') input: any,
    @Context() ctx: any,
  ) {
    const userId = ctx.req.user.id;
    this.logger.log(`[initiateScanUpload] user=${userId}, patient=${input.patientId}`);

    const { scan, presigned } = await this.scanService.initiateScanUpload(
      userId,
      input,
    );

    return {
      scanId: scan.id,
      uploadUrl: presigned.uploadUrl,
      s3Key: presigned.s3Key,
      expiresAt: presigned.expiresAt,
    };
  }

  @Mutation('confirmScanUpload')
  async confirmScanUpload(@Args('input') input: any) {
    this.logger.log(`[confirmScanUpload] scanId=${input.scanId}`);
    return this.scanService.confirmUpload(input.scanId, input.s3Key);
  }

  @Mutation('updateScan')
  async updateScan(
    @Args('id') id: string,
    @Args('input') input: any,
  ) {
    this.logger.log(`[updateScan] id=${id}`);
    return this.scanService.update(id, input);
  }

  @Mutation('deleteScan')
  async deleteScan(@Args('id') id: string) {
    this.logger.log(`[deleteScan] id=${id}`);
    return this.scanService.softDelete(id);
  }

  @Mutation('restoreScan')
  async restoreScan(@Args('id') id: string) {
    this.logger.log(`[restoreScan] id=${id}`);
    return this.scanService.restore(id);
  }

  @Mutation('createAIResult')
  async createAIResult(@Args('input') input: any) {
    this.logger.log(`[createAIResult] scanId=${input.scanId}`);
    return this.scanService.createAIResult(input);
  }
}
