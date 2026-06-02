import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Target, Calendar, Clock, Award, PhoneCall, Mail, CheckCircle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

import { Link } from 'react-router-dom';

export default function DashboardSales() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pipelineValue: 0,
    activeLeads: 0,
    conversionRate: 0,
    newClients: 0,
    completedDeals: 0,
    totalRevenue: 0
  });

  const [pipelineData, setPipelineData] = useState([
    { stage: "Nowe", value: 0, count: 0, color: "#3b82f6" },
    { stage: "Kontakt", value: 0, count: 0, color: "#f59e0b" },
    { stage: "Oferta", value: 0, count: 0, color: "#8b5cf6" },
    { stage: "Negocjacje", value: 0, count: 0, color: "#ec4899" },
    { stage: "Zamknięte", value: 0, count: 0, color: "#10b981" },
  ]);

  const [weeklyActivity, setWeeklyActivity] = useState([
    { day: 'Pon', calls: 0, meetings: 0, deals: 0 },
    { day: 'Wt', calls: 0, meetings: 0, deals: 0 },
    { day: 'Śr', calls: 0, meetings: 0, deals: 0 },
    { day: 'Czw', calls: 0, meetings: 0, deals: 0 },
    { day: 'Pt', calls: 0, meetings: 0, deals: 0 },
  ]);

  const [topDeals, setTopDeals] = useState([
    { company: "Tech Corp", value: 45000, probability: 85, daysLeft: 5, status: "Negocjacje" },
    { company: "Industry Solutions", value: 38000, probability: 70, daysLeft: 12, status: "Oferta" },
    { company: "Global Trade", value: 32000, probability: 90, daysLeft: 3, status: "Negocjacje" },
  ]);

  useEffect(() => {
    fetchSalesData();
  }, [user]);

  const fetchSalesData = async () => {
    try {
      // Pobierz leady przypisane do handlowca
      const { data: leads, count } = await supabase
        .from('leads')
        .select('*')
        .eq('assigned_to', user?.id);

      const activeLeadsCount = leads?.filter(l => l.status !== 'completed' && l.status !== 'lost').length || 0;
      const completedLeads = leads?.filter(l => l.status === 'completed').length || 0;
      
      // Symulowane wartości (podmień na prawdziwe z bazy)
      setStats({
        pipelineValue: 396000,
        activeLeads: activeLeadsCount,
        conversionRate: leads?.length ? Math.round((completedLeads / leads.length) * 100) : 0,
        newClients: 8,
        completedDeals: completedLeads,
        totalRevenue: 396000
      });

      setPipelineData([
        { stage: "Nowe", value: 96000, count: 8, color: "#3b82f6" },
        { stage: "Kontakt", value: 144000, count: 12, color: "#f59e0b" },
        { stage: "Oferta", value: 72000, count: 6, color: "#8b5cf6" },
        { stage: "Negocjacje", value: 48000, count: 4, color: "#ec4899" },
        { stage: "Zamknięte", value: 36000, count: 3, color: "#10b981" },
      ]);

      setWeeklyActivity([
        { day: 'Pon', calls: 12, meetings: 3, deals: 2 },
        { day: 'Wt', calls: 15, meetings: 4, deals: 3 },
        { day: 'Śr', calls: 10, meetings: 2, deals: 1 },
        { day: 'Czw', calls: 14, meetings: 5, deals: 4 },
        { day: 'Pt', calls: 8, meetings: 3, deals: 2 },
      ]);

    } catch (error) {
      console.error('Błąd pobierania danych:', error);
    }
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 80) return "bg-green-500";
    if (prob >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline Sprzedaży</h1>
          <p className="text-muted-foreground">Zarządzanie procesem sprzedaży</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <TrendingUp className="h-3 w-3 mr-1" />
          {user?.fullName}
        </Badge>
      </div>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline value</p>
                <p className="text-2xl font-bold">{stats.pipelineValue.toLocaleString()} zł</p>
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
                <p className="text-2xl font-bold">{stats.activeLeads}</p>
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
                <p className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zrealizowane</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedDeals}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
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
                <Progress value={(stage.value / stats.pipelineValue) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wykresy */}
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
                    <Badge className={getProbabilityColor(deal.probability)}>
                      {deal.probability}%
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {deal.daysLeft} dni
                    </span>
                    <Badge variant="outline">{deal.status}</Badge>
                    <Button variant="ghost" size="sm">
                      Szczegóły
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Szybkie akcje */}
      <Card>
        <CardHeader>
          <CardTitle>Szybkie akcje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a className="h-20 flex flex-col gap-2" href="tel:+48666666666">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <PhoneCall className="h-5 w-5" />
                <span>Zadzwoń</span>
              </Button>
            </a>
            <a className="h-20 flex flex-col gap-2" href="/contact">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Mail className="h-5 w-5" />
                <span>Wyślij email</span>
              </Button>
            </a>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-5 w-5" />
              <span>Umów spotkanie</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-5 w-5" />
              <span>Wyślij ofertę</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}