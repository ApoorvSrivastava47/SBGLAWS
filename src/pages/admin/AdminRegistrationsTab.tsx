import { useMemo, useState } from 'react';
import { deleteDoc, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { Download, Search, Trash2, Eye, X } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { usePlatform } from '../../context/PlatformContext';
import type { CommunityEvent, EventRegistration } from '../../types';
import { exportRegistrationsToCsv } from '../../utils/csv';
import { formatFirestoreTimestamp } from '../../utils/validation';

interface AdminRegistrationsTabProps {
  registrations: EventRegistration[];
  allEvents: CommunityEvent[];
}

export function AdminRegistrationsTab({
  registrations,
  allEvents,
}: AdminRegistrationsTabProps) {
  const { logAdminActivity } = usePlatform();
  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailReg, setDetailReg] = useState<EventRegistration | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return registrations.filter((reg) => {
      if (eventFilter !== 'all' && reg.eventId !== eventFilter) return false;
      if (statusFilter !== 'all' && reg.status !== statusFilter) return false;
      if (!q) return true;
      return (
        reg.fullName.toLowerCase().includes(q) ||
        reg.collegeEmail.toLowerCase().includes(q) ||
        reg.registrationCode.toLowerCase().includes(q) ||
        (reg.teamName || '').toLowerCase().includes(q) ||
        reg.department.toLowerCase().includes(q)
      );
    });
  }, [registrations, eventFilter, statusFilter, searchQuery]);

  async function updateStatus(reg: EventRegistration, nextStatus: EventRegistration['status']) {
    try {
      await updateDoc(doc(db, 'registrations', reg.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      await logAdminActivity(
        `Updated registration ${reg.registrationCode} to ${nextStatus}`,
        'Registrations'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `registrations/${reg.id}`);
    }
  }

  async function handleDelete(reg: EventRegistration) {
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'registrations', reg.id));
      if (reg.lockId) {
        batch.delete(doc(db, 'registration_locks', reg.lockId));
      }
      await batch.commit();
      await logAdminActivity(
        `Deleted registration ${reg.registrationCode} (${reg.collegeEmail})`,
        'Registrations'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `registrations/${reg.id}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Registration Management
          </h2>
          <p className="text-sm text-[#08070C]/65">
            Search participants, inspect team rosters, update status, and export CSV records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportRegistrationsToCsv(filtered)}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#08070C] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#243A68] disabled:opacity-40 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV ({filtered.length})</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white border border-[#08070C]/15 p-4">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-[#08070C]/45 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, code, team..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#08070C]/20"
          />
        </div>
        <div className="md:col-span-4">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#08070C]/20 bg-white"
          >
            <option value="all">All Events</option>
            {allEvents.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#08070C]/20 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-[#08070C]/15 bg-white p-8 text-center text-sm text-[#08070C]/65">
          No registrations match the current filters.
        </div>
      ) : (
        <div className="border border-[#08070C]/15 bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#08070C]/15 bg-[#FAFAFC] font-mono text-[11px] uppercase tracking-wider text-[#08070C]/65">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#08070C]/10">
              {filtered.map((reg) => (
                <tr key={reg.id} className="hover:bg-[#FAFAFC]">
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-[#243A68] tabular-nums">
                    {reg.registrationCode}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium">{reg.fullName}</p>
                    <p className="font-mono text-[11px] text-[#08070C]/55">{reg.collegeEmail}</p>
                  </td>
                  <td className="py-3 px-4 text-xs">{reg.eventTitle}</td>
                  <td className="py-3 px-4 font-mono text-xs capitalize">
                    {reg.registrationType}
                    {reg.teamName ? ` (${reg.teamName})` : ''}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={reg.status}
                      onChange={(e) =>
                        updateStatus(reg, e.target.value as EventRegistration['status'])
                      }
                      className="px-2 py-1 text-xs font-mono border border-[#08070C]/20 bg-white"
                    >
                      <option value="confirmed">confirmed</option>
                      <option value="waitlisted">waitlisted</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setDetailReg(reg)}
                      className="p-2 text-[#243A68] hover:text-[#08070C] cursor-pointer"
                      aria-label="View registration details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(reg)}
                      className="p-2 text-red-700 hover:text-red-900 cursor-pointer"
                      aria-label="Delete registration"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailReg && (
        <div className="fixed inset-0 z-50 bg-[#08070C]/55 flex items-center justify-center p-4">
          <div className="bg-white border border-[#08070C]/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between border-b border-[#08070C]/10 pb-4">
              <div>
                <p className="font-mono text-xs text-[#243A68]">{detailReg.registrationCode}</p>
                <h3 className="font-display text-2xl font-bold">{detailReg.fullName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailReg(null)}
                className="w-9 h-9 inline-flex items-center justify-center border border-[#08070C]/15 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-mono text-[11px] uppercase text-[#08070C]/55">Event</p>
                <p className="font-medium">{detailReg.eventTitle}</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase text-[#08070C]/55">Submitted</p>
                <p className="font-mono text-xs">{formatFirestoreTimestamp(detailReg.createdAt)}</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase text-[#08070C]/55">Email</p>
                <p>{detailReg.collegeEmail}</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase text-[#08070C]/55">Phone</p>
                <p>{detailReg.contactNumber}</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase text-[#08070C]/55">College</p>
                <p>{detailReg.collegeName}</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase text-[#08070C]/55">
                  Department &amp; Year
                </p>
                <p>
                  {detailReg.department} · {detailReg.academicYear}
                </p>
              </div>
              {detailReg.studentId && (
                <div>
                  <p className="font-mono text-[11px] uppercase text-[#08070C]/55">Student ID</p>
                  <p className="font-mono">{detailReg.studentId}</p>
                </div>
              )}
            </div>

            {detailReg.registrationType === 'team' && (
              <div className="pt-4 border-t border-[#08070C]/10 space-y-2">
                <p className="font-mono text-xs uppercase text-[#243A68]">
                  Team: {detailReg.teamName}
                </p>
                {(detailReg.teamMembers || []).map((m, idx) => (
                  <p key={idx} className="text-sm text-[#08070C]/80">
                    {idx + 2}. {m.name} — {m.email} ({m.department}, {m.academicYear})
                  </p>
                ))}
              </div>
            )}

            {detailReg.customAnswers && detailReg.customAnswers.length > 0 && (
              <div className="pt-4 border-t border-[#08070C]/10 space-y-2">
                <p className="font-mono text-xs uppercase text-[#243A68]">Custom Responses</p>
                {detailReg.customAnswers.map((a, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium">{a.questionLabel}</p>
                    <p className="text-[#08070C]/75">{a.answer || '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
