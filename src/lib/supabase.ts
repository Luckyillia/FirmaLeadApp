import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const passwordSalt = import.meta.env.VITE_PASSWORD_SALT as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Brak VITE_SUPABASE_URL lub VITE_SUPABASE_ANON_KEY w pliku .env');
}
if (!passwordSalt) {
  throw new Error('Brak VITE_PASSWORD_SALT w pliku .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Hash hasła SHA-256 z solą pobieraną z .env
 * Format: sha256(salt + password + salt)
 */
export async function sha256(password: string): Promise<string> {
  const salted = `${passwordSalt}${password}${passwordSalt}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(salted);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}