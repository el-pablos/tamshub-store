'use client';

import { useState } from 'react';
import { Trophy, Medal, Crown, ChevronDown } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useApi';
import { Loading, ErrorState } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState('monthly');
  const { data: entries, isLoading, error, refetch } = useLeaderboard(period);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} className="text-yellow-400" />;
    if (rank === 2) return <Medal size={20} className="text-gray-300" />;
    if (rank === 3) return <Medal size={20} className="text-amber-600" />;
    return <span className="text-gray-500 text-sm font-mono w-5 text-center">{rank}</span>;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Trophy size={40} className="text-yellow-400 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
        <p className="text-gray-400 text-sm">Top spender di TamsHub Store</p>
      </div>

      {/* Period Selector */}
      <div className="flex justify-center gap-2 mb-8">
        {[
          { value: 'weekly', label: 'Mingguan' },
          { value: 'monthly', label: 'Bulanan' },
          { value: 'all_time', label: 'Sepanjang Masa' },
        ].map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {isLoading ? (
        <Loading text="Memuat leaderboard..." />
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !entries?.length ? (
        <ErrorState message="Belum ada data leaderboard." />
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                index < 3
                  ? 'bg-gray-800/80 border-indigo-500/30'
                  : 'bg-gray-800/30 border-gray-700/50'
              }`}
            >
              <div className="w-8 flex justify-center">{getRankIcon(index + 1)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{entry.user_name}</p>
                <p className="text-gray-500 text-xs">{entry.total_transactions} transaksi</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-400 font-bold text-sm">
                  {formatCurrency(entry.total_spent)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
