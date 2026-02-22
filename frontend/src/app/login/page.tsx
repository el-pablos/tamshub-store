'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useLogin } from '@/hooks/useApi';
import { useAuthStore } from '@/store/auth';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (!form.email) { setFormErrors({ email: 'Email wajib diisi' }); return; }
    if (!form.password) { setFormErrors({ password: 'Password wajib diisi' }); return; }

    try {
      const result = await login.mutateAsync(form);
      setAuth(result.user, result.token);
      router.push('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormErrors({ general: error.response?.data?.message || 'Login gagal' });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Masuk ke TamsHub</h1>
        <p className="text-gray-400 text-sm">
          Belum punya akun?{' '}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300">
            Daftar di sini
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formErrors.general && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{formErrors.general}</p>
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={formErrors.email}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Masukkan password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={formErrors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <Button type="submit" loading={login.isPending} className="w-full">
          Masuk
        </Button>
      </form>
    </div>
  );
}
