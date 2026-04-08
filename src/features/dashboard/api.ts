import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/axios';
import { Patient } from '../../types';

interface DashboardStats {
  totalPatients: number;
  totalReports: number;
  recentPatients: Patient[];
  charts: {
    progressBreakdown: Array<{ label: 'improving' | 'stable' | 'worse'; value: number }>;
    conditionBreakdown: Array<{ label: string; value: number }>;
    reportTrend: Array<{ label: string; value: number }>;
  };
}

export const useDashboardStats = () =>
  useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get<DashboardStats>('/dashboard/stats');
      return response.data;
    }
  });
