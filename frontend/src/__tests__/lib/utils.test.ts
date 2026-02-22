import { formatCurrency, formatDate, getStatusColor, getStatusLabel, censorText } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats number as IDR currency', () => {
    const result = formatCurrency(50000);
    expect(result).toContain('50.000');
    expect(result.toLowerCase()).toContain('rp');
  });

  it('formats zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('formats large numbers', () => {
    const result = formatCurrency(1500000);
    expect(result).toContain('1.500.000');
  });
});

describe('getStatusColor', () => {
  it('returns yellow for pending', () => {
    expect(getStatusColor('pending')).toContain('yellow');
  });

  it('returns green for success', () => {
    expect(getStatusColor('success')).toContain('green');
  });

  it('returns red for failed', () => {
    expect(getStatusColor('failed')).toContain('red');
  });

  it('returns default for unknown status', () => {
    expect(getStatusColor('unknown')).toContain('gray');
  });
});

describe('getStatusLabel', () => {
  it('returns Indonesian label for pending', () => {
    expect(getStatusLabel('pending')).toBe('Menunggu Bayar');
  });

  it('returns Indonesian label for success', () => {
    expect(getStatusLabel('success')).toBe('Berhasil');
  });

  it('returns raw status for unknown', () => {
    expect(getStatusLabel('custom')).toBe('custom');
  });
});

describe('censorText', () => {
  it('censors text longer than 3 chars', () => {
    const result = censorText('username');
    expect(result).toBe('use*****');
  });

  it('handles short text', () => {
    const result = censorText('ab');
    expect(result).toBe('a***');
  });

  it('handles 3^char text', () => {
    const result = censorText('abc');
    expect(result).toMatch(/^a/);
  });
});
