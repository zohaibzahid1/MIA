import { makeAutoObservable, runInAction } from "mobx";
import { Patient } from "@/types/patient.types";
import { Scan } from "@/types/scan.types";
import { fetchPatientById } from "@/services/patientApi";
import { fetchScansByPatient } from "@/services/scanApi";

export class PatientDetailStore {
  patient: Patient | null = null;
  scans: Scan[] = [];
  isLoadingPatient = false;
  isLoadingScans = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // ── Computed ─────────────────────────────────────────────

  get patientFullName(): string {
    if (!this.patient) return "";
    return `${this.patient.firstName} ${this.patient.lastName}`;
  }

  get isLoading(): boolean {
    return this.isLoadingPatient || this.isLoadingScans;
  }

  /** Scans sorted by createdAt ascending (chronological for timeline) */
  get sortedScans(): Scan[] {
    return [...this.scans].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  /** Chart-ready data points for the scans timeline */
  get timelineData(): Array<{
    index: number;
    date: string;
    formattedDate: string;
    formattedTime: string;
    scanType: string;
    status: string;
    scanId: string;
    value: number;
  }> {
    return this.sortedScans.map((scan, index) => {
      const date = new Date(scan.createdAt);
      return {
        index,
        date: scan.createdAt,
        formattedDate: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        formattedTime: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        scanType: scan.scanType,
        status: scan.status,
        scanId: scan.id,
        value: index + 1, // Y-axis value (scan sequence number)
      };
    });
  }

  // ── Actions ──────────────────────────────────────────────

  clearError() {
    this.error = null;
  }

  reset() {
    this.patient = null;
    this.scans = [];
    this.isLoadingPatient = false;
    this.isLoadingScans = false;
    this.error = null;
  }

  async loadPatient(id: string) {
    this.isLoadingPatient = true;
    this.error = null;

    try {
      const patient = await fetchPatientById(id);
      runInAction(() => {
        this.patient = patient;
        this.isLoadingPatient = false;
      });
    } catch (err: unknown) {
      runInAction(() => {
        this.error =
          err instanceof Error ? err.message : "Failed to load patient";
        this.isLoadingPatient = false;
      });
    }
  }

  async loadScans(patientId: string) {
    this.isLoadingScans = true;

    try {
      const scans = await fetchScansByPatient(patientId);
      runInAction(() => {
        this.scans = scans;
        this.isLoadingScans = false;
      });
    } catch (err: unknown) {
      runInAction(() => {
        this.error =
          err instanceof Error ? err.message : "Failed to load scans";
        this.isLoadingScans = false;
      });
    }
  }

  /** Load both patient info and their scans in parallel */
  async loadAll(patientId: string) {
    this.reset();
    await Promise.all([
      this.loadPatient(patientId),
      this.loadScans(patientId),
    ]);
  }
}

export default PatientDetailStore;
