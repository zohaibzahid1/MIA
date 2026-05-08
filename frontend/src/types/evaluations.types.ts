import { Question } from './template.types';

export interface departmentEvaluation {
  id: number;
  cycleCount: number;
  name: string;
  dueDate: string;
  departmentName: string;
  isCompleted: boolean;
}

// User interface for evaluations (simplified from userStore.ts)
export interface EvaluationUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Template interface for evaluations (extends from template.types.ts)
export interface EvaluationTemplate {
  id: number;
  name: string;
  questions: Pick<Question, 'qid' | 'weightage' | 'isQuantitative' | 'description'>[];
}

// Evaluation Score interface
export interface EvaluationScore {
  id: number;
  score: number;
  comment?: string; // Optional comment for each score
  question: Pick<Question, 'qid' | 'weightage'>;
}

// Main UserEvaluation interface (moved from userEvaluationStore.ts)
export interface UserEvaluation {
  id: number;
  type: string;
  createdAt: string;
  dueDate: string;
  score: number | null;
  finalComment?: string; // Optional final comment for the evaluation
  isCompleted?: boolean;
  isOnTime?: boolean; // Whether the evaluation was submitted on time
  receiver: EvaluationUser;
  evaluator: EvaluationUser;
  template: EvaluationTemplate;
  evaluationScores: EvaluationScore[];
}

// Additional evaluation-related types
export type EvaluationType = 'manager' | 'peer' | 'self';

export interface CreateEvaluationInput {
  departmentId: number;
  managerId: number;
  managerTemplateId: number;
  peerTemplateId: number;
  selfTemplateId: number;
  dueDate: string;
}

// Evaluation Details types for the popup modal
export interface EvaluationDetails {
  id: number;
  type: string;
  createdAt: string;
  dueDate: string;
  score: number | null;
  finalComment?: string; // Optional final comment for the evaluation
  isOnTime?: boolean; // Track whether evaluation was submitted on time
  evaluator: EvaluationUser;
  receiver: EvaluationUser;
  template: EvaluationTemplate;
  evaluationScores: EvaluationDetailsScore[];
}

export interface EvaluationDetailsScore {
  id: number;
  score: string;
  comment?: string; // Optional comment for each score
  question: EvaluationDetailsQuestion;
}

export interface EvaluationDetailsQuestion {
  qid: number;
  description: string;
  weightage: number;
  isQuantitative: boolean;
}

// API Response types
export interface GetUserCurrentEvaluationsResponse {
  getUserCurrentEvaluations: UserEvaluation[];
}

export interface CreateEvaluationForDepartmentResponse {
  createEvaluationForDepartment: UserEvaluation[];
}