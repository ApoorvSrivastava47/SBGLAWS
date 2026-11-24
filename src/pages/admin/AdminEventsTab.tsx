import React, { useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { usePlatform } from '../../context/PlatformContext';
import type { CommunityEvent, CustomQuestion, MediaAsset } from '../../types';
import { computeEventStatus, formatDisplayDate, sanitizeSlug } from '../../utils/validation';

interface AdminEventsTabProps {
  allEvents: CommunityEvent[];
  mediaAssets: MediaAsset[];
}

interface EventFormState {
  title: string;
  slug: string;
  category: string;
  statusOverride: 'auto' | 'upcoming' | 'ongoing' | 'past';
  startDate: string;
  endDate: string;
  timeLabel: string;
  venue: string;
  posterUrl: string;
  shortDescription: string;
  fullDescription: string;
  instructions: string;
  highlightsText: string;
  winnersSummary: string;
  participationSummary: string;
  organisingTeamText: string;
  galleryUrlsText: string;
  eligibilityScope: 'ucer_only' | 'open_college';
  registrationMode: 'individual' | 'team' | 'both';
  maxTeamSize: number;
  requireStudentId: boolean;
  registrationOpen: boolean;
  registrationDeadline: string;
  isPublished: boolean;
  customQuestions: CustomQuestion[];
}

const EMPTY_FORM: EventFormState = {
  title: '',
  slug: '',
  category: 'Workshop',
  statusOverride: 'auto',
  startDate: '',
  endDate: '',
  timeLabel: '',
  venue: '',
  posterUrl: '',
  shortDescription: '',
  fullDescription: '',
  instructions: '',
  highlightsText: '',
  winnersSummary: '',
  participationSummary: '',
  organisingTeamText: '',
  galleryUrlsText: '',
  eligibilityScope: 'ucer_only',
  registrationMode: 'individual',
  maxTeamSize: 4,
  requireStudentId: false,
  registrationOpen: true,
  registrationDeadline: '',
  isPublished: true,
  customQuestions: [],
};

export function AdminEventsTab({ allEvents, mediaAssets }: AdminEventsTabProps) {
  const { logAdminActivity } = usePlatform();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<EventFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const posterAssets = mediaAssets.filter(
    (m) => m.category === 'event_poster' || m.category === 'community' || m.category === 'event_gallery'
  );

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrorMsg('');
    setModalOpen(true);
  }

  function openEdit(ev: CommunityEvent) {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      slug: ev.slug,
      category: ev.category,
      statusOverride: ev.statusOverride,
      startDate: ev.startDate,
      endDate: ev.endDate,
      timeLabel: ev.timeLabel || '',
      venue: ev.venue,
      posterUrl: ev.posterUrl || '',
      shortDescription: ev.shortDescription,
      fullDescription: ev.fullDescription,
      instructions: ev.instructions || '',
      highlightsText: (ev.highlights || []).join('\n'),
      winnersSummary: ev.winnersSummary || '',
      participationSummary: ev.participationSummary || '',
      organisingTeamText: (ev.organisingTeamNames || []).join(', '),
      galleryUrlsText: (ev.galleryUrls || []).join('\n'),
      eligibilityScope: ev.eligibilityScope,
      registrationMode: ev.registrationMode,
      maxTeamSize: ev.maxTeamSize || 4,
      requireStudentId: Boolean(ev.requireStudentId),
      registrationOpen: ev.registrationOpen,
      registrationDeadline: ev.registrationDeadline || '',
      isPublished: ev.isPublished,
      customQuestions: ev.customQuestions || [],
    });
    setErrorMsg('');
    setModalOpen(true);
  }

  function addCustomQuestion() {
    if (form.customQuestions.length >= 10) return;
    setForm((prev) => ({
      ...prev,
      customQuestions: [
        ...prev.customQuestions,
        {
          id: `q_${Date.now()}`,
          label: '',
          type: 'text',
          required: false,
          options: [],
        },
      ],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    if (!form.title.trim() || !form.startDate || !form.venue.trim() || !form.shortDescription.trim()) {
      setErrorMsg('Title, start date, venue, and short description are required.');
      return;
    }

    const slugVal = sanitizeSlug(form.slug || form.title);
    const highlights = form.highlightsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 15);
    const organisingTeamNames = form.organisingTeamText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
    const galleryUrls = form.galleryUrlsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
    const cleanedQuestions = form.customQuestions
      .filter((q) => q.label.trim().length > 0)
      .slice(0, 10)
      .map((q) => ({
        ...q,
        label: q.label.trim().slice(0, 160),
      }));

    const payload: Record<string, unknown> = {
      title: form.title.trim().slice(0, 160),
      slug: slugVal,
      category: form.category.trim().slice(0, 80) || 'Workshop',
      statusOverride: form.statusOverride,
      startDate: form.startDate.slice(0, 40),
      endDate: (form.endDate || form.startDate).slice(0, 40),
      timeLabel: form.timeLabel.trim().slice(0, 80),
      venue: form.venue.trim().slice(0, 200),
      posterUrl: form.posterUrl.trim().slice(0, 1000),
      shortDescription: form.shortDescription.trim().slice(0, 400),
      fullDescription: (form.fullDescription.trim() || form.shortDescription.trim()).slice(0, 5000),
      instructions: form.instructions.trim().slice(0, 2000),
      highlights,
      winnersSummary: form.winnersSummary.trim().slice(0, 1500),
      participationSummary: form.participationSummary.trim().slice(0, 400),
      organisingTeamNames,
      galleryUrls,
      eligibilityScope: form.eligibilityScope,
      registrationMode: form.registrationMode,
      maxTeamSize: Number(form.maxTeamSize) || 4,
      requireStudentId: Boolean(form.requireStudentId),
      registrationOpen: Boolean(form.registrationOpen),
      registrationDeadline: form.registrationDeadline.trim().slice(0, 40),
      customQuestions: cleanedQuestions,
      isPublished: Boolean(form.isPublished),
      updatedAt: serverTimestamp(),
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'events', editingId), payload);
        await logAdminActivity(`Updated event "${form.title.trim()}"`, 'Events');
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'events'), payload);
        await logAdminActivity(`Created event "${form.title.trim()}"`, 'Events');
      }
      setModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, 'events');
    } finally {
      setSaving(false);
    }
  }

  async function toggleRegistration(ev: CommunityEvent) {
    try {
      await updateDoc(doc(db, 'events', ev.id), {
        registrationOpen: !ev.registrationOpen,
        updatedAt: serverTimestamp(),
      });
      await logAdminActivity(
        `${!ev.registrationOpen ? 'Opened' : 'Closed'} registration for "${ev.title}"`,
        'Events'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `events/${ev.id}`);
    }
  }

  async function handleDelete(ev: CommunityEvent) {
    try {
      await deleteDoc(doc(db, 'events', ev.id));
      await logAdminActivity(`Deleted event "${ev.title}"`, 'Events');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `events/${ev.id}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Event Management</h2>
          <p className="text-sm text-[#08070C]/65">
            Create events, assign posters, configure eligibility, and manage registration windows.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#08070C] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#243A68] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
        </button>
      </div>

      {allEvents.length === 0 ? (
        <div className="border border-[#08070C]/15 bg-white p-8 text-center space-y-3">
          <p className="text-sm text-[#08070C]/70">No events created yet.</p>
          <button
            type="button"
            onClick={openNew}
            className="px-4 py-2 bg-[#08070C] text-white text-xs font-mono uppercase tracking-wider cursor-pointer"
          >
            Create First Event
          </button>
        </div>
      ) : (
        <div className="border border-[#08070C]/15 bg-white overflow-x-auto">
          <table className="w-full min-w-[680px] text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#08070C]/15 bg-[#FAFAFC] font-mono text-[11px] uppercase tracking-wider text-[#08070C]/65">
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Scope</th>
                <th className="py-3 px-4">Registrations</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#08070C]/10">
              {allEvents.map((ev) => {
                const status = computeEventStatus(ev);
                return (
                  <tr key={ev.id} className="hover:bg-[#FAFAFC]">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#08070C]">{ev.title}</p>
                      <p className="font-mono text-[11px] text-[#08070C]/55">
                        {ev.category} · {ev.isPublished ? 'Published' : 'Draft'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs tabular-nums">
                      {formatDisplayDate(ev.startDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs uppercase">{status}</td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {ev.eligibilityScope === 'ucer_only' ? 'UCER Only' : 'Open College'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleRegistration(ev)}
                        className={`px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider border cursor-pointer ${
                          ev.registrationOpen
                            ? 'border-emerald-700/30 bg-emerald-50 text-emerald-800'
                            : 'border-[#08070C]/20 bg-[#F4F4F8] text-[#08070C]/65'
                        }`}
                      >
                        {ev.registrationOpen ? 'Open' : 'Closed'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(ev)}
                        className="p-2 text-[#243A68] hover:text-[#08070C] cursor-pointer"
                        aria-label={`Edit ${ev.title}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ev)}
                        className="p-2 text-red-700 hover:text-red-900 cursor-pointer"
                        aria-label={`Delete ${ev.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Event Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#08070C]/55 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white border border-[#08070C]/20 w-full max-w-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#08070C]/10 pb-4">
              <h3 className="font-display text-2xl font-bold">
                {editingId ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 inline-flex items-center justify-center border border-[#08070C]/15 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated-from-title"
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Workshop, Hackathon, Summit..."
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">Status Override</label>
                  <select
                    value={form.statusOverride}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        statusOverride: e.target.value as EventFormState['statusOverride'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25 bg-white"
                  >
                    <option value="auto">Automatic (By Date)</option>
                    <option value="upcoming">Force Upcoming</option>
                    <option value="ongoing">Force Ongoing</option>
                    <option value="past">Archive (Past)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">Time Label</label>
                  <input
                    type="text"
                    value={form.timeLabel}
                    onChange={(e) => setForm({ ...form, timeLabel: e.target.value })}
                    placeholder="e.g. 10:00 AM – 01:00 PM"
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="e.g. Auditorium, UCER"
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
              </div>

              {/* Poster URL & Media Picker */}
              <div className="space-y-2">
                <label className="block font-mono text-xs uppercase">Event Poster URL</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={form.posterUrl}
                    onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
                    placeholder="/uploads/... or https://..."
                    className="flex-1 px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                  {posterAssets.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) setForm({ ...form, posterUrl: e.target.value });
                      }}
                      className="px-3 py-2 text-xs border border-[#08070C]/25 bg-white"
                    >
                      <option value="">Pick from Media Library</option>
                      {posterAssets.map((a) => (
                        <option key={a.id} value={a.url}>
                          {a.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase mb-1">Short Description *</label>
                <textarea
                  rows={2}
                  required
                  maxLength={400}
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase mb-1">Full Description</label>
                <textarea
                  rows={4}
                  maxLength={5000}
                  value={form.fullDescription}
                  onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase mb-1">
                  Important Instructions
                </label>
                <textarea
                  rows={2}
                  maxLength={2000}
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                />
              </div>

              {/* Registration Config */}
              <div className="p-4 border border-[#08070C]/15 bg-[#FAFAFC] space-y-4">
                <p className="font-mono text-xs uppercase tracking-wider text-[#243A68] font-semibold">
                  Registration Configuration
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] uppercase mb-1">
                      Eligibility Scope
                    </label>
                    <select
                      value={form.eligibilityScope}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          eligibilityScope: e.target.value as 'ucer_only' | 'open_college',
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#08070C]/25 bg-white"
                    >
                      <option value="ucer_only">UCER Students Only</option>
                      <option value="open_college">Open to All Colleges</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase mb-1">
                      Participation Mode
                    </label>
                    <select
                      value={form.registrationMode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          registrationMode: e.target.value as 'individual' | 'team' | 'both',
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-[#08070C]/25 bg-white"
                    >
                      <option value="individual">Individual</option>
                      <option value="team">Team Only</option>
                      <option value="both">Individual or Team</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase mb-1">
                      Max Team Size
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={form.maxTeamSize}
                      onChange={(e) => setForm({ ...form, maxTeamSize: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-[#08070C]/25 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase mb-1">
                      Registration Deadline
                    </label>
                    <input
                      type="date"
                      value={form.registrationDeadline}
                      onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#08070C]/25 bg-white"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm pt-5">
                    <input
                      type="checkbox"
                      checked={form.requireStudentId}
                      onChange={(e) => setForm({ ...form, requireStudentId: e.target.checked })}
                    />
                    <span>Require Student ID</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm pt-5">
                    <input
                      type="checkbox"
                      checked={form.registrationOpen}
                      onChange={(e) => setForm({ ...form, registrationOpen: e.target.checked })}
                    />
                    <span>Registrations Open</span>
                  </label>
                </div>

                {/* Custom Questions */}
                <div className="pt-2 border-t border-[#08070C]/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase text-[#08070C]/70">
                      Custom Registration Questions
                    </span>
                    <button
                      type="button"
                      onClick={addCustomQuestion}
                      className="px-3 py-1 border border-[#08070C]/25 text-xs font-mono uppercase cursor-pointer bg-white"
                    >
                      + Add Question
                    </button>
                  </div>
                  {form.customQuestions.map((q, idx) => (
                    <div key={q.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Question label"
                        value={q.label}
                        onChange={(e) => {
                          const next = [...form.customQuestions];
                          next[idx] = { ...q, label: e.target.value };
                          setForm({ ...form, customQuestions: next });
                        }}
                        className="sm:col-span-6 px-2.5 py-1.5 text-sm border border-[#08070C]/20 bg-white"
                      />
                      <select
                        value={q.type}
                        onChange={(e) => {
                          const next = [...form.customQuestions];
                          next[idx] = { ...q, type: e.target.value as CustomQuestion['type'] };
                          setForm({ ...form, customQuestions: next });
                        }}
                        className="sm:col-span-3 px-2.5 py-1.5 text-sm border border-[#08070C]/20 bg-white"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                      </select>
                      <label className="sm:col-span-2 flex items-center gap-1.5 text-xs">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => {
                            const next = [...form.customQuestions];
                            next[idx] = { ...q, required: e.target.checked };
                            setForm({ ...form, customQuestions: next });
                          }}
                        />
                        <span>Req</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            customQuestions: form.customQuestions.filter((_, i) => i !== idx),
                          })
                        }
                        className="sm:col-span-1 text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Archive / Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">
                    Highlights (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={form.highlightsText}
                    onChange={(e) => setForm({ ...form, highlightsText: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">
                    Organising Team (Comma separated)
                  </label>
                  <textarea
                    rows={3}
                    value={form.organisingTeamText}
                    onChange={(e) => setForm({ ...form, organisingTeamText: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">
                    Participation Summary (Past Archive)
                  </label>
                  <input
                    type="text"
                    value={form.participationSummary}
                    onChange={(e) => setForm({ ...form, participationSummary: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">
                    Winners &amp; Outcomes (Past Archive)
                  </label>
                  <input
                    type="text"
                    value={form.winnersSummary}
                    onChange={(e) => setForm({ ...form, winnersSummary: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-mono text-xs uppercase mb-1">
                    Gallery Image URLs (One per line)
                  </label>
                  <textarea
                    rows={2}
                    value={form.galleryUrlsText}
                    onChange={(e) => setForm({ ...form, galleryUrlsText: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#08070C]/10">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  />
                  <span>Publish visibly on public website</span>
                </label>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 sm:py-2 border border-[#08070C]/20 text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 sm:py-2 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68] disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Event'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
