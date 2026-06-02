// AddMeetingModal.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from "react-router-dom";

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

interface AddMeetingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  userId: string | undefined;
  leads: any[];
  users: any[];
  onSuccess: () => Promise<void>;
}

export function AddMeetingModal({
  isOpen,
  onOpenChange,
  isAdmin,
  userId,
  leads,
  users,
  onSuccess
}: AddMeetingModalProps) {
  const [form, setForm] = useState<NewMeetingForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<NewMeetingForm>>({});
  const [saving, setSaving] = useState(false);

  const validateForm = (): boolean => {
    const errors: Partial<NewMeetingForm> = {};
    if (!form.title.trim()) errors.title = 'Tytuł jest wymagany';
    if (!form.lead_id) errors.lead_id = 'Lead jest wymagany';
    if (!form.meeting_date) errors.meeting_date = 'Data i godzina są wymagane';
    if (form.duration_minutes < 1) (errors as Record<string, string>).duration_minutes = 'Czas trwania musi być większy niż 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const navigate = useNavigate();

  const handleAddMeeting = async () => {
    if (!validateForm() || !userId) return;

    try {
      setSaving(true);

      const newMeetingData: any = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        lead_id: form.lead_id,
        created_by: userId,
        assigned_to: isAdmin && form.assigned_to ? form.assigned_to : userId,
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

      onOpenChange(false);
      setForm(emptyForm);
      setFormErrors({});
      await onSuccess();
      
    } catch (error: any) {
      console.error('Błąd dodawania spotkania:', error);
      alert(`Nie udało się dodać spotkania: ${error.message}`);
    } finally {
      setSaving(false);
      navigate("/meetings");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nowe spotkanie</DialogTitle>
          <DialogDescription>Zaplanuj nowe spotkanie z leadem.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tytuł spotkania *</Label>
            <Input
              placeholder="Np. Prezentacja oferty"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label>Opis</Label>
            <Textarea
              placeholder="Szczegóły spotkania..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Lead *</Label>
            <Select value={form.lead_id} onValueChange={(v) => setForm({ ...form, lead_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz leada" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.first_name} {lead.last_name} {lead.company_name && `(${lead.company_name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.lead_id && <p className="text-xs text-red-500">{formErrors.lead_id}</p>}
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
              {formErrors.meeting_date && <p className="text-xs text-red-500">{formErrors.meeting_date}</p>}
            </div>

            <div className="space-y-2">
              <Label>Czas trwania (minuty)</Label>
              <Input
                type="number"
                min="5"
                step="5"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lokalizacja</Label>
              <Input
                placeholder="Np. Zoom, biuro, telefon..."
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Typ spotkania</Label>
              <Select value={form.meeting_type} onValueChange={(v: any) => setForm({ ...form, meeting_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <SelectTrigger><SelectValue /></SelectTrigger>
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
              placeholder="Dodatkowe uwagi..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Anuluj</Button>
          <Button onClick={handleAddMeeting} disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Utwórz spotkanie'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}