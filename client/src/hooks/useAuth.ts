import { useCallback, useEffect, useState } from 'react';
import { fetchSession, login, logout } from '../lib/api';

export type AuthUser = {
  id: string;
  email: string;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSession();
      if (res.success) setUser(res.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      const message = res.error || '로그인 실패';
      setError(message);
      return { success: false, error: message };
    } catch (err) {
      const message = (err as Error).message || '로그인 실패';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await logout();
    setUser(null);
  };

  return { user, loading, error, signIn, signOut, refreshSession };
}
