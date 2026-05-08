import { makeAutoObservable, runInAction } from "mobx";
import { Scan, AIResult, ScanStatus } from "@/types/scan.types";
import {
  fetchScanById,
  fetchAIResultsByScan,
  fetchScanViewUrl,
} from "@/services/scanApi";

export class ScanResultStore {
  scan: Scan | null = null;
  scanViewUrl: string | null = null;
  aiResults: AIResult[] = [];
  isLoadingScan = false;
  isLoadingResults = false;
  error: string | null = null;

  // Polling
  private _pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // ── Computed ─────────────────────────────────────────────

  get isLoading(): boolean {
    return this.isLoadingScan || this.isLoadingResults;
  }

  get isPending(): boolean {
    if (!this.scan) return true;
    return [
      ScanStatus.PENDING,
      ScanStatus.UPLOADING,
      ScanStatus.UPLOADED,
      ScanStatus.PROCESSING,
    ].includes(this.scan.status);
  }

  get isProcessed(): boolean {
    return this.scan?.status === ScanStatus.PROCESSED;
  }

  get isFailed(): boolean {
    return this.scan?.status === ScanStatus.FAILED;
  }

  get primaryResult(): AIResult | null {
    return this.aiResults.length > 0 ? this.aiResults[0] : null;
  }

  get statusLabel(): string {
    if (!this.scan) return "";
    switch (this.scan.status) {
      case ScanStatus.PENDING:
        return "Pending";
      case ScanStatus.UPLOADING:
        return "Uploading";
      case ScanStatus.UPLOADED:
        return "Uploaded — waiting for processing";
      case ScanStatus.PROCESSING:
        return "Processing…";
      case ScanStatus.PROCESSED:
        return "Processed";
      case ScanStatus.FAILED:
        return "Failed";
      default:
        return this.scan.status;
    }
  }

  // ── Actions ──────────────────────────────────────────────

  clearError() {
    this.error = null;
  }

  async loadScan(scanId: string) {
    this.isLoadingScan = true;
    this.error = null;

    try {
      const [scan, scanViewUrl] = await Promise.all([
        fetchScanById(scanId),
        fetchScanViewUrl(scanId).catch(() => null),
      ]);

      runInAction(() => {
        this.scan = scan;
        this.scanViewUrl = scanViewUrl;
        this.isLoadingScan = false;
      });
    } catch (err: unknown) {
      runInAction(() => {
        this.error =
          err instanceof Error ? err.message : "Failed to load scan";
        this.isLoadingScan = false;
      });
    }
  }

  async loadAIResults(scanId: string) {
    this.isLoadingResults = true;

    try {
      const results = await fetchAIResultsByScan(scanId);
      runInAction(() => {
        this.aiResults = results;
        this.isLoadingResults = false;
      });
    } catch (err: unknown) {
      runInAction(() => {
        this.error =
          err instanceof Error ? err.message : "Failed to load AI results";
        this.isLoadingResults = false;
      });
    }
  }

  /** Load scan and AI results in parallel */
  async loadAll(scanId: string) {
    this.reset();
    await Promise.all([this.loadScan(scanId), this.loadAIResults(scanId)]);

    // If scan is still processing, start polling for status updates
    if (this.isPending) {
      this.startPolling(scanId);
    }
  }

  /**
   * Poll for scan status updates every 5 seconds while scan is pending.
   */
  startPolling(scanId: string) {
    this.stopPolling();

    this._pollTimer = setInterval(async () => {
      try {
        const [scan, scanViewUrl] = await Promise.all([
          fetchScanById(scanId),
          fetchScanViewUrl(scanId).catch(() => null),
        ]);

        runInAction(() => {
          this.scan = scan;
          this.scanViewUrl = scanViewUrl;
        });

        // If scan is now processed, load AI results and stop polling
        if (scan.status === ScanStatus.PROCESSED) {
          this.stopPolling();
          await this.loadAIResults(scanId);
        }

        // If scan failed, stop polling
        if (scan.status === ScanStatus.FAILED) {
          this.stopPolling();
        }
      } catch {
        // Silently continue polling on transient errors
      }
    }, 5000);
  }

  stopPolling() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
  }

  /** Manually refresh scan data */
  async refresh(scanId: string) {
    await Promise.all([this.loadScan(scanId), this.loadAIResults(scanId)]);
  }

  reset() {
    this.stopPolling();
    this.scan = null;
    this.scanViewUrl = null;
    this.aiResults = [];
    this.isLoadingScan = false;
    this.isLoadingResults = false;
    this.error = null;
  }
}

export default ScanResultStore;
