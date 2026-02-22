'use client';

import { MessageCircle } from 'lucide-react';

interface FloatingChatProps {
  phoneNumber?: string;
  message?: string;
}

export default function FloatingChat({
  phoneNumber = '6281234567890',
  message = 'Halo, saya butuh bantuan dari TamsHub Store',
}: FloatingChatProps) {
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
      title="Chat WhatsApp"
    >
      <MessageCircle size={24} />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Butuh bantuan?
      </span>
    </a>
  );
}
