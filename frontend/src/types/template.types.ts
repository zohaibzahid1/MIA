export interface Question {
  qid: number;
  description: string;
  weightage: number;
  templateId: number;
  isQuantitative: boolean;
}

export interface Template {
  id: number;
  name: string;
  createdAt: string;
  deletedAt?: string;
  questions: Question[];
  isUpdated: boolean; // Flag to indicate if the template has been updated
}

export interface CreateQuestionInput {
  description: string;
  weightage: number;
  isQuantitative: boolean;
}

export interface CreateTemplateInput {
  name: string;
  questions: CreateQuestionInput[];
}

export interface UpdateTemplateInput {
  id: number;
  name: string;
  questions: CreateQuestionInput[];
}

export interface GetTemplateByIdResponse {
  getTemplateById: Template;
}

export interface GetAllTemplatesResponse {
  getAllTemplates: Template[];
}

export interface CreateTemplateResponse {
  createTemplate: Template;
}

export interface CreateTemplateWithQuestionsResponse {
  createTemplateWithQuestions: Template;
}

export interface CreateEmployeeTemplateWithQuestionsResponse {
  createEmployeeTemplateWithQuestions: Template;
}

export interface SoftDeleteTemplateResponse {
  softDeleteTemplate: Template;
}

export interface UpdateTemplateResponse {
  updateTemplate: Template;
}

export interface RecoverTemplateResponse {
  recoverTemplate: Template;
}
