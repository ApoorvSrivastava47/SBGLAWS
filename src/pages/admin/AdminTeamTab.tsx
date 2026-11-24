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
import { TEAM_CATEGORIES } from '../../types';
import type { MediaAsset, TeamCategory, TeamMember } from '../../types';

interface AdminTeamTabProps {
  allMembers: TeamMember[];
  mediaAssets: MediaAsset[];
}

interface MemberFormState {
  fullName: string;
  designation: string;
  category: TeamCategory;
  department: string;
  academicYear: string;
  responsibility: string;
  bio: string;
  photoUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  hierarchyOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}

const EMPTY_MEMBER: MemberFormState = {
  fullName: '',
  designation: '',
  category: 'Community Leadership',
  department: '',
  academicYear: '',
  responsibility: '',
  bio: '',
  photoUrl: '',
  linkedinUrl: '',
  githubUrl: '',
  hierarchyOrder: 10,
  isFeatured: false,
  isActive: true,
};

export function AdminTeamTab({ allMembers, mediaAssets }: AdminTeamTabProps) {
  const { logAdminActivity } = usePlatform();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberFormState>(EMPTY_MEMBER);
  const [saving, setSaving] = useState(false);

  const portraitAssets = mediaAssets.filter(
    (m) => m.category === 'team' || m.category === 'community'
  );

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_MEMBER);
    setModalOpen(true);
  }

  function openEdit(m: TeamMember) {
    setEditingId(m.id);
    setForm({
      fullName: m.fullName,
      designation: m.designation,
      category: m.category,
      department: m.department || '',
      academicYear: m.academicYear || '',
      responsibility: m.responsibility || '',
      bio: m.bio || '',
      photoUrl: m.photoUrl || '',
      linkedinUrl: m.linkedinUrl || '',
      githubUrl: m.githubUrl || '',
      hierarchyOrder: m.hierarchyOrder ?? 10,
      isFeatured: Boolean(m.isFeatured),
      isActive: Boolean(m.isActive),
    });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim() || !form.designation.trim()) return;

    const payload: Record<string, unknown> = {
      fullName: form.fullName.trim().slice(0, 120),
      designation: form.designation.trim().slice(0, 120),
      category: form.category,
      department: form.department.trim().slice(0, 120),
      academicYear: form.academicYear.trim().slice(0, 40),
      responsibility: form.responsibility.trim().slice(0, 300),
      bio: form.bio.trim().slice(0, 1000),
      photoUrl: form.photoUrl.trim().slice(0, 1000),
      linkedinUrl: form.linkedinUrl.trim().slice(0, 500),
      githubUrl: form.githubUrl.trim().slice(0, 500),
      hierarchyOrder: Number(form.hierarchyOrder) || 0,
      isFeatured: Boolean(form.isFeatured),
      isActive: Boolean(form.isActive),
      updatedAt: serverTimestamp(),
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'team_members', editingId), payload);
        await logAdminActivity(`Updated team member "${form.fullName.trim()}"`, 'Team');
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'team_members'), payload);
        await logAdminActivity(`Added team member "${form.fullName.trim()}"`, 'Team');
      }
      setModalOpen(false);
    } catch (err) {
      handleFirestoreError(
        err,
        editingId ? OperationType.UPDATE : OperationType.CREATE,
        'team_members'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(m: TeamMember) {
    try {
      await deleteDoc(doc(db, 'team_members', m.id));
      await logAdminActivity(`Removed team member "${m.fullName}"`, 'Team');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `team_members/${m.id}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Team Management</h2>
          <p className="text-sm text-[#08070C]/65">
            Add authentic member profiles, configure categories, reorder hierarchy, and assign photos.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#08070C] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#243A68] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {allMembers.length === 0 ? (
        <div className="border border-[#08070C]/15 bg-white p-8 text-center space-y-3">
          <p className="text-sm text-[#08070C]/70">No team profiles added yet.</p>
          <button
            type="button"
            onClick={openNew}
            className="px-4 py-2 bg-[#08070C] text-white text-xs font-mono uppercase tracking-wider cursor-pointer"
          >
            Add First Member
          </button>
        </div>
      ) : (
        <div className="border border-[#08070C]/15 bg-white overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#08070C]/15 bg-[#FAFAFC] font-mono text-[11px] uppercase tracking-wider text-[#08070C]/65">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#08070C]/10">
              {allMembers.map((m) => (
                <tr key={m.id} className="hover:bg-[#FAFAFC]">
                  <td className="py-3 px-4 font-mono text-xs tabular-nums">{m.hierarchyOrder}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold">{m.fullName}</p>
                    <p className="text-xs text-[#08070C]/65">{m.designation}</p>
                  </td>
                  <td className="py-3 px-4 text-xs">{m.category}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[#08070C]/70">
                    {[m.department, m.academicYear].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">
                    {m.isActive ? 'Active' : 'Inactive'}
                    {m.isFeatured ? ' · Featured' : ''}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openEdit(m)}
                      className="p-2 text-[#243A68] hover:text-[#08070C] cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(m)}
                      className="p-2 text-red-700 hover:text-red-900 cursor-pointer"
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#08070C]/55 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white border border-[#08070C]/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#08070C]/10 pb-4">
              <h3 className="font-display text-2xl font-bold">
                {editingId ? 'Edit Member' : 'Add Team Member'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 inline-flex items-center justify-center border border-[#08070C]/15 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as TeamCategory })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25 bg-white"
                  >
                    {TEAM_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">Hierarchy Order</label>
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    value={form.hierarchyOrder}
                    onChange={(e) => setForm({ ...form, hierarchyOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={form.academicYear}
                    onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                    placeholder="e.g. 3rd Year / Faculty"
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase mb-1">
                  Profile Photo URL
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={form.photoUrl}
                    onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                    placeholder="/uploads/... or https://..."
                    className="flex-1 px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                  {portraitAssets.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) setForm({ ...form, photoUrl: e.target.value });
                      }}
                      className="px-3 py-2 text-xs border border-[#08070C]/25 bg-white"
                    >
                      <option value="">Pick from Media Library</option>
                      {portraitAssets.map((a) => (
                        <option key={a.id} value={a.url}>
                          {a.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase mb-1">
                  Area of Responsibility
                </label>
                <input
                  type="text"
                  value={form.responsibility}
                  onChange={(e) => setForm({ ...form, responsibility: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase mb-1">Short Biography</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={form.linkedinUrl}
                    onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={form.githubUrl}
                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#08070C]/10">
                <div className="flex items-center gap-5">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span>Active Profile</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    />
                    <span>Feature on Homepage</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-[#08070C]/20 text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68] cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Member'}
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
