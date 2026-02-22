'use client';

import { useState } from 'react';
import { Search, Power } from 'lucide-react';
import { useAdminUsers, useToggleUser } from '@/hooks/useAdminApi';
import { Loading, ErrorState, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useAdminUsers({ search: search || undefined, page });
  const toggleUser = useToggleUser();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Manajemen Pengguna</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="text"
          placeholder="Cari pengguna..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-gray-700">
                  <th className="text-left p-4">Nama</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Level</th>
                  <th className="text-left p-4">Order</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Joined</th>
                  <th className="text-left p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data?.data?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/50">
                    <td className="p-4 text-white">{user.name}</td>
                    <td className="p-4 text-gray-400 text-xs">{user.email}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium ${user.role === 'admin' ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-xs capitalize">{user.member_level}</td>
                    <td className="p-4 text-gray-400 text-xs">{user.orders_count}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium ${user.is_active ? 'text-green-400' : 'text-red-400'}`}>
                        {user.is_active ? 'Aktif' : 'Banned'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">{formatDate(user.created_at)}</td>
                    <td className="p-4">
                      {user.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant={user.is_active ? 'danger' : 'secondary'}
                          onClick={() => toggleUser.mutate(user.id)}
                        >
                          <Power size={12} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {!data?.data?.length && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">Tidak ada pengguna</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data?.meta && data.meta.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium ${
                    page === p ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
