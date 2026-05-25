import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Target, Search, Plus, Eye, Phone, Mail, Building2, 
  DollarSign, Calendar, Filter, Download 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  status: string;
  value?: number;
  created_at: string;
}

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      let query = supabase.from('leads').select('*');
      
      // Filtrowanie w zależności od roli
      if (user?.role === 'agent_cc') {
        query = query.eq('status', 'new').is('assigned_to', null);
      } else if (user?.role === 'sales_direct') {
        query = query.eq('assigned_to', user.id);
      } else if (user?.role === 'buyer') {
        query = query.eq('status', 'available').is('buyer_id', null);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Błąd pobierania leadów:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; color: string }> = {
      new: { label: 'Nowy', color: 'bg-blue-500' },
      in_progress: { label: 'W trakcie', color: 'bg-yellow-500' },
      completed: { label: 'Zrealizowany', color: 'bg-green-500' },
      lost: { label: 'Utracony', color: 'bg-red-500' },
      available: { label: 'Dostępny', color: 'bg-purple-500' },
    };
    const info = statuses[status] || { label: status, color: 'bg-gray-500' };
    return <Badge className={info.color}>{info.label}</Badge>;
  };

  const filteredLeads = leads.filter(lead => 
    (statusFilter === 'all' || lead.status === statusFilter) &&
    (lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    inProgress: leads.filter(l => l.status === 'in_progress').length,
    completed: leads.filter(l => l.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leadzy</h1>
          <p className="text-muted-foreground">Zarządzanie lejdami i kontaktami</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Eksportuj
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj leada
          </Button>
        </div>
      </div>

      {/* Statystyki */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wszystkie leady</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nowe</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <Badge className="bg-blue-500">Do obsługi</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">W trakcie</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <Badge variant="secondary">Aktywne</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zrealizowane</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-600">Sukces</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtry */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po nazwie firmie lub osobie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              className="border rounded-md px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Wszystkie statusy</option>
              <option value="new">Nowe</option>
              <option value="in_progress">W trakcie</option>
              <option value="completed">Zrealizowane</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista leadów */}
      <Card>
        <CardHeader>
          <CardTitle>Lista leadów</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Ładowanie...</div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between border-b pb-4 hover:bg-gray-50 p-3 rounded-lg transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-lg">
                        {lead.first_name} {lead.last_name}
                      </p>
                      {getStatusBadge(lead.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        {lead.company_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Podgląd
                    </Button>
                    {user?.role === 'agent_cc' && (
                      <Button size="sm" className="bg-blue-600">
                        <Phone className="h-4 w-4 mr-1" />
                        Zadzwoń
                      </Button>
                    )}
                    {user?.role === 'buyer' && lead.status === 'available' && (
                      <Button size="sm" className="bg-green-600">
                        Odbierz lead
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}