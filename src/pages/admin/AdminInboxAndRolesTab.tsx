import React, { useState } from 'react';
import { deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Trash2, UserPlus } from 'lucide-react';
import {
  BOOTSTRAPPED_SUPER_ADMIN,
  db,
  handleFirestoreError,
  OperationType,
} from '../../firebase';
import { usePlatform } from '../../context/PlatformContext';
import type { AdminAccount, AdminRole, ContactMessage } from '../../types';
import { EMAIL_REGEX, formatFirestoreTimestamp } from '../../utils/validation';

export function AdminInboxTab({ messages }: { messages: ContactMessage[] }) {
  const { logAdminActivity } = usePlatform();

  async function updateStatus(msg: ContactMessage, status: ContactMessage['status']) {
    try {
      await updateDoc(doc(db, 'contact_messages', msg.id), { status });
      await logAdminActivity(`Marked inquiry "${msg.subject}" as ${status}`, 'Inbox');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `contact_messages/${msg.id}`);
    }
  }

  async function removeMsg(id: string) {
    try {
      await deleteDoc(doc(db, 'contact_messages', id));
      await logAdminActivity('Deleted contact inquiry', 'Inbox');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `contact_messages/${id}`);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Contact Inquiries</h2>
        <p className="text-sm text-[#08070C]/65">
          Messages submitted through the public Contact Us page.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="border border-[#08070C]/15 bg-white p-8 text-center text-sm text-[#08070C]/65">
          No contact inquiries received yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <article key={m.id} className="border border-[#08070C]/15 bg-white p-6 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-[#243A68]">
                    {m.name} ({m.email}) · {formatFirestoreTimestamp(m.createdAt)}
                  </p>
                  <h3 className="font-display text-lg font-bold mt-1">{m.subject}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={m.status}
                    onChange={(e) =>
                      updateStatus(m, e.target.value as ContactMessage['status'])
                    }
                    className="px-2.5 py-1 text-xs font-mono border border-[#08070C]/20 bg-white"
                  >
                    <option value="new">new</option>
                    <option value="reviewed">reviewed</option>
                    <option value="resolved">resolved</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeMsg(m.id)}
                    className="p-2 text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-[#08070C]/80 whitespace-pre-line">{m.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminRolesTab({ admins }: { admins: AdminAccount[] }) {
  const { user, logAdminActivity } = usePlatform();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<AdminRole>('event_admin');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please enter a valid Google account email.');
      return;
    }
    if (!displayName.trim()) {
      setErrorMsg('Please enter the administrator display name.');
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, 'admins', cleanEmail), {
        email: cleanEmail,
        displayName: displayName.trim().slice(0, 120),
        role,
        isActive: true,
        addedBy: user?.email?.toLowerCase() || BOOTSTRAPPED_SUPER_ADMIN,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await logAdminActivity(`Granted ${role} access to ${cleanEmail}`, 'Admin Roles');
      setEmail('');
      setDisplayName('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `admins/${cleanEmail}`);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(adm: AdminAccount) {
    try {
      await updateDoc(doc(db, 'admins', adm.id), {
        isActive: !adm.isActive,
        updatedAt: serverTimestamp(),
      });
      await logAdminActivity(
        `${!adm.isActive ? 'Activated' : 'Deactivated'} admin ${adm.email}`,
        'Admin Roles'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `admins/${adm.id}`);
    }
  }

  async function updateRole(adm: AdminAccount, nextRole: AdminRole) {
    try {
      await updateDoc(doc(db, 'admins', adm.id), {
        role: nextRole,
        updatedAt: serverTimestamp(),
      });
      await logAdminActivity(`Changed role of ${adm.email} to ${nextRole}`, 'Admin Roles');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `admins/${adm.id}`);
    }
  }

  async function deleteAdmin(adm: AdminAccount) {
    if (adm.email.toLowerCase() === BOOTSTRAPPED_SUPER_ADMIN) return;
    try {
      await deleteDoc(doc(db, 'admins', adm.id));
      await logAdminActivity(`Removed admin ${adm.email}`, 'Admin Roles');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `admins/${adm.id}`);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Administrator Roles &amp; Permissions
        </h2>
        <p className="text-sm text-[#08070C]/65">
          Manage Google-authenticated administrator access across Super Admin, Event, Content, and
          Team roles.
        </p>
      </div>

      <form
        onSubmit={handleAddAdmin}
        className="border border-[#08070C]/15 bg-white p-6 space-y-4"
      >
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-sm">
            {errorMsg}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Google Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lead@gmail.com"
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Name *</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Administrator name"
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Assigned Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25 bg-white"
            >
              <option value="super_admin">Super Admin (Full Access)</option>
              <option value="event_admin">Event Administrator</option>
              <option value="content_admin">Content Administrator</option>
              <option value="team_admin">Team Administrator</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#08070C] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#243A68] cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{saving ? 'Adding...' : 'Authorize Administrator'}</span>
        </button>
      </form>

      <div className="border border-[#08070C]/15 bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#08070C]/15 bg-[#FAFAFC] font-mono text-[11px] uppercase tracking-wider text-[#08070C]/65">
              <th className="py-3 px-4">Administrator</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#08070C]/10">
            <tr className="bg-[#E4D5FF]/20">
              <td className="py-3 px-4">
                <p className="font-semibold">Bootstrapped Technical Lead</p>
                <p className="font-mono text-xs text-[#243A68]">{BOOTSTRAPPED_SUPER_ADMIN}</p>
              </td>
              <td className="py-3 px-4 font-mono text-xs uppercase">super_admin (Primary)</td>
              <td className="py-3 px-4 font-mono text-xs">Active</td>
              <td className="py-3 px-4 text-right font-mono text-xs text-[#08070C]/50">
                Protected
              </td>
            </tr>
            {admins
              .filter((a) => a.email.toLowerCase() !== BOOTSTRAPPED_SUPER_ADMIN)
              .map((adm) => (
                <tr key={adm.id}>
                  <td className="py-3 px-4">
                    <p className="font-semibold">{adm.displayName}</p>
                    <p className="font-mono text-xs text-[#08070C]/60">{adm.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={adm.role}
                      onChange={(e) => updateRole(adm, e.target.value as AdminRole)}
                      className="px-2 py-1 text-xs font-mono border border-[#08070C]/20 bg-white"
                    >
                      <option value="super_admin">super_admin</option>
                      <option value="event_admin">event_admin</option>
                      <option value="content_admin">content_admin</option>
                      <option value="team_admin">team_admin</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleActive(adm)}
                      className="px-2.5 py-1 text-xs font-mono uppercase border border-[#08070C]/20 cursor-pointer"
                    >
                      {adm.isActive ? 'Active' : 'Suspended'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => deleteAdmin(adm)}
                      className="p-2 text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
