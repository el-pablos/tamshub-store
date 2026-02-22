import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = 'Terjadi kesalahan. Silakan coba lagi.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="py-12 flex flex-col items-center justify-center gap-4">
      <AlertTriangle size={40} className="text-red-400" />
      <p className="text-gray-400 text-sm text-center max-w-md">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw size={14} />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
