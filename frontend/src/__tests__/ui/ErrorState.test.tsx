import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorState from '@/components/ui/ErrorState';

jest.mock('lucide-react', () => ({
  AlertTriangle: () => <svg data-testid="alert-icon" />,
  RefreshCw: () => <svg data-testid="refresh-icon" />,
  Loader2: ({ className }: { className?: string }) => (
    <svg data-testid="loader-icon" className={className} />
  ),
}));

describe('ErrorState', () => {
  it('renders default error message', () => {
    render(<ErrorState />);
    expect(screen.getByText('Terjadi kesalahan. Silakan coba lagi.')).toBeInTheDocument();
  });

  it('renders custom error message', () => {
    render(<ErrorState message="Network error" />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('shows alert icon', () => {
    render(<ErrorState />);
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    render(<ErrorState onRetry={() => {}} />);
    expect(screen.getByText('Coba Lagi')).toBeInTheDocument();
  });

  it('hides retry button when onRetry is not provided', () => {
    render(<ErrorState />);
    expect(screen.queryByText('Coba Lagi')).not.toBeInTheDocument();
  });

  it('calls onRetry when button clicked', async () => {
    const handleRetry = jest.fn();
    render(<ErrorState onRetry={handleRetry} />);
    await userEvent.click(screen.getByText('Coba Lagi'));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
