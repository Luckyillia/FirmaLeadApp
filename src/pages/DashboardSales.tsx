import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Target, ArrowRight, Calendar, Clock, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardSales() {
  const pipelineData = [
    { stage: "Nowe", value: 96000, count: 8, color: "#3b82f6" },
    { stage: "Kontakt", value: 144000, count: 12, color: "#f59e0b" },
    { stage: "Oferta", value: 72000, count: 6, color: "#8b5cf6" },
    { stage: "Negocjacje", value: 48000, count: 4, color: "#ec4899" },
    { stage: "Zamknięte", value: 36000, count: 3, color: "#10b981" },
  ];

  const weeklyActivity = [
    { day: 'Pon', calls: 12, meetings: 3, deals: 2 },
    { day: 'Wt', calls: 15, meetings: 4, deals: 3 },
    { day: 'Śr', calls: 10, meetings: 2, deals: 1 },
    { day: 'Czw', calls: 14, meetings: 5, deals: 4 },
    { day: 'Pt', calls: 8, meetings: 3, deals: 2 },
  ];

  const topDeals = [
    { company: "Tech Corp", value: 45000, probability: 85, daysLeft: 5 },
    { company: "Industry Solutions", value: 38000, probability: 70, daysLeft: 12 },
    { company: "Global Trade", value: 32000, probability: 90, daysLeft: 3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pipeline Sprzedaży</h1>
        <p className="text-muted-foreground">Zarządzanie procesem sprzedaży</p>
      </div>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline value</p>
                <p className="text-2xl font-bold">396,000 zł</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktywne leady</p>
                <p className="text-2xl font-bold">30</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Konwersja</p>
                <p className="text-2xl font-bold">42%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Do zamknięcia</p>
                <p className="text-2xl font-bold">115,000 zł</p>
              </div>
              <Award className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline sprzedażowy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelineData.map((stage) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: stage.color }} />
                    <span className="font-medium">{stage.stage}</span>
                    <Badge variant="secondary">{stage.count} leadów</Badge>
                  </div>
                  <span className="font-semibold">{stage.value.toLocaleString()} zł</span>
                </div>
                <Progress value={(stage.value / 396000) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wykres aktywności */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aktywność tygodniowa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calls" fill="#3b82f6" name="Rozmowy" />
                <Bar dataKey="meetings" fill="#f59e0b" name="Spotkania" />
                <Bar dataKey="deals" fill="#10b981" name="Deale" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top deale */}
        <Card>
          <CardHeader>
            <CardTitle>Najważniejsze deale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDeals.map((deal) => (
                <div key={deal.company} className="border-b pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{deal.company}</p>
                      <p className="text-2xl font-bold text-green-600">{deal.value.toLocaleString()} zł</p>
                    </div>
                    <Badge className={deal.probability > 80 ? "bg-green-500" : "bg-yellow-500"}>
                      {deal.probability}%
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {deal.daysLeft} dni
                    </span>
                    <Button variant="ghost" size="sm">
                      Szczegóły <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}