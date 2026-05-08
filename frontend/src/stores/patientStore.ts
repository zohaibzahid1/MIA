import { makeAutoObservable, runInAction } from "mobx";
import { Patient, CreatePatientInput, UpdatePatientInput } from "@/types/patient.types";
import {
  fetchMyPatients,
  deletePatient,
  restorePatient,
  createPatient,
  updatePatient,
} from "@/services/patientApi";

export class PatientStore {
  patients: Patient[] = [];
  isLoading = false;
  error: string | null = null;
  includeDeleted = false;

  constructor() {
    makeAutoObservable(this);
    console.log("PatientStore initialized");
  }

  // ── Computed ─────────────────────────────────────────────

  get filteredPatients(): Patient[] {
    if (this.includeDeleted) {
      return this.patients;
    }
    return this.patients.filter((p) => !p.deletedAt);
  }

  get totalPatients(): number {
    return this.filteredPatients.length;
  }

  // ── Actions ──────────────────────────────────────────────

  setIncludeDeleted(value: boolean) {
    this.includeDeleted = value;
  }

  clearError() {
    this.error = null;
  }

  async loadPatients() {
    this.isLoading = true;
    this.error = null;

    try {
      const patients = await fetchMyPatients();
      runInAction(() => {
        this.patients = patients;
        this.isLoading = false;
      });
    } catch (err: unknown) {
      runInAction(() => {
        this.error =
          err instanceof Error ? err.message : "Failed to load patients";
        this.isLoading = false;
      });
    }
  }

  async softDeletePatient(id: string) {
    this.error = null;

    try {
      await deletePatient(id);
      runInAction(() => {
        // Mark patient as deleted locally
        const patient = this.patients.find((p) => p.id === id);
        if (patient) {
          patient.deletedAt = new Date().toISOString();
        }
      });
    } catch (err: unknown) {
      runInAction(() => {
        this.error =
          err instanceof Error ? err.message : "Failed to delete patient";
      });
    }
  }

  async restoreDeletedPatient(id: string) {
    this.error = null;

    try {
      const restored = await restorePatient(id);
      runInAction(() => {
        const index = this.patients.findIndex((p) => p.id === id);
        if (index !== -1) {
          this.patients[index] = restored;
        }
      });
    } catch (err: unknown) {
      runInAction(() => {
        this.error =
          err instanceof Error ? err.message : "Failed to restore patient";
      });
    }
  }

  async addPatient(input: CreatePatientInput) {
    this.isLoading = true;
    this.error = null;

    try {
      const newPatient = await createPatient(input);
      runInAction(() => {
        this.patients.unshift(newPatient);
        this.isLoading = false;
      });
      return newPatient;
    } catch (err: unknown) {
      runInAction(() => {
        this.error = "Failed to create patient";
        console.log("Error creating patient:", err);
        this.isLoading = false;
      });
    }
  }

  async updatePatientInfo(id: string, input: UpdatePatientInput) {
    this.error = null;

    try {
      const updated = await updatePatient(id, input);
      runInAction(() => {
        const index = this.patients.findIndex((p) => p.id === id);
        if (index !== -1) {
          this.patients[index] = updated;
        }
      });
      return updated;
    } catch (err: unknown) {
      runInAction(() => {
        this.error =
          err instanceof Error ? err.message : "Failed to update patient";
      });
      throw err;
    }
  }
}

export default PatientStore;
