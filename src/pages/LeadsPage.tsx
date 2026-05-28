import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Target, Search, Eye, Phone, Building2, Globe, Users,
  CheckCircle, XCircle, Clock, RefreshCw, Zap, Plus, Mail, User, Briefcase,
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
  consent_timestamp: string;
  consent_text: string;
  is_duplicate: boolean;
  created_at: string;
}

interface NewLeadForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  source: string;
  status: string;
}

const emptyForm: NewLeadForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  company_name: '',
  source: 'web',
  status: 'new_web',
};

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState<NewLeadForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<NewLeadForm>>({});
  const [saving, setSaving] = useState(false);

  const canAddLead = user?.role === 'admin' || user?.role === 'agent_cc';
  const isBuyer = user?.role === 'buyer';

  useEffect(() => {
    if (user) fetchLeads();
  }, [user]);

  const fetchLeads = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const columns = 'id, first_name, last_name, email, phone, company_name, source, status, assigned_to, buyer_id, consent_timestamp, consent_text, is_duplicate, created_at';

      let query = supabase.from('leads').select(columns);

      if (user.role === 'agent_cc' || user.role === 'sales_direct') {
        query = query.eq('assigned_to', user.id);
      } else if (user.role === 'buyer') {
        query = query.eq('buyer_id', user.id);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Błąd pobierania leadów:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<NewLeadForm> = {};
    if (!form.first_name.trim()) errors.first_name = 'Imię jest wymagane';
    if (!form.last_name.trim()) errors.last_name = 'Nazwisko jest wymagane';
    if (!form.email.trim()) {
      errors.email = 'Email jest wymagany';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Nieprawidłowy format email';
    }
    if (!form.phone.trim()) errors.phone = 'Telefon jest wymagany';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddLead = async () => {
    if (!validateForm()) return;
    if (!user) {
      console.error('Brak zalogowanego użytkownika');
      return;
    }

    try {
      setSaving(true);
      
      const newLeadData = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company_name: form.company_name?.trim() || null,
        source: form.source,
        status: form.status,
        assigned_to: user.role === 'agent_cc' ? user.id : null,
        buyer_id: null,
        consent_timestamp: new Date().toISOString(),
        consent_text: "Wyrażam zgodę na przetwarzanie danych osobowych w celu marketingowym",
        is_duplicate: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('leads')
        .insert([newLeadData]);

      if (error) throw error;
      
      setIsAddOpen(false);
      setForm(emptyForm);
      setFormErrors({});
      await fetchLeads();
      
    } catch (error: any) {
      console.error('Błąd dodawania leada:', error);
      alert(`Nie udało się dodać leada: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseAdd = () => {
    setIsAddOpen(false);
    setForm(emptyForm);
    setFormErrors({});
  };

  const BlurredField = ({ value }: { value: string }) => (
    <span className="select-none blur-sm" style={{ userSelect: 'none', pointerEvents: 'none' }}>
      {value}
    </span>
  );

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; icon: any; bg: string }> = {
      new_web:        { label: 'Nowy z web',     icon: Clock,       bg: 'bg-blue-50 text-blue-700 border border-blue-200' },
      pending_direct: { label: 'Oczekujący (DS)', icon: Clock,       bg: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
      pending_cc:     { label: 'Oczekujący (CC)', icon: Clock,       bg: 'bg-orange-50 text-orange-700 border border-orange-200' },
      approved:       { label: 'Zatwierdzony',    icon: CheckCircle, bg: 'bg-green-50 text-green-700 border border-green-200' },
      rejected:       { label: 'Odrzucony',       icon: XCircle,     bg: 'bg-red-50 text-red-700 border border-red-200' },
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
      web: 'Strona WWW',
      call_center: 'Call Center',
      sales_direct: 'Sprzedaż bezpośrednia',
    };
    return sources[source] || source || 'Brak';
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, any> = {
      web: Globe,
      call_center: Phone,
      sales_direct: Users,
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
    new: leads.filter(l => l.status === 'new_web').length,
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
      {/* Nagłówek */}
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
          <div className="flex gap-2">
            {canAddLead && (
              <Button
                size="sm"
                className="bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow"
                onClick={() => setIsAddOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Dodaj lead
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={fetchLeads}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Odśwież
            </Button>
          </div>
        </div>
      </div>

      {/* Statystyki */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => setStatusFilter('all')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wszystkie</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-gray-800" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => setStatusFilter('new_web')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nowe</p>
                <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => setStatusFilter('approved')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zatwierdzone</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => setStatusFilter('rejected')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Odrzucone</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wyszukiwarka */}
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
              <option value="new_web">Nowe z web</option>
              <option value="pending_direct">Oczekujące (DS)</option>
              <option value="pending_cc">Oczekujące (CC)</option>
              <option value="approved">Zatwierdzone</option>
              <option value="rejected">Odrzucone</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
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
                            <p className="text-xs text-muted-foreground">
                              {isBuyer ? <BlurredField value={lead.email || 'brak@email.pl'} /> : lead.email}
                            </p>
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
                          <span className="text-sm">
                            {isBuyer ? <BlurredField value={lead.phone || '+48 000 000 000'} /> : (lead.phone || '—')}
                          </span>
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

      {/* Modal: Dodaj lead */}
      <Dialog open={isAddOpen} onOpenChange={handleCloseAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Dodaj nowy lead</DialogTitle>
            <DialogDescription>Wypełnij dane kontaktowe nowego leada.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="first_name" className="flex items-center gap-1.5 text-sm font-medium">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Imię <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  placeholder="Jan"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className={formErrors.first_name ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
                {formErrors.first_name && (
                  <p className="text-xs text-red-500">{formErrors.first_name}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name" className="flex items-center gap-1.5 text-sm font-medium">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Nazwisko <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  placeholder="Kowalski"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className={formErrors.last_name ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
                {formErrors.last_name && (
                  <p className="text-xs text-red-500">{formErrors.last_name}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jan.kowalski@firma.pl"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={formErrors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}
              />
              {formErrors.email && (
                <p className="text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-medium">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Telefon <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="+48 123 456 789"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={formErrors.phone ? 'border-red-400 focus-visible:ring-red-400' : ''}
              />
              {formErrors.phone && (
                <p className="text-xs text-red-500">{formErrors.phone}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company_name" className="flex items-center gap-1.5 text-sm font-medium">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                Firma
              </Label>
              <Input
                id="company_name"
                placeholder="Nazwa firmy Sp. z o.o."
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Źródło</Label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz źródło" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Strona WWW</SelectItem>
                    <SelectItem value="call_center">Call Center</SelectItem>
                    <SelectItem value="sales_direct">Sprzedaż bezpośrednia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_web">Nowy z web</SelectItem>
                    <SelectItem value="pending_direct">Oczekujący (DS)</SelectItem>
                    <SelectItem value="pending_cc">Oczekujący (CC)</SelectItem>
                    <SelectItem value="approved">Zatwierdzony</SelectItem>
                    <SelectItem value="rejected">Odrzucony</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseAdd} disabled={saving}>
              Anuluj
            </Button>
            <Button
              onClick={handleAddLead}
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 min-w-[120px]"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Dodaj lead
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Szczegóły leada */}
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
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <p className="font-medium text-sm mt-0.5">
                    {isBuyer ? <BlurredField value={selectedLead.email} /> : selectedLead.email}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-muted-foreground text-xs">Telefon</Label>
                  <p className="font-medium text-sm mt-0.5">
                    {isBuyer ? <BlurredField value={selectedLead.phone || '—'} /> : (selectedLead.phone || '—')}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-muted-foreground text-xs">Źródło</Label>
                  <p className="font-medium text-sm mt-0.5">{getSourceLabel(selectedLead.source)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-muted-foreground text-xs">Firma</Label>
                  <p className="font-medium text-sm mt-0.5">{selectedLead.company_name || '—'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-muted-foreground text-xs">Data dodania</Label>
                  <p className="font-medium text-sm mt-0.5">{formatDate(selectedLead.created_at)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-muted-foreground text-xs">ID</Label>
                  <p className="font-medium text-sm mt-0.5">{selectedLead.id.slice(0, 8)}...</p>
                </div>
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