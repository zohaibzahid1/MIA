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
import { PatientService } from './patient.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Resolver('Patient')
@UseGuards(JwtAuthGuard)
export class PatientResolver {
  private readonly logger = new Logger(PatientResolver.name);

  constructor(private readonly patientService: PatientService) {}

  // ── Queries ────────────────────────────────────────────────

  @Query('myPatients')
  async myPatients(@Context() ctx: any) {
    const userId = ctx.req.user.id;
    this.logger.log(`[myPatients] user=${userId}`);
    return this.patientService.findAllByUser(userId);
  }

  @Query('patient')
  async patient(@Args('id') id: string, @Context() ctx: any) {
    const userId = ctx.req.user.id;
    this.logger.log(`[patient] id=${id}, user=${userId}`);
    return this.patientService.findOneById(id, userId);
  }

  // ── Mutations ──────────────────────────────────────────────

  @Mutation('createPatient')
  async createPatient(
    @Args('input') input: any,
    @Context() ctx: any,
  ) {
    const userId = ctx.req.user.id;
    this.logger.log(`[createPatient] user=${userId}`);
    return this.patientService.create(userId, input);
  }

  @Mutation('updatePatient')
  async updatePatient(
    @Args('id') id: string,
    @Args('input') input: any,
    @Context() ctx: any,
  ) {
    const userId = ctx.req.user.id;
    this.logger.log(`[updatePatient] id=${id}, user=${userId}`);
    return this.patientService.update(id, userId, input);
  }

  @Mutation('deletePatient')
  async deletePatient(@Args('id') id: string, @Context() ctx: any) {
    const userId = ctx.req.user.id;
    this.logger.log(`[deletePatient] id=${id}, user=${userId}`);
    return this.patientService.softDelete(id, userId);
  }

  @Mutation('restorePatient')
  async restorePatient(@Args('id') id: string, @Context() ctx: any) {
    const userId = ctx.req.user.id;
    this.logger.log(`[restorePatient] id=${id}, user=${userId}`);
    return this.patientService.restore(id, userId);
  }
}
