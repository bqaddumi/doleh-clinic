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

export const createReportRequest = async (payload: ReportPayload) => {
  const response = await api.post<Report>('/reports', payload);
  return response.data;
};

export const updateReportRequest = async (reportId: string, payload: ReportPayload) => {
  const response = await api.put<Report>(`/reports/${reportId}`, payload);
  return response.data;
};

interface ReportsResponse {
  items: Report[];
  pagination: Pagination;
}

interface UploadedFile {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
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
    mutationFn: createReportRequest,
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
    mutationFn: async (payload: ReportPayload) => updateReportRequest(reportId, payload),
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

export const useUploadAttachments = () =>
  useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }

      const response = await api.post<{ files: UploadedFile[] }>('/uploads', formData);

      return response.data.files;
    }
  });
