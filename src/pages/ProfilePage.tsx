import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Shield, Edit, Check, X, Loader2 } from 'lucide-react';
import { useUpdateProfile } from '@/hooks/useProfiles';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  agent_cc: 'Konsultant CC',
  sales_direct: 'Handlowiec',
  buyer: 'Kupujący',
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [error, setError] = useState('');

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleEdit = () => {
    setFullName(user?.fullName ?? '');
    setError('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFullName(user?.fullName ?? '');
    setError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    const trimmed = fullName.trim();
    if (trimmed.length < 3) {
      setError('Imię i nazwisko musi mieć minimum 3 znaki.');
      return;
    }
    if (!user) return;

    try {
      await updateProfile.mutateAsync({ id: user.id, fullName: trimmed });
      await refreshUser();
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Błąd zapisu.');
    }
  };

  const displayName = isEditing ? (fullName || user?.fullName || '') : (user?.fullName || '');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mój profil</h1>
        <p className="text-muted-foreground">Twoje dane osobowe i ustawienia konta</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Informacje osobiste</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edytuj
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="fullName">Imię i nazwisko</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={e => { setFullName(e.target.value); setError(''); }}
                    autoFocus
                    aria-invalid={!!error}
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={handleSave}
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <><Check className="h-4 w-4 mr-1" />Zapisz</>
                      }
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-1" />
                      Anuluj
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{user?.fullName}</h2>
                  <p className="text-muted-foreground">
                    {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Rola</p>
                <p className="font-medium">
                  {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}