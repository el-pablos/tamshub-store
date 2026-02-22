import Link from 'next/link';
import { FuzzyText } from '@/components/effects';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <FuzzyText text="404" className="text-7xl sm:text-9xl font-bold text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-400 text-sm mb-8 max-w-md">
        Halaman yang kamu cari nggak ada atau sudah dipindah. Yuk balik ke beranda.
      </p>
      <Link href="/">
        <Button>Kembali ke Beranda</Button>
      </Link>
    </div>
  );
}
