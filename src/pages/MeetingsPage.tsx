import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Calendar, Clock, MapPin, Video, Phone as PhoneIcon, Users,
  CheckCircle, XCircle, Clock as ClockIcon, RefreshCw, Plus,
  Edit, Trash2, Eye, User, Briefcase, Mail, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { AddMeetingModal } from "@/components/AddMeetingModal";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  lead_id: string | null;
  created_by: string | null;
  assigned_to: string | null;
  meeting_date: string;
  duration_minutes: number;
  location: string | null;
  meeting_type: 'online' | 'in_person' | 'phone';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  lead?: {
    id: string;
    first_name: string;
    last_name: string;
    company_name: string;
    email: string;
    phone: string;
  };
  assignee?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

interface NewMeetingForm {
  title: string;
  description: string;
  lead_id: string;
  assigned_to: string;
  meeting_date: string;
  duration_minutes: number;
  location: string;
  meeting_type: 'online' | 'in_person' | 'phone';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes: string;
}

const emptyForm: NewMeetingForm = {
  title: '',
  description: '',
  lead_id: '',
  assigned_to: '',
  meeting_date: '',
  duration_minutes: 30,
  location: '',
  meeting_type: 'online',
  status: 'scheduled',
  notes: '',
};

export default function MeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState<NewMeetingForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<NewMeetingForm>>({});
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isSalesDirect = user?.role === 'sales_direct';
  const canAccess = isAdmin || isSalesDirect; // Admin LUB sales_direct

  useEffect(() => {
    if (user && canAccess) {
      fetchMeetings();
      fetchLeads();
      if (isAdmin) fetchUsers();
    }
  }, [user]);

  const fetchMeetings = async () => {
    if (!user || !canAccess) return;
    try {
      setLoading(true);
      
      let query = supabase
        .from('meetings')
        .select(`
          *,
          lead:lead_id (
            first_name,
            last_name,
            company_name,
            email,
            phone
          )
        `)
        .order('meeting_date', { ascending: true });
      
      // Jeśli NIE jest adminem (czyli jest sales_direct) - filtruj tylko swoje spotkania
      if (!isAdmin) {
        query = query.eq('assigned_to', user.id);
      }
      
      const { data: meetingsData, error: meetingsError } = await query;
      
      if (meetingsError) {
        console.error('Błąd pobierania spotkań:', meetingsError);
        throw meetingsError;
      }
      
      console.log('Pobrano spotkań:', meetingsData?.length);
      
      // Pobierz dane przypisanych użytkowników (dla admina)
      if (isAdmin && meetingsData && meetingsData.length > 0) {
        const userIds = new Set<string>();
        meetingsData.forEach(meeting => {
          if (meeting.assigned_to) userIds.add(meeting.assigned_to);
          if (meeting.created_by) userIds.add(meeting.created_by);
        });
        
        if (userIds.size > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .in('id', Array.from(userIds));
          
          if (profilesData) {
            const meetingsWithUsers = meetingsData.map(meeting => ({
              ...meeting,
              assignee: profilesData.find(p => p.id === meeting.assigned_to),
              creator: profilesData.find(p => p.id === meeting.created_by)
            }));
            setMeetings(meetingsWithUsers);
            return;
          }
        }
      }
      
      setMeetings(meetingsData || []);
      
    } catch (error) {
      console.error('Błąd pobierania spotkań:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, first_name, last_name, company_name, email, phone, status')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Błąd pobierania leadów:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('role', ['admin', 'agent_cc', 'sales_direct']);
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Błąd pobierania użytkowników:', error);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<NewMeetingForm> = {};
    if (!form.title.trim()) errors.title = 'Tytuł jest wymagany';
    if (!form.lead_id) errors.lead_id = 'Lead jest wymagany';
    if (!form.meeting_date) errors.meeting_date = 'Data i godzina są wymagane';
    if (form.duration_minutes < 1) (errors as Record<string, string>).duration_minutes = 'Czas trwania musi być większy niż 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddMeeting = async () => {
    if (!validateForm()) return;
    if (!user) return;

    try {
      setSaving(true);

      const newMeetingData: any = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        lead_id: form.lead_id,
        created_by: user.id,
        assigned_to: isAdmin && form.assigned_to ? form.assigned_to : user.id,
        meeting_date: form.meeting_date,
        duration_minutes: form.duration_minutes,
        location: form.location?.trim() || null,
        meeting_type: form.meeting_type,
        status: form.status,
        notes: form.notes?.trim() || null,
        reminder_sent: false,
      };

      const { error } = await supabase.from('meetings').insert([newMeetingData]);

      if (error) throw error;

      setIsAddOpen(false);
      setForm(emptyForm);
      setFormErrors({});
      await fetchMeetings();
      
    } catch (error: any) {
      console.error('Błąd dodawania spotkania:', error);
      alert(`Nie udało się dodać spotkania: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMeeting = async () => {
    if (!validateForm()) return;
    if (!selectedMeeting) return;

    try {
      setSaving(true);

      const updateData: any = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        lead_id: form.lead_id,
        meeting_date: form.meeting_date,
        duration_minutes: form.duration_minutes,
        location: form.location?.trim() || null,
        meeting_type: form.meeting_type,
        status: form.status,
        notes: form.notes?.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (isAdmin && form.assigned_to) {
        updateData.assigned_to = form.assigned_to;
      }

      const { error } = await supabase
        .from('meetings')
        .update(updateData)
        .eq('id', selectedMeeting.id);

      if (error) throw error;

      setIsEditOpen(false);
      setIsDetailsOpen(false);
      setForm(emptyForm);
      await fetchMeetings();
    } catch (error: any) {
      console.error('Błąd aktualizacji spotkania:', error);
      alert(`Nie udało się zaktualizować spotkania: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to spotkanie?')) return;

    try {
      const { error } = await supabase.from('meetings').delete().eq('id', id);
      if (error) throw error;
      await fetchMeetings();
      setIsDetailsOpen(false);
    } catch (error: any) {
      console.error('Błąd usuwania spotkania:', error);
      alert(`Nie udało się usunąć spotkania: ${error.message}`);
    }
  };

  const openEditModal = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setForm({
      title: meeting.title,
      description: meeting.description || '',
      lead_id: meeting.lead_id || '',
      assigned_to: meeting.assigned_to || '',
      meeting_date: meeting.meeting_date.slice(0, 16),
      duration_minutes: meeting.duration_minutes,
      location: meeting.location || '',
      meeting_type: meeting.meeting_type,
      status: meeting.status,
      notes: meeting.notes || '',
    });
    setIsEditOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; icon: any; className: string }> = {
      scheduled: { label: 'Zaplanowane', icon: ClockIcon, className: 'bg-blue-50 text-blue-700 border-blue-200' },
      confirmed: { label: 'Potwierdzone', icon: CheckCircle, className: 'bg-green-50 text-green-700 border-green-200' },
      completed: { label: 'Zrealizowane', icon: CheckCircle, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      cancelled: { label: 'Odwołane', icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' },
      rescheduled: { label: 'Przełożone', icon: RefreshCw, className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    };
    const info = statuses[status] || { label: status, icon: ClockIcon, className: 'bg-gray-50 text-gray-700 border-gray-200' };
    const Icon = info.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${info.className}`}>
        <Icon className="h-3 w-3" />
        {info.label}
      </span>
    );
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'online': return <Video className="h-4 w-4" />;
      case 'in_person': return <MapPin className="h-4 w-4" />;
      case 'phone': return <PhoneIcon className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getMeetingTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      online: 'Online',
      in_person: 'Na miejscu',
      phone: 'Telefoniczne',
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Brak daty';
    try {
      return format(new Date(dateString), 'EEEE, dd MMMM yyyy, HH:mm', { locale: pl });
    } catch {
      return new Date(dateString).toLocaleString('pl-PL');
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.lead?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.lead?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.lead?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled' || m.status === 'confirmed');
  const today = new Date().toISOString().split('T')[0];
  const todayMeetings = meetings.filter(m => m.meeting_date?.startsWith(today));

  // Jeśli nie ma dostępu - pokaż komunikat
  if (!canAccess) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="text-center p-8">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Brak dostępu</h2>
          <p className="text-muted-foreground">Ta strona jest dostępna tylko dla admina i działu sprzedaży bezpośredniej.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isAdmin ? 'Zarządzanie spotkaniami' : 'Moje spotkania'}
            </h1>
            <p className="text-blue-100 mt-1">
              {isAdmin 
                ? `Wszystkie spotkania w systemie (${meetings.length})`
                : `Twoje spotkania (${meetings.length})`}
            </p>
          </div>
          <Button
            size="sm"
            className="bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nowe spotkanie
          </Button>
        </div>
      </div>

      {/* Statystyki */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wszystkie</p>
                <p className="text-3xl font-bold">{meetings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nadchodzące</p>
                <p className="text-3xl font-bold text-green-600">{upcomingMeetings.length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dzisiaj</p>
                <p className="text-3xl font-bold text-orange-600">{todayMeetings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zrealizowane</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {meetings.filter(m => m.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wyszukiwarka */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po tytule lub leadzie..."
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
              <option value="scheduled">Zaplanowane</option>
              <option value="confirmed">Potwierdzone</option>
              <option value="completed">Zrealizowane</option>
              <option value="cancelled">Odwołane</option>
            </select>
            <Button variant="outline" onClick={fetchMeetings}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Odśwież
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista spotkań - reszta kodu podobna jak wcześniej... */}
      <Card>
        <CardHeader>
          <CardTitle>Lista spotkań</CardTitle>
          <p className="text-sm text-muted-foreground">Wyświetlam {filteredMeetings.length} z {meetings.length} spotkań</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-500" />
              <p className="text-muted-foreground">Ładowanie danych...</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Brak spotkań do wyświetlenia</p>
              <Button variant="link" onClick={() => setIsAddOpen(true)} className="mt-2">
                Utwórz pierwsze spotkanie
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMeetings.map((meeting) => (
                <Card key={meeting.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => { setSelectedMeeting(meeting); setIsDetailsOpen(true); }}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {getMeetingTypeIcon(meeting.meeting_type)}
                          <h3 className="font-semibold text-lg">{meeting.title}</h3>
                          {getStatusBadge(meeting.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(meeting.meeting_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{meeting.duration_minutes} min</span>
                          </div>
                        </div>

                        {meeting.lead && (
                          <div className="mt-3 flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>
                              <strong>Lead:</strong> {meeting.lead.first_name} {meeting.lead.last_name}
                              {meeting.lead.company_name && ` (${meeting.lead.company_name})`}
                            </span>
                          </div>
                        )}

                        {meeting.assignee && isAdmin && (
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>Przypisane do: {meeting.assignee.full_name}</span>
                          </div>
                        )}

                        {meeting.location && (
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{meeting.location}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); openEditModal(meeting); }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleDeleteMeeting(meeting.id); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Dodaj spotkanie - podobny jak wcześniej, ale z wyborem użytkownika dla admina */}
      
      <AddMeetingModal 
        isOpen={isAddOpen} 
        onOpenChange={setIsAddOpen}
        isAdmin={isAdmin}
        userId={user?.id}
        leads={leads}
        users={users}
        onSuccess={fetchMeetings} // Przekazujemy funkcję odświeżania danych
      />

      {/* Modal: Szczegóły spotkania */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Szczegóły spotkania
            </DialogTitle>
          </DialogHeader>

          {selectedMeeting && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-xl font-bold">{selectedMeeting.title}</h3>
                  {getStatusBadge(selectedMeeting.status)}
                </div>
                {selectedMeeting.description && (
                  <p className="text-muted-foreground">{selectedMeeting.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-muted-foreground text-xs">Data i godzina</Label>
                  <p className="font-medium mt-1">{formatDate(selectedMeeting.meeting_date)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-muted-foreground text-xs">Czas trwania</Label>
                  <p className="font-medium mt-1">{selectedMeeting.duration_minutes} minut</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-muted-foreground text-xs">Typ</Label>
                  <p className="font-medium mt-1">{getMeetingTypeLabel(selectedMeeting.meeting_type)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-muted-foreground text-xs">Lokalizacja</Label>
                  <p className="font-medium mt-1">{selectedMeeting.location || 'Brak'}</p>
                </div>
              </div>

              {selectedMeeting.assignee && isAdmin && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold">Przypisany sprzedawca</h4>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="font-medium">{selectedMeeting.assignee.full_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedMeeting.assignee.email}</p>
                    </div>
                  </div>
                </>
              )}

              {selectedMeeting.lead && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold">Informacje o leadzie</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="font-medium">{selectedMeeting.lead.first_name} {selectedMeeting.lead.last_name}</p>
                      {selectedMeeting.lead.company_name && (
                        <p className="text-sm text-muted-foreground">{selectedMeeting.lead.company_name}</p>
                      )}
                      <div className="flex gap-3 mt-2 text-sm">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedMeeting.lead.email}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedMeeting.notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Notatki</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedMeeting.notes}</p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Zamknij</Button>
                <Button variant="outline" onClick={() => openEditModal(selectedMeeting)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteMeeting(selectedMeeting.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Usuń
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Edytuj spotkanie - podobny do dodawania */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edytuj spotkanie</DialogTitle>
            <DialogDescription>Zaktualizuj szczegóły spotkania.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tytuł spotkania *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Lead *</Label>
              <Select value={form.lead_id} onValueChange={(v) => setForm({ ...form, lead_id: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.first_name} {lead.last_name} {lead.company_name && `(${lead.company_name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <Label>Przypisz do sprzedawcy</Label>
                <Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz sprzedawcę" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name} ({u.role === 'admin' ? 'Admin' : u.role === 'agent_cc' ? 'Agent CC' : 'Handlowiec'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data i godzina *</Label>
                <Input
                  type="datetime-local"
                  value={form.meeting_date}
                  onChange={(e) => setForm({ ...form, meeting_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Czas trwania (minuty)</Label>
                <Input
                  type="number"
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lokalizacja</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Typ spotkania</Label>
                <Select value={form.meeting_type} onValueChange={(v: any) => setForm({ ...form, meeting_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in_person">Na miejscu</SelectItem>
                    <SelectItem value="phone">Telefoniczne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Zaplanowane</SelectItem>
                  <SelectItem value="confirmed">Potwierdzone</SelectItem>
                  <SelectItem value="completed">Zrealizowane</SelectItem>
                  <SelectItem value="cancelled">Odwołane</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notatki</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Anuluj</Button>
            <Button onClick={handleUpdateMeeting} disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Zapisz zmiany'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}