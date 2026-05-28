import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Target, Search, Eye, Phone, Building2, Globe, Users,
  CheckCircle, XCircle, Clock, RefreshCw, Zap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  source: string;
  status: string;
  assigned_to: string | null;
  buyer_id: string | null;
  created_at: string;
}

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    if (user) fetchLeads();
  }, [user]);

  const fetchLeads = async () => {
    if (!user) return;
    try {
      setLoading(true);

      let query = supabase.from('leads').select('*');

      if (user.role === 'agent_cc' || user.role === 'sales_direct') {
        query = query.eq('assigned_to', user.id);
      } else if (user.role === 'buyer') {
        query = query.eq('buyer_id', user.id);
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
    const statuses: Record<string, { label: string; icon: any; bg: string }> = {
      new:            { label: 'Nowy',              icon: Clock,        bg: 'bg-blue-50 text-blue-700 border border-blue-200' },
      new_web:        { label: 'Nowy z web',         icon: Clock,        bg: 'bg-blue-50 text-blue-700 border border-blue-200' },
      pending_direct: { label: 'Oczekujący (DS)',    icon: Clock,        bg: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
      pending_cc:     { label: 'Oczekujący (CC)',    icon: Clock,        bg: 'bg-orange-50 text-orange-700 border border-orange-200' },
      approved:       { label: 'Zatwierdzony',       icon: CheckCircle,  bg: 'bg-green-50 text-green-700 border border-green-200' },
      rejected:       { label: 'Odrzucony',          icon: XCircle,      bg: 'bg-red-50 text-red-700 border border-red-200' },
      in_progress:    { label: 'W trakcie',          icon: Clock,        bg: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
      completed:      { label: 'Zrealizowany',       icon: CheckCircle,  bg: 'bg-green-50 text-green-700 border border-green-200' },
      available:      { label: 'Dostępny',           icon: Target,       bg: 'bg-purple-50 text-purple-700 border border-purple-200' },
    };
    const info = statuses[status] || { label: status, icon: Clock, bg: 'bg-gray-50 text-gray-700 border border-gray-200' };
    const Icon = info.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${info.bg}`}>
        <Icon className="h-3 w-3" />
        {info.label}
      </span>
    );
  };

  const getSourceLabel = (source: string) => {
    const sources: Record<string, string> = {
      web: 'Strona WWW', website: 'Strona WWW', linkedin: 'LinkedIn',
      referral: 'Polecenie', conference: 'Konferencja',
      sales_direct: 'Sprzedaż bezpośrednia', call_center: 'Call Center', other: 'Inne',
    };
    return sources[source] || source || 'Brak';
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, any> = {
      web: Globe, website: Globe, linkedin: Users, call_center: Phone, sales_direct: Users,
    };
    const Icon = icons[source] || Globe;
    return <Icon className="h-3 w-3" />;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Brak danych';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: pl });
    } catch {
      return dateString;
    }
  };

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-pink-500 to-rose-500', 'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500',
      'from-orange-500 to-amber-500', 'from-red-500 to-pink-500',
    ];
    return colors[(name?.length || 0) % colors.length];
  };

  const getPageTitle = () => {
    if (user?.role === 'buyer') return 'Moje leady';
    if (user?.role === 'agent_cc') return 'Kolejka leadów';
    if (user?.role === 'sales_direct') return 'Moi klienci';
    return 'Leadzy';
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => ['new', 'new_web'].includes(l.status)).length,
    approved: leads.filter(l => l.status === 'approved').length,
    rejected: leads.filter(l => l.status === 'rejected').length,
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      (lead.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
            <p className="text-purple-100 mt-1">
              {user?.role === 'admin'
                ? 'Zarządzanie wszystkimi leadami w systemie'
                : user?.role === 'buyer'
                ? 'Leady przypisane do Twojego konta'
                : 'Leady przypisane do Ciebie'}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={fetchLeads}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Odśwież
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: 'Wszystkie', value: stats.total, color: 'text-gray-800', bg: 'bg-gray-100', icon: Target, filter: 'all' },
          { label: 'Nowe', value: stats.new, color: 'text-blue-600', bg: 'bg-blue-100', icon: Zap, filter: 'new' },
          { label: 'Zatwierdzone', value: stats.approved, color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, filter: 'approved' },
          { label: 'Odrzucone', value: stats.rejected, color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, filter: 'rejected' },
        ].map(({ label, value, color, bg, icon: Icon, filter }) => (
          <Card
            key={label}
            className="cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => setStatusFilter(filter)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                </div>
                <div className={`h-12 w-12 rounded-full ${bg} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po imieniu, nazwisku, firmie lub emailu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="border rounded-lg px-3 py-2 bg-background text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Wszystkie statusy</option>
              <option value="new">Nowe</option>
              <option value="new_web">Nowe z web</option>
              <option value="pending_direct">Oczekujące (DS)</option>
              <option value="pending_cc">Oczekujące (CC)</option>
              <option value="approved">Zatwierdzone</option>
              <option value="rejected">Odrzucone</option>
              <option value="in_progress">W trakcie</option>
              <option value="completed">Zrealizowane</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista leadów</CardTitle>
          <p className="text-sm text-muted-foreground">Znaleziono {filteredLeads.length} leadów</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-500" />
              <p className="text-muted-foreground">Ładowanie danych...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Brak leadów do wyświetlenia</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Kontakt</TableHead>
                    <TableHead>Firma</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Źródło</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-purple-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getAvatarColor(lead.first_name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                            {getInitials(lead.first_name || '', lead.last_name || '')}
                          </div>
                          <div>
                            <p className="font-semibold">{lead.first_name} {lead.last_name}</p>
                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">{lead.company_name || '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">{lead.phone || '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          {getSourceIcon(lead.source)}
                          {getSourceLabel(lead.source)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedLead(lead); setIsDetailsOpen(true); }}
                          className="hover:bg-purple-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Szczegóły leada
            </DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getAvatarColor(selectedLead.first_name)} flex items-center justify-center text-white font-bold text-2xl flex-shrink-0`}>
                  {getInitials(selectedLead.first_name || '', selectedLead.last_name || '')}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedLead.first_name} {selectedLead.last_name}</h3>
                  <p className="text-muted-foreground">{selectedLead.company_name}</p>
                  <div className="mt-1">{getStatusBadge(selectedLead.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Email', value: selectedLead.email },
                  { label: 'Telefon', value: selectedLead.phone || '—' },
                  { label: 'Źródło', value: getSourceLabel(selectedLead.source) },
                  { label: 'Firma', value: selectedLead.company_name || '—' },
                  { label: 'Data dodania', value: formatDate(selectedLead.created_at) },
                  { label: 'ID', value: selectedLead.id.slice(0, 8) + '...' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 p-3 rounded-lg">
                    <Label className="text-muted-foreground text-xs">{label}</Label>
                    <p className="font-medium text-sm mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Zamknij</Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Phone className="h-4 w-4 mr-2" />
                  Kontakt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}