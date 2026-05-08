import { makeAutoObservable, runInAction } from "mobx";
import { UserAnalytics } from "@/types/analytics.types";
import { fetchMyAnalytics } from "@/services/analyticsApi";

export class AnalyticsStore {
  analytics: UserAnalytics | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    console.log("AnalyticsStore initialized");
  }

  // ── Computed ─────────────────────────────────────────────

  get totalPatients(): number {
    return this.analytics?.totalPatients ?? 0;
  }

  get totalScans(): number {
    return this.analytics?.totalScans ?? 0;
  }

  get averageScansPerPatient(): number {
    return this.analytics?.averageScansPerPatient ?? 0;
  }

  get scanTypeDistribution() {
    return this.analytics?.scanTypeDistribution ?? [];
  }

  get statusBreakdown() {
    return this.analytics?.statusBreakdown ?? [];
  }

  // ── Actions ──────────────────────────────────────────────

  clearError() {
    this.error = null;
  }

  async loadAnalytics() {
    this.isLoading = true;
    this.error = null;

    try {
      const analytics = await fetchMyAnalytics();
      runInAction(() => {
        this.analytics = analytics;
        this.isLoading = false;
      });
    } catch (err: unknown) {
      runInAction(() => {
        this.error =
          err instanceof Error ? err.message : "Failed to load analytics";
        this.isLoading = false;
      });
    }
  }
}

export default AnalyticsStore;
