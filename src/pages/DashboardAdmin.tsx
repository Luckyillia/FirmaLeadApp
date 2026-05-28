import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, AlertCircle, TrendingUp, PhoneCall, DollarSign, Activity, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLeads: 0,
    totalComplaints: 0,
    conversionRate: 0,
    monthlyRevenue: 0,
    activeAgents: 0
  });

  const [monthlyData, setMonthlyData] = useState([
    { name: 'Sty', leads: 45, revenue: 45000 },
    { name: 'Lut', leads: 52, revenue: 52000 },
    { name: 'Mar', leads: 48, revenue: 48000 },
    { name: 'Kwi', leads: 61, revenue: 61000 },
    { name: 'Maj', leads: 68, revenue: 68000 },
    { name: 'Cze', leads: 74, revenue: 74000 },
  ]);

  const [statusData, setStatusData] = useState([
    { name: 'Nowe', value: 35, color: '#3b82f6' },
    { name: 'W trakcie', value: 28, color: '#f59e0b' },
    { name: 'Zrealizowane', value: 42, color: '#10b981' },
    { name: 'Utracone', value: 15, color: '#ef4444' },
  ]);

  const [agentPerformance, setAgentPerformance] = useState([
    { name: 'Anna K.', calls: 145, deals: 32, revenue: 384000 },
    { name: 'Piotr N.', calls: 132, deals: 28, revenue: 336000 },
    { name: 'Marta W.', calls: 128, deals: 35, revenue: 420000 },
    { name: 'Tomasz L.', calls: 118, deals: 24, revenue: 288000 },
  ]);

  useEffect(() => {
    fetchRealStats();
  }, []);

  const fetchRealStats = async () => {
    try {
      // Pobierz liczbę użytkowników
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Pobierz liczbę leadów
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
      
      // Pobierz liczbę reklamacji
      const { count: complaintsCount } = await supabase
        .from('rejections')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalLeads: leadsCount || 0,
        totalComplaints: complaintsCount || 0,
        conversionRate: leadsCount ? Math.round((42 / leadsCount) * 100) : 0,
        monthlyRevenue: 396000,
        activeAgents: 8
      });
    } catch (error) {
      console.error('Błąd pobierania statystyk:', error);
    }
  };

  const statCards = [
    { title: "Użytkownicy", value: stats.totalUsers, icon: Users, change: "+12%", color: "from-blue-500 to-blue-600", bg: "bg-blue-50" },
    { title: "Leadły", value: stats.totalLeads, icon: Target, change: "+23%", color: "from-green-500 to-green-600", bg: "bg-green-50" },
    { title: "Reklamacje", value: stats.totalComplaints, icon: AlertCircle, change: "-8%", color: "from-red-500 to-red-600", bg: "bg-red-50" },
    { title: "Konwersja", value: `${stats.conversionRate}%`, icon: TrendingUp, change: "+5%", color: "from-purple-500 to-purple-600", bg: "bg-purple-50" },
    { title: "Przychód", value: `${(stats.monthlyRevenue / 1000).toFixed(0)}k zł`, icon: DollarSign, change: "+18%", color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50" },
    { title: "Aktywni agenci", value: stats.activeAgents, icon: PhoneCall, change: "+2", color: "from-orange-500 to-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel Administratora</h1>
          <p className="text-muted-foreground">Kompletny przegląd systemu CRM</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Activity className="h-3 w-3 mr-1" />
          Aktualizacja na żywo
        </Badge>
      </div>

      {/* Karty statystyk */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-full`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Wykres liniowy - Leadły miesięczne */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leadły w 2024</CardTitle>
            <p className="text-sm text-muted-foreground">Ilość leadów w poszczególnych miesiącach</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} name="Leadły" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Wykres kołowy - Status leadów */}
        <Card>
          <CardHeader>
            <CardTitle>Status leadów</CardTitle>
            <p className="text-sm text-muted-foreground">Rozkład leadów według statusu</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Wykres słupkowy - Przychód */}
      <Card>
        <CardHeader>
          <CardTitle>Przychód miesięczny</CardTitle>
          <p className="text-sm text-muted-foreground">Przychód w tysiącach złotych</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Przychód (zł)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela wydajności agentów */}
      <Card>
        <CardHeader>
          <CardTitle>Wydajność agentów</CardTitle>
          <p className="text-sm text-muted-foreground">Top performery w tym miesiącu</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentPerformance.map((agent, idx) => (
              <div key={agent.name} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.calls} rozmów</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Deale</p>
                    <p className="font-semibold">{agent.deals}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Przychód</p>
                    <p className="font-semibold text-green-600">{agent.revenue.toLocaleString()} zł</p>
                  </div>
                  <Progress value={(agent.deals / 35) * 100} className="w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}