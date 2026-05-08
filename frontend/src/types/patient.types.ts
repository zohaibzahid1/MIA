export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export interface Patient {
  id: string;
  userId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  medicalRecordNumber: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: Gender;
  medicalRecordNumber: string;
  notes?: string;
}

export interface UpdatePatientInput {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  notes?: string;
}
