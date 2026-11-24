import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Users,
  FileEdit,
  Image as ImageIcon,
  Inbox,
  Shield,
  LogOut,
  Lock,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { usePlatform } from '../../context/PlatformContext';
import type {
  ActivityLog,
  AdminAccount,
  Announcement,
  CommunityEvent,
  ContactMessage,
  EventRegistration,
  MediaAsset,
  Milestone,
  TeamMember,
} from '../../types';
import { PageMeta } from '../../components/PageMeta';
import { computeEventStatus, formatFirestoreTimestamp } from '../../utils/validation';
import { AdminEventsTab } from './AdminEventsTab';
import { AdminRegistrationsTab } from './AdminRegistrationsTab';
import { AdminTeamTab } from './AdminTeamTab';
import { AdminContentTab } from './AdminContentTab';
import { AdminMediaTab } from './AdminMediaTab';
import { AdminInboxTab, AdminRolesTab } from './AdminInboxAndRolesTab';

type AdminTab =
  | 'overview'
  | 'events'
  | 'registrations'
  | 'team'
  | 'content'
  | 'media'
  | 'inbox'
  | 'roles';

export function AdminDashboardPage() {
  const {
    user,
    authReady,
    isAdmin,
    adminRole,
    adminChecked,
    signInWithGoogle,
    signOut,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [authError, setAuthError] = useState('');

  const [allEvents, setAllEvents] = useState<CommunityEvent[]>([]);
  const [allMembers, setAllMembers] = useState<TeamMember[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [allMilestones, setAllMilestones] = useState<Milestone[]>([]);
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);

  const canManageEvents = adminRole === 'super_admin' || adminRole === 'event_admin';
  const canManageTeam = adminRole === 'super_admin' || adminRole === 'team_admin';
  const canManageContent = adminRole === 'super_admin' || adminRole === 'content_admin';
  const isSuper = adminRole === 'super_admin';

  // Attach admin listeners ONLY when authenticated and verified admin
  useEffect(() => {
    if (!authReady || !adminChecked || !isAdmin) return;

    const unsubs: (() => void)[] = [];

    unsubs.push(
      onSnapshot(
        collection(db, 'events'),
        (snap) => {
          const items = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<CommunityEvent, 'id'>),
          }));
          items.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
          setAllEvents(items);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'events')
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'team_members'),
        (snap) => {
          const items = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<TeamMember, 'id'>),
          }));
          items.sort((a, b) => (a.hierarchyOrder ?? 999) - (b.hierarchyOrder ?? 999));
          setAllMembers(items);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'team_members')
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'media_assets'),
        (snap) => {
          setMediaAssets(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MediaAsset, 'id'>) }))
          );
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'media_assets')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'milestones'), orderBy('sortOrder', 'asc')),
        (snap) => {
          setAllMilestones(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Milestone, 'id'>) }))
          );
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'milestones')
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'announcements'),
        (snap) => {
          setAllAnnouncements(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Announcement, 'id'>) }))
          );
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'announcements')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc')),
        (snap) => {
          setContactMessages(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) }))
          );
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'contact_messages')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'activity_logs'), orderBy('createdAt', 'desc')),
        (snap) => {
          setActivityLogs(
            snap.docs
              .slice(0, 12)
              .map((d) => ({ id: d.id, ...(d.data() as Omit<ActivityLog, 'id'>) }))
          );
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'activity_logs')
      )
    );

    if (canManageEvents) {
      unsubs.push(
        onSnapshot(
          query(collection(db, 'registrations'), orderBy('createdAt', 'desc')),
          (snap) => {
            setRegistrations(
              snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<EventRegistration, 'id'>),
              }))
            );
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'registrations')
        )
      );
    }

    if (isSuper) {
      unsubs.push(
        onSnapshot(
          collection(db, 'admins'),
          (snap) => {
            setAdminAccounts(
              snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdminAccount, 'id'>) }))
            );
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'admins')
        )
      );
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [authReady, adminChecked, isAdmin, canManageEvents, isSuper]);

  async function handleLogin() {
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch {
      setAuthError('Google Sign-In was cancelled or blocked. Please allow popups and try again.');
    }
  }

  // Loading state
  if (!authReady || (user && !adminChecked)) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#FAFAFC]">
        <p className="font-mono text-xs uppercase tracking-wider text-[#243A68]">
          Verifying administrator session...
        </p>
      </div>
    );
  }

  // Unauthenticated gate
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#FAFAFC] px-4 py-16">
        <PageMeta
          title="Admin Sign-In"
          description="Protected administrator portal for AWS Student Builder Group – UCER."
        />
        <div className="max-w-md w-full bg-white border border-[#08070C]/15 p-8 sm:p-10 space-y-6">
          <div className="w-10 h-10 bg-[#E4D5FF] border border-[#08070C]/15 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#08070C]" />
          </div>
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-widest text-[#243A68]">
              Protected Console
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Administrator Sign-In
            </h1>
            <p className="text-sm text-[#08070C]/70 leading-relaxed">
              Sign in with an authorised Google account to manage events, registrations, team
              profiles, media assets, and site content.
            </p>
          </div>
          {authError && (
            <p className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs">{authError}</p>
          )}
          <button
            type="button"
            onClick={handleLogin}
            className="w-full py-3.5 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68] transition-colors cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Unauthorized user gate
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#FAFAFC] px-4 py-16">
        <PageMeta title="Access Restricted" description="Administrator access required." />
        <div className="max-w-lg w-full bg-white border border-[#08070C]/15 p-8 sm:p-10 space-y-5">
          <p className="font-mono text-xs uppercase tracking-widest text-red-700">
            Access Denied
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Account Not Authorised
          </h1>
          <p className="text-sm text-[#08070C]/75 leading-relaxed">
            You are signed in as <span className="font-mono font-semibold">{user.email}</span>,
            which is not listed in the active administrator allowlist. Contact the Super Admin to
            request role access.
          </p>
          <button
            type="button"
            onClick={() => signOut()}
            className="px-5 py-2.5 border border-[#08070C]/25 text-sm font-medium hover:border-[#08070C] cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const upcomingCount = allEvents.filter((e) => computeEventStatus(e) === 'upcoming').length;

  const navItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard; visible: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, visible: true },
    { id: 'events', label: 'Events', icon: Calendar, visible: canManageEvents },
    { id: 'registrations', label: 'Registrations', icon: ClipboardList, visible: canManageEvents },
    { id: 'team', label: 'Team', icon: Users, visible: canManageTeam },
    { id: 'content', label: 'Content & Journey', icon: FileEdit, visible: canManageContent },
    { id: 'media', label: 'Media Library', icon: ImageIcon, visible: true },
    { id: 'inbox', label: 'Contact Inbox', icon: Inbox, visible: true },
    { id: 'roles', label: 'Admin Roles', icon: Shield, visible: isSuper },
  ];

  return (
    <div className="bg-[#FAFAFC] text-[#08070C] min-h-[82vh]">
      <PageMeta
        title="Admin Dashboard"
        description="Administrator management console for AWS Student Builder Group – UCER."
      />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-4 min-w-0">
          <div className="bg-white border border-[#08070C]/15 p-4 sm:p-5 flex flex-row lg:flex-col items-center lg:items-stretch justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#243A68] truncate">
                Signed In · {adminRole?.replace('_', ' ')}
              </p>
              <p className="text-sm font-semibold truncate">{user.displayName || user.email}</p>
              <p className="font-mono text-xs text-[#08070C]/60 truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 py-2 lg:py-0 lg:pt-2 text-xs font-mono uppercase tracking-wider text-red-700 hover:text-red-900 shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <nav
            className="bg-white border border-[#08070C]/15 p-1.5 lg:p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible"
            aria-label="Admin sections"
          >
            {navItems
              .filter((item) => item.visible)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`lg:w-full flex items-center gap-2.5 lg:gap-3 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-left whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-[#E4D5FF] text-[#08070C]'
                        : 'text-[#08070C]/75 hover:bg-[#FAFAFC] hover:text-[#08070C]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </nav>
        </aside>

        {/* Main Workspace */}
        <main className="lg:col-span-9 min-w-0">
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                  Dashboard Overview
                </h1>
                <p className="text-sm text-[#08070C]/65">
                  Real-time operational metrics across events, community profiles, and registrations.
                </p>
              </div>

              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white border border-[#08070C]/15 p-4 sm:p-5">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/60">
                    Team Profiles
                  </p>
                  <p className="font-display text-2xl sm:text-3xl font-bold tabular-nums mt-2">
                    {allMembers.length}
                  </p>
                </div>
                <div className="bg-white border border-[#08070C]/15 p-4 sm:p-5">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/60">
                    Total Events
                  </p>
                  <p className="font-display text-2xl sm:text-3xl font-bold tabular-nums mt-2">
                    {allEvents.length}
                  </p>
                </div>
                <div className="bg-white border border-[#08070C]/15 p-4 sm:p-5">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/60">
                    Upcoming Events
                  </p>
                  <p className="font-display text-2xl sm:text-3xl font-bold tabular-nums mt-2">
                    {upcomingCount}
                  </p>
                </div>
                <div className="bg-white border border-[#08070C]/15 p-4 sm:p-5">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/60">
                    Registrations
                  </p>
                  <p className="font-display text-2xl sm:text-3xl font-bold tabular-nums mt-2">
                    {canManageEvents ? registrations.length : '—'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                {/* Recent Registrations */}
                <div className="bg-white border border-[#08070C]/15 p-5 sm:p-6 space-y-4">
                  <h2 className="font-display text-lg font-bold">Recent Registrations</h2>
                  {!canManageEvents ? (
                    <p className="text-xs text-[#08070C]/60">
                      Visible to Event Administrators and Super Admins.
                    </p>
                  ) : registrations.length === 0 ? (
                    <p className="text-sm text-[#08070C]/60">No submissions recorded yet.</p>
                  ) : (
                    <ul className="divide-y divide-[#08070C]/10">
                      {registrations.slice(0, 5).map((r) => (
                        <li key={r.id} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{r.fullName}</p>
                            <p className="font-mono text-[11px] text-[#08070C]/55 truncate">
                              {r.eventTitle}
                            </p>
                          </div>
                          <span className="font-mono text-xs text-[#243A68] shrink-0 tabular-nums">
                            {r.registrationCode}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Recent Website Updates */}
                <div className="bg-white border border-[#08070C]/15 p-5 sm:p-6 space-y-4">
                  <h2 className="font-display text-lg font-bold">Recent Website Updates</h2>
                  {activityLogs.length === 0 ? (
                    <p className="text-sm text-[#08070C]/60">No administrative actions logged yet.</p>
                  ) : (
                    <ul className="divide-y divide-[#08070C]/10">
                      {activityLogs.slice(0, 6).map((log) => (
                        <li key={log.id} className="py-2.5 space-y-0.5">
                          <p className="text-sm text-[#08070C]">{log.action}</p>
                          <p className="font-mono text-[11px] text-[#08070C]/55">
                            {log.section} · {log.actorEmail} ·{' '}
                            {formatFirestoreTimestamp(log.createdAt)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && canManageEvents && (
            <AdminEventsTab allEvents={allEvents} mediaAssets={mediaAssets} />
          )}

          {activeTab === 'registrations' && canManageEvents && (
            <AdminRegistrationsTab registrations={registrations} allEvents={allEvents} />
          )}

          {activeTab === 'team' && canManageTeam && (
            <AdminTeamTab allMembers={allMembers} mediaAssets={mediaAssets} />
          )}

          {activeTab === 'content' && canManageContent && (
            <AdminContentTab
              allMilestones={allMilestones}
              allAnnouncements={allAnnouncements}
            />
          )}

          {activeTab === 'media' && <AdminMediaTab mediaAssets={mediaAssets} />}

          {activeTab === 'inbox' && <AdminInboxTab messages={contactMessages} />}

          {activeTab === 'roles' && isSuper && <AdminRolesTab admins={adminAccounts} />}
        </main>
      </div>
    </div>
  );
}
