import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, sha256 } from '@/lib/supabase';
import { mapProfile } from '@/lib/mappers';
import type { Profile } from '@/types';

const SESSION_KEY = 'leadapp_session';

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(() => {
    // Inicjalizacja synchroniczna z sessionStorage
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as Profile) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const hashedPassword = await sha256(password);

      const { data, error: dbError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_active, created_at')
      .eq('email', email.toLowerCase().trim())
      .eq('password', hashedPassword)
      .maybeSingle();

    console.log('data:', data);
    console.log('error:', dbError);
    console.log('email wysłany:', email.toLowerCase().trim());
    console.log('hash wysłany:', hashedPassword);

      if (dbError || !data) throw new Error('Nieprawidłowy email lub hasło.');

      const profile = mapProfile(data as Record<string, unknown>);
      if (!profile.isActive) throw new Error('Konto jest nieaktywne. Skontaktuj się z administratorem.');

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile));
      setUser(profile);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Błąd logowania');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
