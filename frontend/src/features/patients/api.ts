import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/axios';
import { Pagination, Patient, Report } from '../../types';

export interface PatientFilters {
  search: string;
  page: number;
  limit: number;
  sortBy: 'fullName' | 'age' | 'condition' | 'createdAt' | 'lastVisit';
  sortOrder: 'asc' | 'desc';
}

interface PatientsResponse {
  items: Patient[];
  pagination: Pagination;
}

interface PatientDetailsResponse {
  patient: Patient;
  reports: Report[];
}

export interface PatientPayload {
  fullName: string;
  phone: string;
  age: number;
  gender: 'male' | 'female';
  address?: string;
  condition: string;
  notes?: string;
}

export const usePatients = (filters: PatientFilters) =>
  useQuery({
    queryKey: ['patients', filters],
    queryFn: async () => {
      const response = await api.get<PatientsResponse>('/patients', { params: filters });
      return response.data;
    }
  });

export const usePatientDetails = (patientId: string) =>
  useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await api.get<PatientDetailsResponse>(`/patients/${patientId}`);
      return response.data;
    },
    enabled: Boolean(patientId)
  });

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PatientPayload) => {
      const response = await api.post<Patient>('/patients', payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
      void queryClient.invalidateQueries({ queryKey: ['patient'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
};

export const useUpdatePatient = (patientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PatientPayload) => {
      const response = await api.put<Patient>(`/patients/${patientId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
      void queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientId: string) => {
      await api.delete(`/patients/${patientId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      void queryClient.invalidateQueries({ queryKey: ['patient'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
};
