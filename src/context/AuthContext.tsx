import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase, sha256 } from '@/lib/supabase';
import { mapProfile } from '@/lib/mappers';
import type { Profile } from '@/types';

const SESSION_KEY = 'leadapp_session';

async function getKey(): Promise<CryptoKey> {
  const secret = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const encoder = new TextEncoder();
  const raw = encoder.encode(secret.slice(0, 32).padEnd(32, '0'));
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function encryptSession(data: object): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

async function decryptSession(raw: string): Promise<Profile | null> {
  try {
    const key = await getKey();
    const combined = Uint8Array.from(atob(raw), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return JSON.parse(new TextDecoder().decode(decrypted)) as Profile;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) { setSessionLoaded(true); return; }
    decryptSession(raw).then(profile => {
      setUser(profile);
      setSessionLoaded(true);
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
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

      if (dbError || !data) throw new Error('Nieprawidłowy email lub hasło.');
      const profile = mapProfile(data as Record<string, unknown>);
      if (!profile.isActive) throw new Error('Konto jest nieaktywne. Skontaktuj się z administratorem.');

      const encrypted = await encryptSession(profile);
      sessionStorage.setItem(SESSION_KEY, encrypted);
      setUser(profile);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Błąd logowania');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Pobiera świeże dane z bazy i nadpisuje sesję + stan
  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, is_active, created_at')
        .eq('id', user.id)
        .single();

      if (dbError || !data) return;
      const profile = mapProfile(data as Record<string, unknown>);
      const encrypted = await encryptSession(profile);
      sessionStorage.setItem(SESSION_KEY, encrypted);
      setUser(profile);
    } catch {
      // cicho ignorujemy
    }
  }, [user]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
    setError(null);
  }, []);

  if (!sessionLoaded) return null;

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}