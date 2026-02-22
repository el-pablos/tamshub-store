import { useAuthStore } from '@/store/auth';
import type { User } from '@/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useAuthStore.setState({ user: null, token: null });
  });

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    member_level: 'guest',
  };

  it('starts with null user and token', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('setAuth sets user and token', () => {
    useAuthStore.getState().setAuth(mockUser, 'test-token-123');
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('test-token-123');
  });

  it('setAuth saves to localStorage', () => {
    useAuthStore.getState().setAuth(mockUser, 'test-token-123');
    expect(localStorageMock.getItem('auth_token')).toBe('test-token-123');
    expect(JSON.parse(localStorageMock.getItem('user')!)).toEqual(mockUser);
  });

  it('logout clears user and token', () => {
    useAuthStore.getState().setAuth(mockUser, 'test-token-123');
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('logout clears localStorage', () => {
    useAuthStore.getState().setAuth(mockUser, 'test-token-123');
    useAuthStore.getState().logout();
    expect(localStorageMock.getItem('auth_token')).toBeNull();
    expect(localStorageMock.getItem('user')).toBeNull();
  });

  it('loadFromStorage restores auth from localStorage', () => {
    localStorageMock.setItem('auth_token', 'stored-token');
    localStorageMock.setItem('user', JSON.stringify(mockUser));
    useAuthStore.getState().loadFromStorage();
    const state = useAuthStore.getState();
    expect(state.token).toBe('stored-token');
    expect(state.user).toEqual(mockUser);
  });

  it('loadFromStorage handles invalid JSON gracefully', () => {
    localStorageMock.setItem('auth_token', 'stored-token');
    localStorageMock.setItem('user', 'invalid-json');
    useAuthStore.getState().loadFromStorage();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});
