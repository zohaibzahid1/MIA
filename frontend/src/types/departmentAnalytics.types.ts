export interface DepartmentEvaluation {
  id: number;
  type: string;
  score: number | null;
  receiverName: string;
  receiverId: number;
  templateName: string;
  dueDate: Date;
}

export interface FinalEvaluation {
  id: number;
  score: number | null;
  isCompleted: boolean;
  evaluations: DepartmentEvaluation[];
}

export interface DepartmentMember {
  userId: number;
  userName: string;
  userEmail: string;
  userRole: string;
  finalEvaluation: FinalEvaluation;
  // Computed properties
  receivedEvaluations?: DepartmentEvaluation[]; // evaluations where this member was the receiver
  givenEvaluations?: DepartmentEvaluation[]; // evaluations where this member was the evaluator (for managers)
  avgScoreWithManager?: number;
  avgScoreWithoutManager?: number;
}

export interface DepartmentCycle {
  cycleCount: number;
  cycleId: number;
  createdAt: Date;
  cycleManagerId: number | null; // Manager ID for this specific cycle
  members: DepartmentMember[];
}

export interface DepartmentAnalytics {
  departmentId: number;
  departmentName: string;
  departmentManagerId: number;
  cycles: DepartmentCycle[];
}

export interface GetDepartmentAnalyticsResponse {
  getDepartmentEvaluationAnalytics: DepartmentAnalytics;
}
