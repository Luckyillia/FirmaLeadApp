import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MyClientsPage() {
  const clients = [
    { name: "Tech Corp", value: 45000, status: "active", lastContact: "2024-06-15" },
    { name: "Industry Solutions", value: 38000, status: "active", lastContact: "2024-06-14" },
    { name: "Global Trade", value: 32000, status: "inactive", lastContact: "2024-06-10" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Moi klienci</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-muted-foreground">Aktywnych klientów</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">1.2M zł</p>
              <p className="text-sm text-muted-foreground">Wartość portfela</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">+23%</p>
              <p className="text-sm text-muted-foreground">Wzrost r/r</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista klientów</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.name} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-muted-foreground">Ostatni kontakt: {client.lastContact}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{client.value.toLocaleString()} zł</p>
                  <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                    {client.status === 'active' ? 'Aktywny' : 'Nieaktywny'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}