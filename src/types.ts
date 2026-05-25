export type UserRole = 'admin' | 'agent_cc' | 'sales_direct' | 'buyer';
export type LeadSource = 'web' | 'call_center' | 'sales_direct';
export type LeadStatus = 'pending_cc' | 'pending_direct' | 'new_web' | 'approved' | 'rejected';
export type RejectionStatus = 'pending' | 'accepted' | 'declined';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  password: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  source: LeadSource;
  status: LeadStatus;
  assignedTo: string | null;
  buyerId: string | null;
  consentTimestamp: string;
  consentText: string;
  isDuplicate: boolean;
  createdAt: string;
  updatedAt: string;
  assignedProfile?: Profile;
}

export interface Rejection {
  id: string;
  leadId: string;
  buyerId: string;
  reason: string;
  status: RejectionStatus;
  createdAt: string;
  lead?: Lead;
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new_web: 'Nowy (WWW)',
  pending_cc: 'W kolejce CC',
  pending_direct: 'Handlowiec',
  approved: 'Zatwierdzony',
  rejected: 'Reklamacja',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  agent_cc: 'Konsultant CC',
  sales_direct: 'Handlowiec',
  buyer: 'Kupujący',
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  web: 'Formularz WWW',
  call_center: 'Call Center',
  sales_direct: 'Sprzedaż Bezpośrednia',
};
