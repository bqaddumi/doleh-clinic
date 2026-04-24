export type Gender = 'male' | 'female';
export type ProgressStatus = 'improving' | 'stable' | 'worse';
export type UserRole = 'admin' | 'patient';
export type ReservationStatus = 'pending' | 'accepted' | 'rejected';

export interface User {
  _id?: string;
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface Reservation {
  _id: string;
  userId:
    | string
    | null
    | {
        _id: string;
        fullName: string;
        email: string;
        role: UserRole;
      };
  fullName: string;
  phone: string;
  scheduledAt: string;
  status: ReservationStatus;
  notes?: string;
  adminNotes?: string;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TodayReservationQueueItem {
  _id: string;
  fullName: string;
  phone: string;
  scheduledAt: string;
  status: ReservationStatus;
  queuePosition: number;
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
