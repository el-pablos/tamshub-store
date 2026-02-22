import { render, screen } from '@testing-library/react';
import Loading from '@/components/ui/Loading';

jest.mock('lucide-react', () => ({
  Loader2: ({ className }: { className?: string }) => (
    <svg data-testid="loader-icon" className={className} />
  ),
}));

describe('Loading', () => {
  it('renders default text', () => {
    render(<Loading />);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('renders custom text', () => {
    render(<Loading text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('shows spinner icon', () => {
    render(<Loading />);
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('renders fullscreen wrapper when fullScreen is true', () => {
    const { container } = render(<Loading fullScreen />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('min-h-screen');
  });

  it('renders inline wrapper by default', () => {
    const { container } = render(<Loading />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('py-12');
    expect(wrapper.className).not.toContain('min-h-screen');
  });
});
