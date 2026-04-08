import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/axios';
import { Pagination, Report } from '../../types';

export interface ReportFilters {
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
}

export interface ReportPayload {
  patientId: string;
  date: string;
  diagnosis: string;
  treatmentPlan: string;
  sessionNotes: string;
  progress: 'improving' | 'stable' | 'worse';
  attachments?: string[];
}

interface ReportsResponse {
  items: Report[];
  pagination: Pagination;
}

export const useReports = (filters: ReportFilters) =>
  useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      const response = await api.get<ReportsResponse>('/reports', { params: filters });
      return response.data;
    }
  });

export const useReportDetails = (reportId: string) =>
  useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      const response = await api.get<Report>(`/reports/${reportId}`);
      return response.data;
    },
    enabled: Boolean(reportId)
  });

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReportPayload) => {
      const response = await api.post<Report>('/reports', payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
      void queryClient.invalidateQueries({ queryKey: ['patient'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
};

export const useUpdateReport = (reportId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReportPayload) => {
      const response = await api.put<Report>(`/reports/${reportId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      void queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
      void queryClient.invalidateQueries({ queryKey: ['patient'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      await api.delete(`/reports/${reportId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
      void queryClient.invalidateQueries({ queryKey: ['patient'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
};
