'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { useAdminSettings, useUpdateSettings } from '@/hooks/useAdminApi';
import { Loading, ErrorState, Button, Input } from '@/components/ui';

const settingLabels: Record<string, { label: string; type: string }> = {
  site_name: { label: 'Nama Situs', type: 'text' },
  site_description: { label: 'Deskripsi Situs', type: 'text' },
  whatsapp_number: { label: 'No. WhatsApp', type: 'text' },
  whatsapp_message: { label: 'Pesan WhatsApp Default', type: 'text' },
  maintenance_mode: { label: 'Mode Maintenance', type: 'select' },
  marquee_text: { label: 'Teks Marquee', type: 'text' },
  meta_keywords: { label: 'Meta Keywords', type: 'text' },
};

export default function AdminSettingsPage() {
  const { data: settings, isLoading, error, refetch } = useAdminSettings();
  const updateSettings = useUpdateSettings();
  const initialForm = settings ?? {};
  const [form, setForm] = useState<Record<string, string>>(initialForm);

  const handleSave = async () => {
    await updateSettings.mutateAsync(form);
  };

  if (isLoading) return <Loading text="Memuat pengaturan..." />;
  if (error) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Pengaturan Situs</h1>
        <Button onClick={handleSave} loading={updateSettings.isPending}>
          <Save size={14} />
          Simpan
        </Button>
      </div>

      {updateSettings.isSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
          <p className="text-green-400 text-sm">Pengaturan berhasil disimpan!</p>
        </div>
      )}

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 space-y-4">
        {Object.entries(form).map(([key, value]) => {
          const config = settingLabels[key] || { label: key, type: 'text' };

          if (config.type === 'select') {
            return (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{config.label}</label>
                <select
                  value={value}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="0">Nonaktif</option>
                  <option value="1">Aktif</option>
                </select>
              </div>
            );
          }

          return (
            <Input
              key={key}
              label={config.label}
              value={value}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          );
        })}
      </div>
    </div>
  );
}
