import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MyLeadsPage() {
  // Przykładowe dane - później podłączysz z Supabase
  const myLeads = [
    { id: 1, company: "Tech Corp", value: 45000, status: "active", daysLeft: 12, date: "2024-06-01" },
    { id: 2, company: "Industry Solutions", value: 38000, status: "active", daysLeft: 5, date: "2024-06-05" },
    { id: 3, company: "Global Trade", value: 32000, status: "completed", daysLeft: 0, date: "2024-05-28" },
    { id: 4, company: "Eko-Energia", value: 28000, status: "expired", daysLeft: 0, date: "2024-05-20" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Aktywny</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Zrealizowany</Badge>;
      case 'expired':
        return <Badge variant="destructive">Wygasł</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = {
    total: myLeads.length,
    active: myLeads.filter(l => l.status === 'active').length,
    completed: myLeads.filter(l => l.status === 'completed').length,
    totalValue: myLeads.reduce((sum, l) => sum + l.value, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moje leady</h1>
        <p className="text-muted-foreground">Leady które odebrałeś</p>
      </div>

      {/* Statystyki */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wszystkie</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktywne</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zrealizowane</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Łączna wartość</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalValue.toLocaleString()} zł</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista leadów */}
      <Card>
        <CardHeader>
          <CardTitle>Lista moich leadów</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-semibold text-lg">{lead.company}</p>
                  <p className="text-sm text-muted-foreground">Data odbioru: {lead.date}</p>
                  {lead.daysLeft > 0 && (
                    <p className="text-sm text-orange-600">Pozostało {lead.daysLeft} dni</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{lead.value.toLocaleString()} zł</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(lead.status)}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}