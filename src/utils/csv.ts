import type { EventRegistration } from '../types';
import { formatFirestoreTimestamp } from './validation';

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportRegistrationsToCsv(
  registrations: EventRegistration[],
  filenamePrefix = 'aws-sbg-ucer-registrations'
): void {
  const headers = [
    'Registration Code',
    'Event Title',
    'Status',
    'Registration Type',
    'Full Name',
    'College Email',
    'Contact Number',
    'College Name',
    'Department',
    'Academic Year',
    'Student ID',
    'Team Name',
    'Team Members',
    'Custom Answers',
    'Submitted At',
  ];

  const rows = registrations.map((reg) => {
    const teamMembersSummary = (reg.teamMembers || [])
      .map((m) => `${m.name} (${m.email}, ${m.department} ${m.academicYear})`)
      .join(' | ');
    const answersSummary = (reg.customAnswers || [])
      .map((a) => `${a.questionLabel}: ${a.answer}`)
      .join(' | ');

    return [
      reg.registrationCode,
      reg.eventTitle,
      reg.status,
      reg.registrationType,
      reg.fullName,
      reg.collegeEmail,
      reg.contactNumber,
      reg.collegeName,
      reg.department,
      reg.academicYear,
      reg.studentId || '',
      reg.teamName || '',
      teamMembersSummary,
      answersSummary,
      formatFirestoreTimestamp(reg.createdAt),
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  const csvContent = [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
