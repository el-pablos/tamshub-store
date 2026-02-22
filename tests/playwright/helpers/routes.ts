/**
 * Test constants and route definitions for TamsHub Store
 */

export const BASE_URL = 'http://localhost:3000';
export const API_URL = 'http://127.0.0.1:8000/api/v1';

// Test accounts
export const TEST_USER = {
  email: 'user@tamshub.store',
  password: 'user123',
  name: 'User Demo',
};

export const TEST_ADMIN = {
  email: 'admin@tamshub.store',
  password: 'admin123',
  name: 'Admin TamsHub',
};

// Public routes (no auth required)
export const PUBLIC_ROUTES = [
  { path: '/', name: 'Landing Page' },
  { path: '/products', name: 'Katalog Produk' },
  { path: '/leaderboard', name: 'Leaderboard' },
  { path: '/login', name: 'Login' },
  { path: '/register', name: 'Register' },
  { path: '/cek-transaksi', name: 'Cek Transaksi' },
];

// Product detail routes (dynamic)
export const PRODUCT_SLUGS = [
  'ml-86-diamonds',
  'ff-70-diamonds',
  'genshin-60-genesis',
  'valorant-125-vp',
  'pubg-60-uc',
  'pulsa-tsel-10k',
];

// Auth user routes
export const AUTH_ROUTES = [
  { path: '/history', name: 'Riwayat Transaksi' },
];

// Admin routes
export const ADMIN_ROUTES = [
  { path: '/admin', name: 'Admin Dashboard' },
  { path: '/admin/products', name: 'Admin Produk' },
  { path: '/admin/orders', name: 'Admin Pesanan' },
  { path: '/admin/users', name: 'Admin Pengguna' },
  { path: '/admin/complaints', name: 'Admin Komplain' },
  { path: '/admin/settings', name: 'Admin Pengaturan' },
];

// API endpoints (public)
export const PUBLIC_API_ENDPOINTS = [
  { path: '/categories', name: 'Categories' },
  { path: '/products', name: 'Products' },
  { path: '/leaderboard', name: 'Leaderboard' },
  { path: '/payment/methods', name: 'Payment Methods' },
  { path: '/site/settings', name: 'Site Settings' },
  { path: '/brands', name: 'Brands' },
];

// Test order invoices
export const TEST_INVOICES = {
  success: 'INV-20260222-00001',
  pending: 'INV-20260222-00002',
  failed: 'INV-20260222-00003',
};
