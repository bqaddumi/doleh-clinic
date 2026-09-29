import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/axios';
import { Banner } from '../../types';

interface BannersResponse {
  items: Banner[];
}

export interface BannerPayload {
  messageEn: string;
  messageAr: string;
  isActive: boolean;
  order: number;
}

export const useBanners = () =>
  useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await api.get<BannersResponse>('/banners');
      return response.data.items;
    }
  });

export const useActiveBanners = () =>
  useQuery({
    queryKey: ['active-banners'],
    queryFn: async () => {
      const response = await api.get<BannersResponse>('/public/banners');
      return response.data.items;
    },
    refetchInterval: 60000
  });

export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BannerPayload) => {
      const response = await api.post<Banner>('/banners', payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['banners'] });
      void queryClient.invalidateQueries({ queryKey: ['active-banners'] });
    }
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bannerId, payload }: { bannerId: string; payload: BannerPayload }) => {
      const response = await api.put<Banner>(`/banners/${bannerId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['banners'] });
      void queryClient.invalidateQueries({ queryKey: ['active-banners'] });
    }
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bannerId: string) => {
      await api.delete(`/banners/${bannerId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['banners'] });
      void queryClient.invalidateQueries({ queryKey: ['active-banners'] });
    }
  });
};
