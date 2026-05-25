import type { Profile, Lead, Rejection } from '@/types';

export function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    email: row.email as string,
    fullName: row.full_name as string,
    role: row.role as Profile['role'],
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  };
}

export function mapLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    email: row.email as string,
    phone: row.phone as string,
    companyName: row.company_name as string,
    source: row.source as Lead['source'],
    status: row.status as Lead['status'],
    assignedTo: row.assigned_to as string | null,
    buyerId: row.buyer_id as string | null,
    consentTimestamp: row.consent_timestamp as string,
    consentText: row.consent_text as string,
    isDuplicate: row.is_duplicate as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    assignedProfile: row.profiles
      ? mapProfile(row.profiles as Record<string, unknown>)
      : undefined,
  };
}

export function mapRejection(row: Record<string, unknown>): Rejection {
  return {
    id: row.id as string,
    leadId: row.lead_id as string,
    buyerId: row.buyer_id as string,
    reason: row.reason as string,
    status: row.status as Rejection['status'],
    createdAt: row.created_at as string,
    lead: row.leads
      ? mapLead(row.leads as Record<string, unknown>)
      : undefined,
  };
}
