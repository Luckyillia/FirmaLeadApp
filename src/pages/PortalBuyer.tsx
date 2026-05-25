import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function PortalBuyer() {
  const availableLeads = [
    { company: "Firma XYZ", value: "8,000 zł", deadline: "23h 15m", match: "95%" },
    { company: "Tech Solutions", value: "12,000 zł", deadline: "1d 5h", match: "88%" },
    { company: "Budowlanka", value: "5,500 zł", deadline: "2d 10h", match: "76%" },
  ];

  const myLeads = [
    { company: "Eko-Energia", status: "active", value: "15,000 zł", daysLeft: 12 },
    { company: "Smart Home", status: "pending", value: "9,000 zł", daysLeft: 5 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portal Kupującego</h1>
        <p className="text-muted-foreground">Zarządzanie lejdami i reklamacjami</p>
      </div>

      {/* Statystyki */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Dostępne leady</p>
                <p className="text-3xl font-bold">7</p>
              </div>
              <Package className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moje leady</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktywne reklamacje</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dostępne leady */}
      <Card>
        <CardHeader>
          <CardTitle>Dostępne leady</CardTitle>
          <p className="text-sm text-muted-foreground">Leadly dopasowane do Twojego profilu</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableLeads.map((lead) => (
              <div key={lead.company} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-semibold">{lead.company}</p>
                  <p className="text-sm text-muted-foreground">Wartość: {lead.value}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="bg-green-500">
                    Dopasowanie {lead.match}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {lead.deadline}
                  </div>
                  <Button size="sm">Odbierz</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Moje leady */}
      <Card>
        <CardHeader>
          <CardTitle>Moje leady</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myLeads.map((lead) => (
              <div key={lead.company} className="space-y-2 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{lead.company}</p>
                    <p className="text-sm text-muted-foreground">Wartość: {lead.value}</p>
                  </div>
                  <Badge variant={lead.status === "active" ? "default" : "secondary"}>
                    {lead.status === "active" ? "Aktywny" : "Oczekujący"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Pozostało dni</span>
                    <span>{lead.daysLeft} dni</span>
                  </div>
                  <Progress value={(lead.daysLeft / 14) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}