import type { CommunityEvent } from '../types';

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;
export const ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export function sanitizeSlug(input: string): string {
  const cleaned = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return cleaned || `event-${Date.now()}`;
}

export function normalizeEmailKey(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

export function buildRegistrationLockId(eventId: string, email: string): string {
  return `${eventId}__${normalizeEmailKey(email)}`.slice(0, 300);
}

export function generateRegistrationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `UCER-AWS-${suffix}`;
}

export function computeEventStatus(event: Pick<CommunityEvent, 'statusOverride' | 'startDate' | 'endDate'>): 'upcoming' | 'ongoing' | 'past' {
  if (event.statusOverride && event.statusOverride !== 'auto') {
    return event.statusOverride;
  }
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const start = (event.startDate || '').slice(0, 10);
  const end = (event.endDate || event.startDate || '').slice(0, 10);

  if (end && end < todayStr) {
    return 'past';
  }
  if (start && start <= todayStr && (!end || end >= todayStr)) {
    return 'ongoing';
  }
  return 'upcoming';
}

export function isDeadlinePassed(deadline?: string): boolean {
  if (!deadline || !deadline.trim()) return false;
  const parsed = new Date(deadline.includes('T') ? deadline : `${deadline}T23:59:59`);
  if (Number.isNaN(parsed.getTime())) return false;
  return Date.now() > parsed.getTime();
}

export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return 'TBA';
  const parsed = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function isValidHttpOrLocalUrl(url?: string): boolean {
  if (!url || !url.trim()) return true;
  if (url.startsWith('/uploads/') || url.startsWith('/assets/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function formatFirestoreTimestamp(ts: unknown): string {
  if (!ts) return '—';
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    return (ts as { toDate: () => Date }).toDate().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return '—';
}
