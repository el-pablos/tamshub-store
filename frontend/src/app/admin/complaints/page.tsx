'use client';

import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useAdminComplaints, useReplyComplaint } from '@/hooks/useAdminApi';
import { Loading, ErrorState, StatusBadge, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function AdminComplaintsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const { data, isLoading, error, refetch } = useAdminComplaints({ status: status || undefined, page });
  const replyComplaint = useReplyComplaint();

  const handleReply = async (id: number) => {
    if (!replyMessage.trim()) return;
    await replyComplaint.mutateAsync({ id, message: replyMessage });
    setReplyId(null);
    setReplyMessage('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Manajemen Komplain</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              status === s ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {s || 'Semua'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="space-y-3">
          {data?.data?.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-medium text-sm">{complaint.subject}</h3>
                  <p className="text-gray-500 text-xs mt-1">
                    {complaint.user_name} · {complaint.invoice} · {formatDate(complaint.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={complaint.status} />
                  <span className="text-gray-500 text-xs flex items-center gap-1">
                    <MessageSquare size={12} />{complaint.messages_count}
                  </span>
                </div>
              </div>

              {replyId === complaint.id ? (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik balasan..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleReply(complaint.id);
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleReply(complaint.id)}
                    loading={replyComplaint.isPending}
                  >
                    <Send size={12} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setReplyId(null)}>
                    Batal
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2"
                  onClick={() => { setReplyId(complaint.id); setReplyMessage(''); }}
                >
                  <MessageSquare size={12} />
                  Balas
                </Button>
              )}
            </div>
          ))}
          {!data?.data?.length && (
            <div className="text-center py-12 text-gray-500">Tidak ada komplain</div>
          )}
        </div>
      )}
    </div>
  );
}
