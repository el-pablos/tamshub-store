import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';

// ========== Dashboard ==========
export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{
        total_orders: number;
        total_revenue: number;
        pending_orders: number;
        today_orders: number;
        recent_orders: Array<{
          id: number;
          invoice_number: string;
          product_name: string;
          total_price: number;
          status: string;
          created_at: string;
        }>;
      }>>('/admin/dashboard');
      return data.data;
    },
  });
}

// ========== Orders ==========
export function useAdminOrders(params?: { status?: string; page?: number; search?: string }) {
  return useQuery({
    queryKey: ['admin-orders', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{
        data: Array<{
          id: number;
          invoice_number: string;
          product_name: string;
          target_id: string;
          total_price: number;
          status: string;
          payment_method: string;
          created_at: string;
          user?: { name: string; email: string };
        }>;
        meta: { current_page: number; last_page: number; total: number };
      }>>('/admin/orders', { params });
      return data.data;
    },
  });
}

export function useApproveOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: number) => {
      const { data } = await api.post<ApiResponse<unknown>>(`/admin/orders/${orderId}/approve`);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });
}

export function useRetryOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: number) => {
      const { data } = await api.post<ApiResponse<unknown>>(`/admin/orders/${orderId}/retry`);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });
}

// ========== Products ==========
export function useAdminProducts(params?: { page?: number; search?: string }) {
  return useQuery({
    queryKey: ['admin-products', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{
        data: Array<{
          id: number;
          name: string;
          slug: string;
          brand: string;
          category_name: string;
          is_active: boolean;
          prices_count: number;
        }>;
        meta: { current_page: number; last_page: number; total: number };
      }>>('/admin/products', { params });
      return data.data;
    },
  });
}

export function useSyncProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<{ synced: number }>>('/admin/products/sync');
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}

export function useToggleProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: number) => {
      const { data } = await api.patch<ApiResponse<unknown>>(`/admin/products/${productId}/toggle`);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}

// ========== Users ==========
export function useAdminUsers(params?: { page?: number; search?: string }) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{
        data: Array<{
          id: number;
          name: string;
          email: string;
          phone: string;
          role: string;
          member_level: string;
          is_active: boolean;
          created_at: string;
          orders_count: number;
        }>;
        meta: { current_page: number; last_page: number; total: number };
      }>>('/admin/users', { params });
      return data.data;
    },
  });
}

export function useToggleUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      const { data } = await api.patch<ApiResponse<unknown>>(`/admin/users/${userId}/toggle-active`);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

// ========== Complaints ==========
export function useAdminComplaints(params?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ['admin-complaints', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{
        data: Array<{
          id: number;
          invoice_number: string;
          subject: string;
          status: string;
          user_name: string;
          created_at: string;
          messages_count: number;
        }>;
        meta: { current_page: number; last_page: number; total: number };
      }>>('/admin/complaints', { params });
      return data.data;
    },
  });
}

export function useReplyComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, message }: { id: number; message: string }) => {
      const { data } = await api.post<ApiResponse<unknown>>(`/admin/complaints/${id}/reply`, { message });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-complaints'] }),
  });
}

// ========== Settings ==========
export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Record<string, string>>>('/admin/settings');
      return data.data;
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      const { data } = await api.put<ApiResponse<unknown>>('/admin/settings', { settings });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-settings'] }),
  });
}
