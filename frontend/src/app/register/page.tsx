'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRegister } from '@/hooks/useApi';
import { useAuthStore } from '@/store/auth';
import { Button, Input } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (!form.name) { setFormErrors({ name: 'Nama wajib diisi' }); return; }
    if (!form.email) { setFormErrors({ email: 'Email wajib diisi' }); return; }
    if (!form.password) { setFormErrors({ password: 'Password wajib diisi' }); return; }
    if (form.password.length < 8) { setFormErrors({ password: 'Password minimal 8 karakter' }); return; }
    if (form.password !== form.password_confirmation) {
      setFormErrors({ password_confirmation: 'Konfirmasi password tidak cocok' });
      return;
    }

    try {
      const result = await register.mutateAsync(form);
      setAuth(result.user, result.token);
      router.push('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      if (error.response?.data?.errors) {
        const errs: Record<string, string> = {};
        for (const [k, v] of Object.entries(error.response.data.errors)) {
          errs[k] = v[0];
        }
        setFormErrors(errs);
      } else {
        setFormErrors({ general: error.response?.data?.message || 'Gagal mendaftar' });
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Daftar Akun</h1>
        <p className="text-gray-400 text-sm">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
            Masuk di sini
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
          label="Nama Lengkap"
          placeholder="Nama kamu"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={formErrors.name}
        />

        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={formErrors.email}
        />

        <Input
          label="No. WhatsApp (opsional)"
          placeholder="08xxxxxxxxxx"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          error={formErrors.phone}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Minimal 8 karakter"
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

        <Input
          label="Konfirmasi Password"
          type="password"
          placeholder="Ulangi password"
          value={form.password_confirmation}
          onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
          error={formErrors.password_confirmation}
        />

        <Button type="submit" loading={register.isPending} className="w-full">
          Daftar
        </Button>
      </form>
    </div>
  );
}
