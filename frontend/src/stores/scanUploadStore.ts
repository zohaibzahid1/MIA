import { makeAutoObservable, runInAction } from "mobx";
import { ScanType, CreateScanInput } from "@/types/scan.types";
import {
  initiateScanUpload,
  uploadFileToS3,
  confirmScanUpload,
} from "@/services/scanApi";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export type UploadStep = "idle" | "validating" | "initiating" | "uploading" | "confirming" | "done" | "error";

export class ScanUploadStore {
  // ── File state ─────────────────────────────────────────
  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;
  validationError: string | null = null;

  // ── Form state ─────────────────────────────────────────
  scanType: ScanType = ScanType.XRAY;
  notes: string = "";

  // ── Upload state ───────────────────────────────────────
  uploadStep: UploadStep = "idle";
  uploadProgress: number = 0;
  error: string | null = null;

  // ── Presigned data ─────────────────────────────────────
  private _scanId: string | null = null;
  private _s3Key: string | null = null;
  private _uploadUrl: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // ── Computed ─────────────────────────────────────────────

  get isUploading(): boolean {
    return ["validating", "initiating", "uploading", "confirming"].includes(
      this.uploadStep
    );
  }

  get canUpload(): boolean {
    return (
      this.selectedFile !== null &&
      this.validationError === null &&
      !this.isUploading
    );
  }

  get uploadStepLabel(): string {
    switch (this.uploadStep) {
      case "validating":
        return "Validating file…";
      case "initiating":
        return "Requesting upload URL…";
      case "uploading":
        return "Uploading to cloud storage…";
      case "confirming":
        return "Confirming upload…";
      case "done":
        return "Upload complete!";
      case "error":
        return "Upload failed";
      default:
        return "";
    }
  }

  // ── Actions ──────────────────────────────────────────────

  setScanType(type: ScanType) {
    this.scanType = type;
  }

  setNotes(notes: string) {
    this.notes = notes;
  }

  clearError() {
    this.error = null;
    if (this.uploadStep === "error") {
      this.uploadStep = "idle";
    }
  }

  /**
   * Validate and set the selected file.
   */
  selectFile(file: File | null) {
    // Revoke previous preview URL
    if (this.filePreviewUrl) {
      URL.revokeObjectURL(this.filePreviewUrl);
      this.filePreviewUrl = null;
    }

    this.validationError = null;
    this.selectedFile = null;
    this.error = null;
    this.uploadStep = "idle";
    this.uploadProgress = 0;

    if (!file) return;

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      this.validationError = `Invalid file type "${file.type}". Accepted: PNG, JPEG.`;
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      this.validationError = `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: 50 MB.`;
      return;
    }

    this.selectedFile = file;
    this.filePreviewUrl = URL.createObjectURL(file);
  }

  removeFile() {
    if (this.filePreviewUrl) {
      URL.revokeObjectURL(this.filePreviewUrl);
    }
    this.selectedFile = null;
    this.filePreviewUrl = null;
    this.validationError = null;
    this.error = null;
    this.uploadStep = "idle";
    this.uploadProgress = 0;
  }

  /**
   * Full upload flow:
   * 1. Validate → 2. Initiate (get presigned URL) → 3. Upload to S3 → 4. Confirm
   */
  async uploadScan(patientId: string): Promise<boolean> {
    if (!this.selectedFile) {
      this.error = "No file selected";
      return false;
    }

    const file = this.selectedFile;

    try {
      // Step 1: Validate
      runInAction(() => {
        this.uploadStep = "validating";
        this.error = null;
      });

      if (!ACCEPTED_TYPES.includes(file.type)) {
        throw new Error("Invalid file type");
      }

      // Step 2: Initiate scan upload (get presigned URL from backend)
      runInAction(() => {
        this.uploadStep = "initiating";
      });

      const input: CreateScanInput = {
        patientId,
        scanType: this.scanType,
        notes: this.notes || undefined,
        originalFileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      };

      const presigned = await initiateScanUpload(input);

      runInAction(() => {
        this._scanId = presigned.scanId;
        this._uploadUrl = presigned.uploadUrl;
        this._s3Key = presigned.s3Key;
      });

      // Step 3: Upload file directly to S3
      runInAction(() => {
        this.uploadStep = "uploading";
        this.uploadProgress = 0;
      });

      await uploadFileToS3(presigned.uploadUrl, file, (percent) => {
        runInAction(() => {
          this.uploadProgress = percent;
        });
      });

      // Step 4: Confirm upload with backend
      runInAction(() => {
        this.uploadStep = "confirming";
        this.uploadProgress = 100;
      });

      await confirmScanUpload(presigned.scanId, presigned.s3Key);

      runInAction(() => {
        this.uploadStep = "done";
      });

      return true;
    } catch (err: unknown) {
      runInAction(() => {
        this.uploadStep = "error";
        this.error =
          err instanceof Error ? err.message : "Upload failed unexpectedly";
      });
      return false;
    }
  }

  reset() {
    if (this.filePreviewUrl) {
      URL.revokeObjectURL(this.filePreviewUrl);
    }
    this.selectedFile = null;
    this.filePreviewUrl = null;
    this.validationError = null;
    this.scanType = ScanType.XRAY;
    this.notes = "";
    this.uploadStep = "idle";
    this.uploadProgress = 0;
    this.error = null;
    this._scanId = null;
    this._s3Key = null;
    this._uploadUrl = null;
  }
}

export default ScanUploadStore;
