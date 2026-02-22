export interface Product {
  id: number;
  category_id: number;
  category?: Category;
  buyer_sku_code: string;
  product_name: string;
  slug: string;
  brand: string | null;
  price: number;
  base_price?: number;
  image_url?: string | null;
  description: string | null;
  type: string;
  is_active: boolean;
  is_promo: boolean;
  prices?: Array<{
    id: number;
    name: string;
    sell_price: number;
  }>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  type: string;
  products_count?: number;
}

export interface Order {
  id: number;
  invoice: string;
  product?: { id: number; product_name: string; brand: string | null };
  target_id: string;
  zone_id: string | null;
  sell_price: number;
  payment_fee: number;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_url: string | null;
  provider_sn?: string;
  paid_at: string | null;
  expired_at: string | null;
  created_at: string;
  has_complaint: boolean;
}

export interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  group: string;
  image_url: string | null;
  fee_flat: number;
  fee_percent: number;
}

export interface SiteSettings {
  site_name: string;
  site_description: string;
  site_logo: string | null;
  site_favicon: string | null;
  admin_whatsapp: string;
  hero_text: string;
  meta_title: string;
  meta_description: string;
  system_mode: string;
  sliders: Slider[];
}

export interface Slider {
  id: number;
  title: string | null;
  image_url: string;
  link_url: string | null;
}

export interface LeaderboardEntry {
  user_display: string;
  member_level: string;
  total_transactions: number;
  total_amount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  member_level: string;
}
