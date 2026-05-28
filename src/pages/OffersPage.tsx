import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Plus,
  Search,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Loader2,
  Building2,
  DollarSign,
  Calendar,
  Link2,
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

// ─── Typy ────────────────────────────────────────────────────────────────────

type OfferStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  email: string;
}

interface Offer {
  id: string;
  lead_id: string | null;
  title: string;
  company_name: string;
  contact_email: string;
  value: number;
  status: OfferStatus;
  description: string | null;
  created_by: string;
  created_at: string;
  valid_until: string | null;
  // join z leads
  leads?: { first_name: string; last_name: string; company_name: string } | null;
}

interface OfferFormData {
  lead_id: string;        // '' = brak powiązania
  title: string;
  company_name: string;
  contact_email: string;
  value: string;
  description: string;
  valid_until: string;
}

const EMPTY_FORM: OfferFormData = {
  lead_id: '',
  title: '',
  company_name: '',
  contact_email: '',
  value: '',
  description: '',
  valid_until: '',
};

// Tylko te role mogą tworzyć oferty
const CAN_CREATE_ROLES = ['admin', 'sales_direct'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OfferStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  draft:    { label: 'Szkic',          icon: Clock,        className: 'bg-gray-100 text-gray-700 border-gray-200'   },
  sent:     { label: 'Wysłana',        icon: Send,         className: 'bg-blue-50 text-blue-700 border-blue-200'    },
  accepted: { label: 'Zaakceptowana',  icon: CheckCircle,  className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Odrzucona',      icon: XCircle,      className: 'bg-red-50 text-red-700 border-red-200'       },
  expired:  { label: 'Wygasła',        icon: Clock,        className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
};

function StatusBadge({ status }: { status: OfferStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function formatDate(d: string | null) {
  if (!d) return '—';
  try { return format(new Date(d), 'dd.MM.yyyy', { locale: pl }); }
  catch { return d; }
}

// ─── Komponent ────────────────────────────────────────────────────────────────

export default function OffersPage() {
  const { user } = useAuth();
  const canCreate = user ? CAN_CREATE_ROLES.includes(user.role) : false;

  const [offers, setOffers]           = useState<Offer[]>([]);
  const [leads, setLeads]             = useState<Lead[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal tworzenia
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm]               = useState<OfferFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors]   = useState<Record<string, string>>({});
  const [saving, setSaving]           = useState(false);

  // Modal podglądu
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // ── Pobieranie ofert ──────────────────────────────────────────────────────

  const fetchOffers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Dołącz dane leada przez join
      let query = supabase
        .from('offers')
        .select('*, leads(first_name, last_name, company_name)')
        .order('created_at', { ascending: false });

      // Handlowiec widzi tylko swoje — RLS to już pilnuje po stronie bazy,
      // ale filtrujemy też po stronie klienta dla pewności
      if (user.role === 'sales_direct') {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOffers((data as Offer[]) ?? []);
    } catch (err) {
      console.error('Błąd pobierania ofert:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Pobieranie leadów do selecta w formularzu ─────────────────────────────

  const fetchLeads = async () => {
    if (!user || !canCreate) return;
    try {
      let query = supabase
        .from('leads')
        .select('id, first_name, last_name, company_name, email')
        .order('created_at', { ascending: false });

      // Handlowiec widzi tylko przypisane do niego leady
      if (user.role === 'sales_direct') {
        query = query.eq('assigned_to', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLeads((data as Lead[]) ?? []);
    } catch (err) {
      console.error('Błąd pobierania leadów:', err);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Gdy użytkownik wybiera lead — auto-uzupełnij pola ────────────────────

  const handleLeadSelect = (leadId: string) => {
    if (leadId === 'none') {
      setForm(prev => ({ ...prev, lead_id: '', company_name: '', contact_email: '' }));
      return;
    }
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    setForm(prev => ({
      ...prev,
      lead_id:      leadId,
      company_name: lead.company_name || prev.company_name,
      contact_email: lead.email       || prev.contact_email,
    }));
    // Usuń ewentualne błędy walidacji dla tych pól
    setFormErrors(prev => {
      const next = { ...prev };
      delete next.company_name;
      delete next.contact_email;
      return next;
    });
  };

  // ── Walidacja ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim())         errors.title         = 'Tytuł jest wymagany.';
    if (!form.company_name.trim())  errors.company_name  = 'Nazwa firmy jest wymagana.';
    if (!form.contact_email.trim()) {
      errors.contact_email = 'Email kontaktowy jest wymagany.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
      errors.contact_email = 'Podaj prawidłowy adres email.';
    }
    if (!form.value.trim()) {
      errors.value = 'Wartość oferty jest wymagana.';
    } else if (isNaN(Number(form.value)) || Number(form.value) <= 0) {
      errors.value = 'Podaj wartość większą od 0.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field: keyof OfferFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  // ── Zapis ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (status: 'draft' | 'sent') => {
    if (!validate() || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('offers').insert({
        lead_id:       form.lead_id || null,
        title:         form.title.trim(),
        company_name:  form.company_name.trim(),
        contact_email: form.contact_email.trim().toLowerCase(),
        value:         Number(form.value),
        description:   form.description.trim() || null,
        valid_until:   form.valid_until || null,
        status,
        created_by:    user.id,
      });
      if (error) throw error;
      setIsCreateOpen(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
      fetchOffers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Błąd zapisu oferty.';
      setFormErrors(prev => ({ ...prev, submit: msg }));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setIsCreateOpen(true);
  };

  // ── Filtrowanie ───────────────────────────────────────────────────────────

  const filteredOffers = offers.filter(o => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      o.title.toLowerCase().includes(q) ||
      o.company_name.toLowerCase().includes(q) ||
      o.contact_email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total:      offers.length,
    sent:       offers.filter(o => o.status === 'sent').length,
    accepted:   offers.filter(o => o.status === 'accepted').length,
    totalValue: offers
      .filter(o => o.status === 'accepted')
      .reduce((sum, o) => sum + o.value, 0),
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Nagłówek */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Oferty</h1>
          <p className="text-muted-foreground">
            {canCreate ? 'Zarządzaj ofertami handlowymi' : 'Przeglądaj oferty w systemie'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchOffers}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Odśwież
          </Button>
          {/* Przycisk "Nowa oferta" — tylko admin i sales_direct */}
          {canCreate && (
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nowa oferta
            </Button>
          )}
        </div>
      </div>

      {/* Statystyki */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wszystkie</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wysłane</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zaakceptowane</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wartość zaakceptowanych</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalValue.toLocaleString('pl-PL')} zł
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtry */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po tytule, firmie lub emailu..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="border rounded-lg px-3 py-2 bg-background text-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Wszystkie statusy</option>
              <option value="draft">Szkic</option>
              <option value="sent">Wysłana</option>
              <option value="accepted">Zaakceptowana</option>
              <option value="rejected">Odrzucona</option>
              <option value="expired">Wygasła</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista ofert</CardTitle>
          <p className="text-sm text-muted-foreground">
            Znaleziono {filteredOffers.length} {filteredOffers.length === 1 ? 'ofertę' : 'ofert'}
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <p>Ładowanie ofert...</p>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <FileText className="h-12 w-12" />
              <p>Brak ofert do wyświetlenia</p>
              {canCreate && (
                <Button variant="outline" size="sm" onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4 mr-1" />
                  Utwórz pierwszą ofertę
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Tytuł</TableHead>
                    <TableHead>Firma / Lead</TableHead>
                    <TableHead>Wartość</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ważna do</TableHead>
                    <TableHead>Utworzona</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOffers.map(offer => (
                    <TableRow key={offer.id} className="hover:bg-purple-50/50 transition-colors">
                      <TableCell>
                        <p className="font-semibold">{offer.title}</p>
                        <p className="text-xs text-muted-foreground">{offer.contact_email}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-sm">{offer.company_name}</p>
                            {/* Pokaż powiązanego leada jeśli istnieje */}
                            {offer.leads && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Link2 className="h-3 w-3" />
                                {offer.leads.first_name} {offer.leads.last_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {offer.value.toLocaleString('pl-PL')} zł
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={offer.status} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(offer.valid_until)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(offer.created_at)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-purple-100"
                          onClick={() => { setSelectedOffer(offer); setIsDetailsOpen(true); }}
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

      {/* ── Modal: Nowa oferta ─────────────────────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Nowa oferta</DialogTitle>
            <DialogDescription>
              Wybierz lead — firma i email uzupełnią się automatycznie. Możesz też wpisać ręcznie.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">

            {formErrors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                {formErrors.submit}
              </div>
            )}

            {/* Wybór leada — opcjonalne */}
            <div className="space-y-1">
              <Label htmlFor="lead_id">
                Powiąż z leadem{' '}
                <span className="text-muted-foreground font-normal">(opcjonalnie)</span>
              </Label>
              <Select
                value={form.lead_id || 'none'}
                onValueChange={handleLeadSelect}
              >
                <SelectTrigger id="lead_id" className="w-full">
                  <SelectValue placeholder="Wybierz lead lub zostaw puste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Brak powiązania —</SelectItem>
                  {leads.map(lead => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.first_name} {lead.last_name}
                      {lead.company_name ? ` · ${lead.company_name}` : ''}
                    </SelectItem>
                  ))}
                  {leads.length === 0 && (
                    <SelectItem value="empty" disabled>
                      Brak dostępnych leadów
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.lead_id && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  Firma i email uzupełnione z leada — możesz je edytować poniżej.
                </p>
              )}
            </div>

            {/* Tytuł */}
            <div className="space-y-1">
              <Label htmlFor="title">Tytuł oferty</Label>
              <Input
                id="title"
                placeholder="np. Oferta na wdrożenie systemu CRM"
                value={form.title}
                onChange={e => handleFieldChange('title', e.target.value)}
                aria-invalid={!!formErrors.title}
              />
              {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
            </div>

            {/* Firma + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="company_name">Nazwa firmy</Label>
                <Input
                  id="company_name"
                  placeholder="Firma XYZ Sp. z o.o."
                  value={form.company_name}
                  onChange={e => handleFieldChange('company_name', e.target.value)}
                  aria-invalid={!!formErrors.company_name}
                />
                {formErrors.company_name && (
                  <p className="text-xs text-red-500">{formErrors.company_name}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="contact_email">Email kontaktowy</Label>
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="kontakt@firma.pl"
                  value={form.contact_email}
                  onChange={e => handleFieldChange('contact_email', e.target.value)}
                  aria-invalid={!!formErrors.contact_email}
                />
                {formErrors.contact_email && (
                  <p className="text-xs text-red-500">{formErrors.contact_email}</p>
                )}
              </div>
            </div>

            {/* Wartość + Ważna do */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="value">Wartość oferty (zł)</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  placeholder="50000"
                  value={form.value}
                  onChange={e => handleFieldChange('value', e.target.value)}
                  aria-invalid={!!formErrors.value}
                />
                {formErrors.value && <p className="text-xs text-red-500">{formErrors.value}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="valid_until">Ważna do <span className="text-muted-foreground font-normal">(opcjonalnie)</span></Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={form.valid_until}
                  onChange={e => handleFieldChange('valid_until', e.target.value)}
                />
              </div>
            </div>

            {/* Opis */}
            <div className="space-y-1">
              <Label htmlFor="description">
                Opis / notatki{' '}
                <span className="text-muted-foreground font-normal">(opcjonalnie)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Dodatkowe informacje o ofercie, warunki, uwagi..."
                value={form.description}
                onChange={e => handleFieldChange('description', e.target.value)}
                className="resize-none min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Anuluj
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={saving}
            >
              {saving
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : <Clock className="h-4 w-4 mr-2" />
              }
              Zapisz jako szkic
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => handleSubmit('sent')}
              disabled={saving}
            >
              {saving
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : <Send className="h-4 w-4 mr-2" />
              }
              Wyślij ofertę
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Szczegóły ───────────────────────────────────────────────── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Szczegóły oferty</DialogTitle>
          </DialogHeader>
          {selectedOffer && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">{selectedOffer.title}</h3>
                  <p className="text-muted-foreground text-sm">{selectedOffer.company_name}</p>
                </div>
                <StatusBadge status={selectedOffer.status} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Email kontaktowy</p>
                  <p className="text-sm font-medium break-all">{selectedOffer.contact_email}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Wartość oferty</p>
                  <p className="text-sm font-semibold text-green-600">
                    {selectedOffer.value.toLocaleString('pl-PL')} zł
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Data utworzenia
                  </p>
                  <p className="text-sm font-medium">{formatDate(selectedOffer.created_at)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Ważna do
                  </p>
                  <p className="text-sm font-medium">{formatDate(selectedOffer.valid_until)}</p>
                </div>
              </div>

              {/* Powiązany lead */}
              {selectedOffer.leads && (
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1 flex items-center gap-1 font-medium">
                    <Link2 className="h-3 w-3" /> Powiązany lead
                  </p>
                  <p className="text-sm font-medium">
                    {selectedOffer.leads.first_name} {selectedOffer.leads.last_name}
                    {selectedOffer.leads.company_name && ` · ${selectedOffer.leads.company_name}`}
                  </p>
                </div>
              )}

              {selectedOffer.description && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Opis / notatki</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedOffer.description}</p>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Zamknij
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}