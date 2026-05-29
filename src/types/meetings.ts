export interface Meeting {
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
  // Relacje (dołączane ręcznie)
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
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

export interface NewMeetingForm {
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