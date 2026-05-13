'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router                = useRouter();

  const fetchMe = useCallback(async () => {
    try {
      const data = await api.get<User>('/api/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const logout = async () => {
    try { await api.post('/api/auth/logout', {}); } catch { /* ignore */ }
    setUser(null);
    router.push('/login');
  };

  return { user, loading, logout, refetch: fetchMe };
}
