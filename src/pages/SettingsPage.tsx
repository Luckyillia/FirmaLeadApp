import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Shield, Mail, Globe, Lock, Save } from 'lucide-react';

export default function SettingsPage() {
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
            <div>
              <Label>Zmiana hasła</Label>
              <Input type="password" placeholder="Nowe hasło" className="mt-1" />
            </div>
            <div>
              <Label>Potwierdź hasło</Label>
              <Input type="password" placeholder="Potwierdź hasło" className="mt-1" />
            </div>
            <Button className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Zmień hasło
            </Button>
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