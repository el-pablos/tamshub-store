import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '@/components/ui/Input';

describe('Input', () => {
  it('renders without label', () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Input error="Field is required" />);
    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });

  it('applies error border style when error exists', () => {
    render(<Input error="Required" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input.className).toContain('border-red-500');
  });

  it('applies normal border when no error', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input.className).toContain('border-gray-700');
    expect(input.className).not.toContain('border-red-500');
  });

  it('handles user input', async () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    await userEvent.type(input, 'hello');
    expect(input.value).toBe('hello');
  });

  it('passes through additional props', () => {
    render(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
  });
});
