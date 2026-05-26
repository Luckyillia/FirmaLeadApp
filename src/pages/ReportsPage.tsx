import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, Download, Calendar, TrendingUp, Users, 
  DollarSign, PieChart, FileText, Filter 
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, 
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';

export default function ReportsPage() {
  const monthlyData = [
    { month: 'Sty', leads: 45, revenue: 45000, conversion: 32 },
    { month: 'Lut', leads: 52, revenue: 52000, conversion: 35 },
    { month: 'Mar', leads: 48, revenue: 48000, conversion: 33 },
    { month: 'Kwi', leads: 61, revenue: 61000, conversion: 38 },
    { month: 'Maj', leads: 68, revenue: 68000, conversion: 41 },
    { month: 'Cze', leads: 74, revenue: 74000, conversion: 44 },
  ];

  const agentStats = [
    { name: 'Anna K.', leads: 45, deals: 32, revenue: 384000 },
    { name: 'Piotr N.', leads: 38, deals: 28, revenue: 336000 },
    { name: 'Marta W.', leads: 42, deals: 35, revenue: 420000 },
    { name: 'Tomasz L.', leads: 35, deals: 24, revenue: 288000 },
  ];

  const sourceData = [
    { name: 'Strona WWW', value: 45, color: '#3b82f6' },
    { name: 'LinkedIn', value: 28, color: '#0077b5' },
    { name: 'Polecenia', value: 18, color: '#10b981' },
    { name: 'Konferencje', value: 12, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Raporty i analizy</h1>
          <p className="text-muted-foreground">Kompletne statystyki sprzedaży</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Czerwiec 2024
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Download className="h-4 w-4 mr-2" />
            Eksportuj PDF
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Całkowity przychód</p>
                <p className="text-2xl font-bold">396,000 zł</p>
                <p className="text-xs text-green-600">+23% vs poprzedni miesiąc</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Średnia wartość leada</p>
                <p className="text-2xl font-bold">5,200 zł</p>
                <p className="text-xs text-green-600">+8% vs poprzedni miesiąc</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-2xl font-bold">342%</p>
                <p className="text-xs text-green-600">+12% vs poprzedni miesiąc</p>
              </div>
              <PieChart className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leadły ogółem</p>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-green-600">+156 w tym miesiącu</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wykresy */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trendy sprzedażowe</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#3b82f6" name="Leadły" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" name="Przychód (zł)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Źródła leadów</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ranking agentów */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking agentów</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentStats.map((agent, idx) => (
              <div key={agent.name} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.leads} leadów</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{agent.revenue.toLocaleString()} zł</p>
                  <p className="text-sm text-muted-foreground">{agent.deals} transakcji</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}