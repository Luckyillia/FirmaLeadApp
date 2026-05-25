import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneCall, Clock, CheckCircle, XCircle, PhoneForwarded, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

export default function DashboardCallCenter() {
  const [dailyStats, setDailyStats] = useState({
    inQueue: 12,
    todayCalls: 34,
    successRate: 68,
    avgCallTime: "4:32",
    goal: 50,
    achieved: 34
  });

  const hourlyData = [
    { hour: '9:00', calls: 8, success: 5 },
    { hour: '10:00', calls: 12, success: 8 },
    { hour: '11:00', calls: 10, success: 7 },
    { hour: '12:00', calls: 6, success: 4 },
    { hour: '13:00', calls: 4, success: 3 },
    { hour: '14:00', calls: 9, success: 6 },
    { hour: '15:00', calls: 11, success: 8 },
    { hour: '16:00', calls: 7, success: 5 },
  ];

  const queueData = [
    { priority: "Wysoki", count: 4, companies: ["Firma XYZ", "Tech Solutions", "Budowlanka", "Eko-Energia"] },
    { priority: "Średni", count: 5, companies: ["Smart Home", "Net Systems", "Data Center", "Cloud Tech", "AI Solutions"] },
    { priority: "Niski", count: 3, companies: ["Local Shop", "Small Biz", "Startup X"] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Call Center</h1>
        <p className="text-muted-foreground">Monitorowanie rozmów i efektywności</p>
      </div>

      {/* Statystyki główne */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">W kolejce</p>
                <p className="text-3xl font-bold">{dailyStats.inQueue}</p>
              </div>
              <PhoneCall className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dzisiaj</p>
                <p className="text-2xl font-bold">{dailyStats.todayCalls}</p>
              </div>
              <PhoneForwarded className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Skuteczność</p>
                <p className="text-2xl font-bold">{dailyStats.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Średni czas</p>
                <p className="text-2xl font-bold">{dailyStats.avgCallTime}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cel dzienny</p>
                <p className="text-2xl font-bold">{dailyStats.achieved}/{dailyStats.goal}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wykres godzinowy */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aktywność godzinowa</CardTitle>
            <p className="text-sm text-muted-foreground">Ilość rozmów w ciągu dnia</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="calls" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Rozmowy" />
                <Area type="monotone" dataKey="success" stackId="1" stroke="#10b981" fill="#10b981" name="Udane" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Postęp dzienny */}
        <Card>
          <CardHeader>
            <CardTitle>Postęp dzienny</CardTitle>
            <p className="text-sm text-muted-foreground">Cel: {dailyStats.goal} rozmów dziennie</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Wykonano {dailyStats.achieved} z {dailyStats.goal} rozmów</span>
                  <span className="font-semibold">{Math.round((dailyStats.achieved / dailyStats.goal) * 100)}%</span>
                </div>
                <Progress value={(dailyStats.achieved / dailyStats.goal) * 100} className="h-3" />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Skuteczność</p>
                  <p className="text-xl font-bold text-green-600">{dailyStats.successRate}%</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Do celu</p>
                  <p className="text-xl font-bold text-blue-600">{dailyStats.goal - dailyStats.achieved}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kolejka priorytetowa */}
      <Card>
        <CardHeader>
          <CardTitle>Kolejka leadów</CardTitle>
          <p className="text-sm text-muted-foreground">Leadły oczekujące na obsługę</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {queueData.map((priority) => (
              <div key={priority.priority} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={
                      priority.priority === "Wysoki" ? "bg-red-500" : 
                      priority.priority === "Średni" ? "bg-yellow-500" : "bg-gray-500"
                    }>
                      {priority.priority}
                    </Badge>
                    <span className="font-semibold">{priority.count} leadów</span>
                  </div>
                  <Button size="sm" variant="outline">Obsłuż wszystkie</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {priority.companies.map((company) => (
                    <Badge key={company} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white">
                      {company}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}