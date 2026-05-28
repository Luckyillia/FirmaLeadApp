import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/context/AuthContext';
import { useUpdateProfile } from '@/hooks/useProfiles';
import { Bell, Shield, Mail, Globe, Lock, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError('Nie znaleziono zalogowanego użytkownika.');
      return;
    }

    if (!password) {
      setError('Podaj nowe hasło.');
      return;
    }

    if (password.length < 8) {
      setError('Hasło musi mieć minimum 8 znaków.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne.');
      return;
    }

    try {
      await updateProfile.mutateAsync({ id: user.id, password });
      setSuccess('Hasło zostało zmienione pomyślnie.');
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas zmiany hasła.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ustawienia</h1>
        <p className="text-muted-foreground">Konfiguracja systemu i konta</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Powiadomienia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Powiadomienia email</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Nowe leady</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Reklamacje</Label>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Bezpieczeństwo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label>Zmiana hasła</Label>
                <Input
                  type="password"
                  placeholder="Nowe hasło"
                  className="mt-1"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div>
                <Label>Potwierdź hasło</Label>
                <Input
                  type="password"
                  placeholder="Potwierdź hasło"
                  className="mt-1"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Błąd</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertTitle>Sukces</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={updateProfile.isLoading}>
                <Lock className="h-4 w-4 mr-2" />
                Zmień hasło
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email i powiadomienia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email do powiadomień</Label>
              <Input type="email" placeholder="admin@leadapp.pl" className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Raport tygodniowy</Label>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Preferencje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Język</Label>
              <select className="w-full border rounded-md px-3 py-2 mt-1">
                <option>Polski</option>
                <option>English</option>
              </select>
            </div>
            <div>
              <Label>Strefa czasowa</Label>
              <select className="w-full border rounded-md px-3 py-2 mt-1">
                <option>Warszawa (GMT+2)</option>
                <option>Londyn (GMT+1)</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Save className="h-4 w-4 mr-2" />
          Zapisz zmiany
        </Button>
      </div>
    </div>
  );
}