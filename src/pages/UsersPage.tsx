import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users, Search, Plus, Edit, UserCheck, UserX,
  Mail, Calendar, Shield, Loader2, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCreateUser, useUpdateProfile } from '@/hooks/useProfiles';
import type { UserRole } from '@/types';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  agent_cc: 'Call Center',
  sales_direct: 'Handlowiec',
  buyer: 'Kupujący',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-500',
  agent_cc: 'bg-blue-500',
  sales_direct: 'bg-green-500',
  buyer: 'bg-orange-500',
};

interface AddUserFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

const EMPTY_FORM: AddUserFormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'buyer',
};

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<AddUserFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const createUser = useCreateUser();
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Błąd pobierania użytkowników:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateProfile.mutateAsync({ id: userId, isActive: !currentStatus });
      fetchUsers();
    } catch (error) {
      console.error('Błąd zmiany statusu:', error);
    }
  };

  // ── Walidacja formularza ──────────────────────────────────────────────────
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.fullName.trim() || form.fullName.trim().length < 3)
      errors.fullName = 'Imię i nazwisko musi mieć minimum 3 znaki.';

    if (!form.email.trim())
      errors.email = 'Email jest wymagany.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = 'Podaj prawidłowy adres email.';

    if (!form.password)
      errors.password = 'Hasło jest wymagane.';
    else if (form.password.length < 8)
      errors.password = 'Hasło musi mieć minimum 8 znaków.';

    if (form.password !== form.confirmPassword)
      errors.confirmPassword = 'Hasła nie są identyczne.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field: keyof AddUserFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createUser.mutateAsync({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        role: form.role,
      });
      setIsModalOpen(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
      fetchUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Błąd tworzenia użytkownika.';
      setFormErrors(prev => ({ ...prev, submit: message }));
    }
  };

  const handleOpenModal = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getRoleBadge = (role: string) => (
    <Badge className={ROLE_COLORS[role] ?? 'bg-gray-500'}>
      {ROLE_LABELS[role] ?? role}
    </Badge>
  );

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zarządzanie użytkownikami</h1>
          <p className="text-muted-foreground">Zarządzaj kontami i uprawnieniami</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleOpenModal}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj użytkownika
        </Button>
      </div>

      {/* Statystyki */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wszyscy użytkownicy</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktywni</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nieaktywni</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <UserX className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Administratorzy</p>
                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wyszukiwarka */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj po imieniu lub emailu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista użytkowników */}
      <Card>
        <CardHeader>
          <CardTitle>Lista użytkowników</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Brak użytkowników.</p>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {user.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{user.full_name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString('pl-PL')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getRoleBadge(user.role)}
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Aktywny' : 'Nieaktywny'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      title={user.is_active ? 'Dezaktywuj' : 'Aktywuj'}
                    >
                      {user.is_active
                        ? <UserX className="h-4 w-4 text-red-500" />
                        : <UserCheck className="h-4 w-4 text-green-500" />
                      }
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modal: Dodaj użytkownika ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Dodaj nowego użytkownika</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">

            {/* Globalny błąd (np. email już istnieje) */}
            {formErrors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                {formErrors.submit}
              </div>
            )}

            {/* Imię i nazwisko */}
            <div className="space-y-1">
              <Label htmlFor="fullName">Imię i nazwisko</Label>
              <Input
                id="fullName"
                placeholder="Jan Kowalski"
                value={form.fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                aria-invalid={!!formErrors.fullName}
              />
              {formErrors.fullName && (
                <p className="text-xs text-red-500">{formErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jan@firma.pl"
                value={form.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                aria-invalid={!!formErrors.email}
              />
              {formErrors.email && (
                <p className="text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Rola */}
            <div className="space-y-1">
              <Label htmlFor="role">Rola</Label>
              <Select
                value={form.role}
                onValueChange={(v) => handleFieldChange('role', v)}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Wybierz rolę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="agent_cc">Konsultant Call Center</SelectItem>
                  <SelectItem value="sales_direct">Handlowiec</SelectItem>
                  <SelectItem value="buyer">Kupujący</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hasło */}
            <div className="space-y-1">
              <Label htmlFor="password">Hasło</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 znaków"
                  value={form.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  aria-invalid={!!formErrors.password}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-xs text-red-500">{formErrors.password}</p>
              )}
            </div>

            {/* Potwierdź hasło */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Powtórz hasło"
                  value={form.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  aria-invalid={!!formErrors.confirmPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(p => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Anuluj
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleSubmit}
              disabled={createUser.isPending}
            >
              {createUser.isPending
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Tworzę...</>
                : <><Plus className="h-4 w-4 mr-2" />Utwórz użytkownika</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}