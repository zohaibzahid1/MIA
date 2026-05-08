export interface UserEvaluationAnalytics {
  evaluationsGiven: EvaluationAnalytics[];
  evaluationsReceived: EvaluationAnalytics[];
}

export interface EvaluationAnalytics {
  id: number;
  type: string;
  score: number | null;
  evaluatorName: string;
  evaluatorEmail: string;
  receiverName: string;
  receiverId: string;
  templateName: string;
  createdAt: string;
  dueDate: string;
  departmentName: string;
  cycleCount: number;
  cycleName: string;
  isOnTime?: boolean; // Track whether evaluation was submitted on time
}

export interface FinalEvaluationSummary {
  cycleCount: number;
  cycleName: string;
  departmentName: string;
  templateName: string;
  createdAt: string;
  dueDate: string;
  month: string; // For chart display (e.g., "Aug 2025")
  avgWithManager: number;
  avgWithoutManager: number;
  totalEvaluations: number;
  completedEvaluations: number;
  exactDate: string; // For tooltip display
}

export interface GetUserEvaluationAnalyticsResponse {
  getUserEvaluationAnalytics: UserEvaluationAnalytics;
}

export interface UserAnalyticsChartData {
  month: string;
  avgScore: number;
  exactDate: string;
  cycleCount: number;
  cycleName: string;
  departmentName: string;
  templateName: string;
  totalEvaluations: number;
}
