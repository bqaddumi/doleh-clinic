import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/axios';
import { Pagination, Reservation, ReservationStatus, TodayReservationQueueItem } from '../../types';

export interface ReservationFilters {
  status?: ReservationStatus | '';
  date?: string;
  page: number;
  limit: number;
}

export interface ReservationPayload {
  fullName: string;
  phone: string;
  scheduledAt: string;
  notes?: string;
}

export interface ReservationAdminPayload {
  scheduledAt: string;
  status: ReservationStatus;
  adminNotes?: string;
}

interface ReservationsResponse {
  items: Reservation[];
  pagination: Pagination;
}

interface TodayReservationsOverview {
  currentSession: TodayReservationQueueItem | null;
  todaysReservations: TodayReservationQueueItem[];
}

interface ReservationAvailability {
  gapMinutes: number;
  reservedSlots: string[];
}

interface ReservationDateOptionsResponse {
  businessDays: number[];
  slotTimes: string[];
  options: Array<{
    date: string;
    isAvailable: boolean;
  }>;
}

export const useReservations = (filters: ReservationFilters) =>
  useQuery({
    queryKey: ['reservations', filters],
    queryFn: async () => {
      const response = await api.get<ReservationsResponse>('/reservations', {
        params: {
          page: filters.page,
          limit: filters.limit,
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.date ? { date: filters.date } : {})
        }
      });
      return response.data;
    }
  });

export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReservationPayload) => {
      const response = await api.post<Reservation>('/reservations', payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reservations'] });
      void queryClient.invalidateQueries({ queryKey: ['public-reservations-today'] });
    }
  });
};

export const usePublicCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReservationPayload) => {
      const response = await api.post<Reservation>('/public/reservations', payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['public-reservations-today'] });
      void queryClient.invalidateQueries({ queryKey: ['reservations'] });
    }
  });
};

export const useTodayReservationsOverview = () =>
  useQuery({
    queryKey: ['public-reservations-today'],
    queryFn: async () => {
      const response = await api.get<TodayReservationsOverview>('/public/reservations/today');
      return response.data;
    },
    refetchInterval: 60_000
  });

export const useReservationAvailability = (date: string) =>
  useQuery({
    queryKey: ['reservation-availability', date],
    queryFn: async () => {
      const response = await api.get<ReservationAvailability>('/public/reservations/availability', {
        params: { date }
      });
      return response.data;
    },
    enabled: Boolean(date)
  });

export const useReservationDateOptions = (days = 30) =>
  useQuery({
    queryKey: ['reservation-date-options', days],
    queryFn: async () => {
      const response = await api.get<ReservationDateOptionsResponse>('/public/reservations/date-options', {
        params: { days }
      });
      return response.data;
    }
  });

export const useUpdateReservationByAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reservationId, payload }: { reservationId: string; payload: ReservationAdminPayload }) => {
      const response = await api.put<Reservation>(`/reservations/${reservationId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reservations'] });
    }
  });
};
