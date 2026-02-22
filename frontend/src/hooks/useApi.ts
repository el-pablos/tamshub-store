import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Product, Category, Order, PaymentMethod, Slider, LeaderboardEntry, ApiResponse } from '@/types';

// ========== Site / Settings ==========
export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Record<string, string>>>('/site/settings');
      return data.data;
    },
  });
}

export function useSliders() {
  return useQuery({
    queryKey: ['sliders'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Slider[]>>('/site/sliders');
      return data.data;
    },
  });
}

export function useSiteStats() {
  return useQuery({
    queryKey: ['site-stats'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{
        total_orders: number;
        total_products: number;
        total_users: number;
        success_rate: number;
      }>>('/site/stats');
      return data.data;
    },
  });
}

// ========== Categories ==========
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Category[]>>('/products/categories');
      return data.data;
    },
  });
}

// ========== Products ==========
export function useProducts(params?: { category?: string; search?: string; brand?: string }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Product[]>>('/products', { params });
      return data.data;
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Product>>(`/products/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<string[]>>('/products/brands');
      return data.data;
    },
  });
}

// ========== Payment Methods ==========
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaymentMethod[]>>('/payment/methods');
      return data.data;
    },
  });
}

// ========== Orders ==========
export function useCheckout() {
  return useMutation({
    mutationFn: async (payload: {
      product_id: number;
      target_id: string;
      target_server?: string;
      payment_method_code: string;
      phone?: string;
      email?: string;
    }) => {
      const { data } = await api.post<ApiResponse<{
        order: Order;
        payment_url?: string;
      }>>('/orders/checkout', payload);
      return data.data;
    },
  });
}

export function useOrderStatus(invoice: string) {
  return useQuery({
    queryKey: ['order-status', invoice],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Order>>(`/orders/${invoice}/status`);
      return data.data;
    },
    enabled: !!invoice,
    refetchInterval: (query) => {
      const order = query.state.data;
      if (order && ['success', 'failed', 'expired'].includes(order.status)) {
        return false;
      }
      return 5000; // Poll every 5s for pending orders
    },
  });
}

export function useOrderHistory() {
  return useQuery({
    queryKey: ['order-history'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Order[]>>('/orders/history');
      return data.data;
    },
  });
}

export function useSubmitComplaint() {
  return useMutation({
    mutationFn: async (payload: {
      invoice_number: string;
      subject: string;
      message: string;
    }) => {
      const { data } = await api.post<ApiResponse<unknown>>('/orders/complaint', payload);
      return data.data;
    },
  });
}

// ========== Leaderboard ==========
export function useLeaderboard(period?: string) {
  return useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<LeaderboardEntry[]>>('/leaderboard', {
        params: period ? { period } : undefined,
      });
      return data.data;
    },
  });
}

// ========== Auth ==========
export function useLogin() {
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await api.post<ApiResponse<{ user: import('@/types').User; token: string }>>(
        '/auth/login',
        payload
      );
      return data.data;
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) => {
      const { data } = await api.post<ApiResponse<{ user: import('@/types').User; token: string }>>(
        '/auth/register',
        payload
      );
      return data.data;
    },
  });
}
