import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

export default function ComplaintsPage() {
  const [complaints] = useState([
    { id: 1, company: "Firma XYZ", reason: "Zły kontakt", status: "pending", date: "2024-06-15", value: 8000 },
    { id: 2, company: "Tech Solutions", reason: "Nieaktualne dane", status: "in_review", date: "2024-06-14", value: 12000 },
    { id: 3, company: "Budowlanka", reason: "Brak odpowiedzi", status: "resolved", date: "2024-06-10", value: 5500 },
  ]);

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'Oczekuje', color: 'bg-yellow-500', icon: Clock },
      in_review: { label: 'W trakcie', color: 'bg-blue-500', icon: AlertCircle },
      resolved: { label: 'Rozwiązane', color: 'bg-green-500', icon: CheckCircle },
      rejected: { label: 'Odrzucone', color: 'bg-red-500', icon: XCircle },
    };
    const info = statuses[status];
    const Icon = info.icon;
    return <Badge className={info.color}><Icon className="h-3 w-3 mr-1" />{info.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reklamacje</h1>
        <p className="text-muted-foreground">Zarządzanie reklamacjami leadów</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Oczekujące</p>
                <p className="text-2xl font-bold text-yellow-600">2</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">W trakcie</p>
                <p className="text-2xl font-bold text-blue-600">1</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rozwiązane</p>
                <p className="text-2xl font-bold text-green-600">5</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista reklamacji</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-semibold">{complaint.company}</p>
                  <p className="text-sm text-muted-foreground">{complaint.reason}</p>
                  <p className="text-xs text-muted-foreground">{complaint.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(complaint.status)}
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Szczegóły
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}