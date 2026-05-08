import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class PatientService {
  private readonly logger = new Logger(PatientService.name);

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  // ── Queries ────────────────────────────────────────────────

  async findAllByUser(userId: number): Promise<Patient[]> {
    this.logger.log(`Fetching all patients for user ${userId}`);
    return this.patientRepo.find({
      where: { userId },
      withDeleted: true,
      order: { createdAt: 'DESC' },
      relations: ['scans'],
    });
  }

  async findOneById(id: string, userId: number): Promise<Patient> {
    const patient = await this.patientRepo.findOne({
      where: { id, userId },
      relations: ['scans', 'scans.aiResults'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient ${id} not found`);
    }

    return patient;
  }

  // ── Mutations ──────────────────────────────────────────────

  private normalizeGender(input: Partial<Patient>): Partial<Patient> {
    if (!input.gender) {
      return input;
    }

    return {
      ...input,
      gender: String(input.gender).toLowerCase(),
    };
  }

  async create(
    userId: number,
    input: Partial<Patient>,
  ): Promise<Patient> {
    this.logger.log(`Creating patient for user ${userId}: ${input.firstName} ${input.lastName}`);

    const normalizedInput = this.normalizeGender(input);

    const patient = this.patientRepo.create({
      ...normalizedInput,
      userId,
    });

    const saved = await this.patientRepo.save(patient);
    this.logger.log(`Patient created: ${saved.id}`);
    return saved;
  }

  async update(
    id: string,
    userId: number,
    input: Partial<Patient>,
  ): Promise<Patient> {
    const patient = await this.findOneById(id, userId);

    const normalizedInput = this.normalizeGender(input);
    Object.assign(patient, normalizedInput);
    const updated = await this.patientRepo.save(patient);

    this.logger.log(`Patient updated: ${updated.id}`);
    return updated;
  }

  async softDelete(id: string, userId: number): Promise<boolean> {
    await this.findOneById(id, userId); // ownership check
    await this.patientRepo.softDelete(id);
    this.logger.log(`Patient soft-deleted: ${id}`);
    return true;
  }

  async restore(id: string, userId: number): Promise<Patient> {
    // Must include soft-deleted records when looking up
    const patient = await this.patientRepo.findOne({
      where: { id, userId },
      withDeleted: true,
    });

    if (!patient) {
      throw new NotFoundException(`Patient ${id} not found`);
    }

    await this.patientRepo.restore(id);
    this.logger.log(`Patient restored: ${id}`);

    return this.findOneById(id, userId);
  }

  // ── Helpers for Analytics ──────────────────────────────────

  async countByUser(userId: number): Promise<number> {
    return this.patientRepo.count({ where: { userId } });
  }
}
