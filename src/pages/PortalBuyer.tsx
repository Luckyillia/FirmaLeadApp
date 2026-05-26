import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, AlertCircle, Clock, CheckCircle, TrendingUp, DollarSign, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function PortalBuyer() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    availableLeads: 0,
    myLeads: 0,
    activeComplaints: 0,
    totalSpent: 0,
    avgLeadValue: 0,
    conversionRate: 0
  });

  const [availableLeads, setAvailableLeads] = useState([
    { id: 1, company: "Firma XYZ", value: 8000, deadline: "23h 15m", match: 95, industry: "IT", description: "Lead z branży IT, wysoki potencjał" },
    { id: 2, company: "Tech Solutions", value: 12000, deadline: "1d 5h", match: 88, industry: "Software", description: "Software house szuka nowych klientów" },
    { id: 3, company: "Budowlanka", value: 5500, deadline: "2d 10h", match: 76, industry: "Budownictwo", description: "Firma budowlana potrzebuje materiałów" },
    { id: 4, company: "Eko-Energia", value: 15000, deadline: "3d 2h", match: 92, industry: "Energia", description: "Energia odnawialna" },
    { id: 5, company: "Smart Home", value: 9000, deadline: "4d 8h", match: 82, industry: "Smart Tech", description: "Inteligentne domy" },
  ]);

  const [myLeads, setMyLeads] = useState([
    { id: 1, company: "Tech Corp", value: 45000, status: "active", daysLeft: 12, date: "2024-06-01", progress: 65 },
    { id: 2, company: "Industry Solutions", value: 38000, status: "active", daysLeft: 5, date: "2024-06-05", progress: 85 },
    { id: 3, company: "Global Trade", value: 32000, status: "completed", daysLeft: 0, date: "2024-05-28", progress: 100 },
  ]);

  const [monthlySpending, setMonthlySpending] = useState([
    { month: 'Sty', value: 45000 },
    { month: 'Lut', value: 52000 },
    { month: 'Mar', value: 48000 },
    { month: 'Kwi', value: 61000 },
    { month: 'Maj', value: 68000 },
    { month: 'Cze', value: 74000 },
  ]);

  useEffect(() => {
    fetchBuyerData();
  }, [user]);

  const fetchBuyerData = async () => {
    try {
      // Pobierz dostępne leady
      const { count: availableCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available')
        .is('buyer_id', null);

      // Pobierz leady kupującego
      const { data: buyerLeads, count: buyerCount } = await supabase
        .from('leads')
        .select('*')
        .eq('buyer_id', user?.id);

      const totalValue = buyerLeads?.reduce((sum, l) => sum + (l.value || 0), 0) || 0;

      setStats({
        availableLeads: availableCount || 7,
        myLeads: buyerCount || 0,
        activeComplaints: 2,
        totalSpent: totalValue,
        avgLeadValue: buyerCount ? Math.round(totalValue / buyerCount) : 0,
        conversionRate: 68
      });

    } catch (error) {
      console.error('Błąd pobierania danych:', error);
    }
  };

  const handleTakeLead = (leadId: number) => {
    // Tu będzie logika odbioru leada z Supabase
    console.log('Odebrano lead:', leadId);
  };

  const filteredLeads = availableLeads.filter(lead =>
    lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portal Kupującego</h1>
          <p className="text-muted-foreground">Zarządzanie lejdami i reklamacjami</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Package className="h-3 w-3 mr-1" />
          {user?.fullName}
        </Badge>
      </div>

      {/* Statystyki */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Dostępne leady</p>
                <p className="text-3xl font-bold">{stats.availableLeads}</p>
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
                <p className="text-2xl font-bold text-blue-600">{stats.myLeads}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wydane środki</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalSpent.toLocaleString()} zł</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktywne reklamacje</p>
                <p className="text-2xl font-bold text-red-600">{stats.activeComplaints}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wykres wydatków */}
      <Card>
        <CardHeader>
          <CardTitle>Wydatki miesięczne</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" name="Wydatki (zł)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Wyszukiwarka dostępnych leadów */}
      <Card>
        <CardHeader>
          <CardTitle>Dostępne leady</CardTitle>
          <p className="text-sm text-muted-foreground">Leadly dopasowane do Twojego profilu</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po firmie lub branży..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtry
            </Button>
          </div>

          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-lg">{lead.company}</p>
                    <Badge variant="outline">{lead.industry}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{lead.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 font-semibold">{lead.value.toLocaleString()} zł</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lead.deadline}
                    </span>
                    <Badge className="bg-green-500">Dopasowanie {lead.match}%</Badge>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleTakeLead(lead.id)}
                >
                  Odbierz lead
                </Button>
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
              <div key={lead.id} className="space-y-2 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{lead.company}</p>
                    <p className="text-sm text-muted-foreground">Data odbioru: {lead.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{lead.value.toLocaleString()} zł</p>
                    <Badge variant={lead.status === "active" ? "default" : "outline"}>
                      {lead.status === "active" ? "Aktywny" : "Zrealizowany"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Postęp realizacji</span>
                    <span>{lead.progress}%</span>
                  </div>
                  <Progress value={lead.progress} className="h-2" />
                </div>
                {lead.daysLeft > 0 && (
                  <p className="text-sm text-orange-600">Pozostało {lead.daysLeft} dni do realizacji</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Szybkie akcje */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-all">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="font-semibold">Zgłoś reklamację</p>
            <p className="text-sm text-muted-foreground">48h na zgłoszenie</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-all">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="font-semibold">Raporty</p>
            <p className="text-sm text-muted-foreground">Analiza zakupów</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-all">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="font-semibold">Historia</p>
            <p className="text-sm text-muted-foreground">Poprzednie transakcje</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}