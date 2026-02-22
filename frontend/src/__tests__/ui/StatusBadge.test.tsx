import { render, screen } from '@testing-library/react';
import StatusBadge from '@/components/ui/StatusBadge';

describe('StatusBadge', () => {
  it('renders pending status with correct label', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Menunggu Bayar')).toBeInTheDocument();
  });

  it('renders success status with correct label', () => {
    render(<StatusBadge status="success" />);
    expect(screen.getByText('Berhasil')).toBeInTheDocument();
  });

  it('renders failed status with correct label', () => {
    render(<StatusBadge status="failed" />);
    expect(screen.getByText('Gagal')).toBeInTheDocument();
  });

  it('renders processing status', () => {
    render(<StatusBadge status="processing" />);
    expect(screen.getByText('Diproses')).toBeInTheDocument();
  });

  it('renders unknown status as-is', () => {
    render(<StatusBadge status="unknown_status" />);
    expect(screen.getByText('unknown_status')).toBeInTheDocument();
  });

  it('applies correct color class for success', () => {
    const { container } = render(<StatusBadge status="success" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-green-400');
  });

  it('applies correct color class for failed', () => {
    const { container } = render(<StatusBadge status="failed" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-red-400');
  });
});
