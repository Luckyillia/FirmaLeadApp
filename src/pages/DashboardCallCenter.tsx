import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneCall, Clock, CheckCircle, PhoneForwarded, TrendingUp, Users, Target, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function DashboardCallCenter() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    inQueue: 0,
    todayCalls: 0,
    successRate: 0,
    avgCallTime: "0:00",
    goal: 50,
    achieved: 0,
    totalLeads: 0,
    completedLeads: 0
  });

  const [hourlyData, setHourlyData] = useState([
    { hour: '9:00', calls: 0, success: 0 },
    { hour: '10:00', calls: 0, success: 0 },
    { hour: '11:00', calls: 0, success: 0 },
    { hour: '12:00', calls: 0, success: 0 },
    { hour: '13:00', calls: 0, success: 0 },
    { hour: '14:00', calls: 0, success: 0 },
    { hour: '15:00', calls: 0, success: 0 },
    { hour: '16:00', calls: 0, success: 0 },
  ]);

  const [queueData, setQueueData] = useState([
    { priority: "Wysoki", count: 0, companies: [] },
    { priority: "Średni", count: 0, companies: [] },
    { priority: "Niski", count: 0, companies: [] },
  ]);

  useEffect(() => {
    fetchCallCenterData();
  }, [user]);

  const fetchCallCenterData = async () => {
    try {
      // Pobierz leady w kolejce
      const { count: queueCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')
        .is('assigned_to', null);

      setStats(prev => ({ ...prev, inQueue: queueCount || 0 }));

      // Pobierz leady przypisane do tego agenta
      const { count: agentLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user?.id);

      // Pobierz zrealizowane leady
      const { count: completedLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user?.id)
        .eq('status', 'completed');

      setStats(prev => ({
        ...prev,
        totalLeads: agentLeads || 0,
        completedLeads: completedLeads || 0,
        successRate: agentLeads ? Math.round((completedLeads! / agentLeads!) * 100) : 0,
        achieved: agentLeads || 0,
      }));

      // Symulowane dane dla wykresów (później podłączysz prawdziwe)
      setHourlyData([
        { hour: '9:00', calls: 8, success: 5 },
        { hour: '10:00', calls: 12, success: 8 },
        { hour: '11:00', calls: 10, success: 7 },
        { hour: '12:00', calls: 6, success: 4 },
        { hour: '13:00', calls: 4, success: 3 },
        { hour: '14:00', calls: 9, success: 6 },
        { hour: '15:00', calls: 11, success: 8 },
        { hour: '16:00', calls: 7, success: 5 },
      ]);

      const [queueData, setQueueData] = useState<{ priority: string; count: number; companies: string[] }[]>([
        { priority: "Wysoki", count: 0, companies: [] },
        { priority: "Średni", count: 0, companies: [] },
        { priority: "Niski", count: 0, companies: [] },
      ]);

    } catch (error) {
      console.error('Błąd pobierania danych:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Udane', value: stats.successRate, color: '#10b981' },
    { name: 'Nieudane', value: 100 - stats.successRate, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Call Center</h1>
          <p className="text-muted-foreground">Monitorowanie rozmów i efektywności</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <PhoneCall className="h-3 w-3 mr-1" />
          {user?.fullName}
        </Badge>
      </div>

      {/* Statystyki główne */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">W kolejce</p>
                <p className="text-3xl font-bold">{stats.inQueue}</p>
              </div>
              <PhoneCall className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Przypisane leady</p>
                <p className="text-2xl font-bold">{stats.totalLeads}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zrealizowane</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedLeads}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Skuteczność</p>
                <p className="text-2xl font-bold text-purple-600">{stats.successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cel dzienny</p>
                <p className="text-2xl font-bold">{stats.achieved}/{stats.goal}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wykresy */}
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

        <Card>
          <CardHeader>
            <CardTitle>Skuteczność rozmów</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Postęp dzienny */}
      <Card>
        <CardHeader>
          <CardTitle>Postęp dzienny</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Wykonano {stats.achieved} z {stats.goal} rozmów</span>
              <span className="font-semibold">{Math.round((stats.achieved / stats.goal) * 100)}%</span>
            </div>
            <Progress value={(stats.achieved / stats.goal) * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>

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
                    <Badge key={company} variant="secondary" className="cursor-pointer hover:bg-blue-500 hover:text-white">
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