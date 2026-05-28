import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, sha256 } from '@/lib/supabase';
import { mapProfile } from '@/lib/mappers';
import type { UserRole } from '@/types';

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, is_active, created_at')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r) => mapProfile(r as Record<string, unknown>));
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      fullName: string;
      role: UserRole;
    }) => {
      const emailNorm = payload.email.toLowerCase().trim();

      // Sprawdź duplikat
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', emailNorm)
        .maybeSingle();

      if (existing) throw new Error('Ten adres email jest już zarejestrowany.');

      const hashedPassword = await sha256(payload.password);

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          email: emailNorm,
          full_name: payload.fullName,
          role: payload.role,
          is_active: true,
          password: hashedPassword,
        })
        .select('id, email, full_name, role, is_active, created_at')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      role?: UserRole;
      isActive?: boolean;
      fullName?: string;
      password?: string;
    }) => {
      const update: Record<string, unknown> = {};
      if (payload.role !== undefined) update.role = payload.role;
      if (payload.isActive !== undefined) update.is_active = payload.isActive;
      if (payload.fullName !== undefined) update.full_name = payload.fullName;
      if (payload.password !== undefined && payload.password !== '') {
        update.password = await sha256(payload.password);
      }

      if (Object.keys(update).length === 0) {
        throw new Error('Brak zmian do zapisania.');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', payload.id)
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, payload) => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
      qc.invalidateQueries({ queryKey: ['profile', payload.id] });
    },
  });
}