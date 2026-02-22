'use client';

import { FuzzyText } from '@/components/effects';
import { Button } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <FuzzyText text="500" className="text-7xl sm:text-9xl font-bold text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Terjadi Kesalahan</h2>
      <p className="text-gray-400 text-sm mb-8 max-w-md">
        Ada masalah di server kami. Tim teknis sudah dihubungi. Coba lagi nanti ya.
      </p>
      <Button onClick={reset}>Coba Lagi</Button>
    </div>
  );
}
