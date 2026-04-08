export type Gender = 'male' | 'female';
export type ProgressStatus = 'improving' | 'stable' | 'worse';

export interface User {
  _id?: string;
  id: string;
  fullName: string;
  email: string;
  role: 'admin';
}

export interface Patient {
  _id: string;
  fullName: string;
  phone: string;
  age: number;
  gender: Gender;
  address?: string;
  condition: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastVisit?: string | null;
}

export interface Report {
  _id: string;
  patientId:
    | string
    | {
        _id: string;
        fullName: string;
        phone?: string;
        condition?: string;
        age?: number;
        gender?: Gender;
      };
  date: string;
  diagnosis: string;
  treatmentPlan: string;
  sessionNotes: string;
  progress: ProgressStatus;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
