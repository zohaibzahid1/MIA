import { graphQLApi } from './graphQlBaseApi';
import { Patient, CreatePatientInput, UpdatePatientInput } from '@/types/patient.types';

export async function fetchMyPatients(): Promise<Patient[]> {
  const query = `
    query MyPatients {
      myPatients {
        id
        userId
        firstName
        lastName
        dateOfBirth
        gender
        medicalRecordNumber
        notes
        createdAt
        updatedAt
        deletedAt
      }
    }
  `;

  const response = await graphQLApi.query<{ myPatients: Patient[] }>(query);
  return response.myPatients;
}

export async function fetchPatientById(id: string): Promise<Patient> {
  const query = `
    query Patient($id: ID!) {
      patient(id: $id) {
        id
        userId
        firstName
        lastName
        dateOfBirth
        gender
        medicalRecordNumber
        notes
        createdAt
        updatedAt
        deletedAt
      }
    }
  `;

  const response = await graphQLApi.query<{ patient: Patient }>(query, { id });
  return response.patient;
}

export async function createPatient(input: {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  medicalRecordNumber: string;
  notes?: string;
}): Promise<Patient> {
  const mutation = `
    mutation CreatePatient($input: CreatePatientInput!) {
      createPatient(input: $input) {
        id
        userId
        firstName
        lastName
        dateOfBirth
        gender
        medicalRecordNumber
        notes
        createdAt
        updatedAt
        deletedAt
      }
    }
  `;

  const response = await graphQLApi.mutation<{ createPatient: Patient }>(mutation, { input });
  return response.createPatient;
}

export async function deletePatient(id: string): Promise<boolean> {
  const mutation = `
    mutation DeletePatient($id: ID!) {
      deletePatient(id: $id)
    }
  `;

  const response = await graphQLApi.mutation<{ deletePatient: boolean }>(mutation, { id });
  return response.deletePatient;
}

export async function restorePatient(id: string): Promise<Patient> {
  const mutation = `
    mutation RestorePatient($id: ID!) {
      restorePatient(id: $id) {
        id
        userId
        firstName
        lastName
        dateOfBirth
        gender
        medicalRecordNumber
        notes
        createdAt
        updatedAt
        deletedAt
      }
    }
  `;

  const response = await graphQLApi.mutation<{ restorePatient: Patient }>(mutation, { id });
  return response.restorePatient;
}

export async function updatePatient(id: string, input: UpdatePatientInput): Promise<Patient> {
  const mutation = `
    mutation UpdatePatient($id: ID!, $input: UpdatePatientInput!) {
      updatePatient(id: $id, input: $input) {
        id
        userId
        firstName
        lastName
        dateOfBirth
        gender
        medicalRecordNumber
        notes
        createdAt
        updatedAt
        deletedAt
      }
    }
  `;

  const response = await graphQLApi.mutation<{ updatePatient: Patient }>(mutation, { id, input });
  return response.updatePatient;
}
