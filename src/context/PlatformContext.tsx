import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  addDoc,
} from 'firebase/firestore';
import {
  auth,
  BOOTSTRAPPED_SUPER_ADMIN,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import type {
  AdminAccount,
  AdminRole,
  Announcement,
  CommunityEvent,
  Milestone,
  SiteSettings,
  TeamMember,
} from '../types';
import { CORE_TEAM_MEMBERS, DEFAULT_EVENTS, DEFAULT_SITE_SETTINGS } from '../types';

interface PlatformContextValue {
  user: User | null;
  authReady: boolean;
  adminAccount: AdminAccount | null;
  adminRole: AdminRole | null;
  isAdmin: boolean;
  adminChecked: boolean;
  siteSettings: SiteSettings;
  settingsLoadedFromDb: boolean;
  events: CommunityEvent[];
  teamMembers: TeamMember[];
  milestones: Milestone[];
  announcements: Announcement[];
  publicDataLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  logAdminActivity: (action: string, section: string) => Promise<void>;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [adminAccount, setAdminAccount] = useState<AdminAccount | null>(null);
  const [adminChecked, setAdminChecked] = useState(false);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [settingsLoadedFromDb, setSettingsLoadedFromDb] = useState(false);
  const [events, setEvents] = useState<CommunityEvent[]>(DEFAULT_EVENTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(CORE_TEAM_MEMBERS);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [publicDataLoading, setPublicDataLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser && nextUser.email && nextUser.emailVerified) {
        try {
          await setDoc(
            doc(db, 'users', nextUser.uid),
            {
              uid: nextUser.uid,
              email: nextUser.email.toLowerCase(),
              displayName: (nextUser.displayName || nextUser.email.split('@')[0] || 'User').slice(0, 120),
              photoUrl: (nextUser.photoURL || '').slice(0, 1000),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch {
          // Non-fatal if user profile upsert fails on first sign-in
        }
      }
    });
    return () => unsubAuth();
  }, []);

  // Listen to admin role record for signed-in verified user
  useEffect(() => {
    if (!authReady) return;
    const emailLower = user?.email?.toLowerCase();
    if (!user || !emailLower || !user.emailVerified) {
      setAdminAccount(null);
      setAdminChecked(true);
      return;
    }

    setAdminChecked(false);
    const adminRef = doc(db, 'admins', emailLower);
    const unsubAdmin = onSnapshot(
      adminRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Omit<AdminAccount, 'id'>;
          setAdminAccount({ id: snap.id, ...data });
        } else if (emailLower === BOOTSTRAPPED_SUPER_ADMIN) {
          setAdminAccount({
            id: emailLower,
            email: emailLower,
            displayName: user.displayName || 'Super Admin',
            role: 'super_admin',
            isActive: true,
          });
        } else {
          setAdminAccount(null);
        }
        setAdminChecked(true);
      },
      () => {
        if (emailLower === BOOTSTRAPPED_SUPER_ADMIN) {
          setAdminAccount({
            id: emailLower,
            email: emailLower,
            displayName: user.displayName || 'Super Admin',
            role: 'super_admin',
            isActive: true,
          });
        } else {
          setAdminAccount(null);
        }
        setAdminChecked(true);
      }
    );

    return () => unsubAdmin();
  }, [user, authReady]);

  // Public site settings listener
  useEffect(() => {
    const settingsRef = doc(db, 'site_settings', 'main');
    const unsubSettings = onSnapshot(
      settingsRef,
      (snap) => {
        if (snap.exists()) {
          const remote = snap.data() as SiteSettings;
          setSiteSettings({
            ...DEFAULT_SITE_SETTINGS,
            ...remote,
            heroPhotoUrl:
              remote.heroPhotoUrl?.trim() &&
              remote.heroPhotoUrl !==
                '/assets/aistudio/Hero_Community_Photograph_page-0001_9af5069a.jpg'
                ? remote.heroPhotoUrl
                : DEFAULT_SITE_SETTINGS.heroPhotoUrl,
            awsLogoUrl: remote.awsLogoUrl?.trim()
              ? remote.awsLogoUrl
              : DEFAULT_SITE_SETTINGS.awsLogoUrl,
            ucerLogoUrl: remote.ucerLogoUrl?.trim()
              ? remote.ucerLogoUrl
              : DEFAULT_SITE_SETTINGS.ucerLogoUrl,
            campusSessionPhotoUrl: remote.campusSessionPhotoUrl?.trim()
              ? remote.campusSessionPhotoUrl
              : DEFAULT_SITE_SETTINGS.campusSessionPhotoUrl,
            aboutLaunchPhotoUrl: remote.aboutLaunchPhotoUrl?.trim()
              ? remote.aboutLaunchPhotoUrl
              : DEFAULT_SITE_SETTINGS.aboutLaunchPhotoUrl,
            collagePhotoUrls: DEFAULT_SITE_SETTINGS.collagePhotoUrls?.map((defUrl, idx) =>
              remote.collagePhotoUrls?.[idx]?.trim() ? remote.collagePhotoUrls[idx] : defUrl
            ),
            linkedinUrl: remote.linkedinUrl?.trim()
              ? remote.linkedinUrl
              : DEFAULT_SITE_SETTINGS.linkedinUrl,
            instagramUrl: remote.instagramUrl?.trim()
              ? remote.instagramUrl
              : DEFAULT_SITE_SETTINGS.instagramUrl,
            facultyCoordinatorContact: remote.facultyCoordinatorContact?.trim()
              ? remote.facultyCoordinatorContact
              : DEFAULT_SITE_SETTINGS.facultyCoordinatorContact,
          });
          setSettingsLoadedFromDb(true);
        } else {
          setSiteSettings(DEFAULT_SITE_SETTINGS);
          setSettingsLoadedFromDb(false);
        }
        setPublicDataLoading(false);
      },
      (error) => {
        console.error('Error loading site_settings:', error);
        setPublicDataLoading(false);
      }
    );

    const eventsQuery = query(collection(db, 'events'), where('isPublished', '==', true));
    const unsubEvents = onSnapshot(
      eventsQuery,
      (snap) => {
        const remoteItems: CommunityEvent[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CommunityEvent, 'id'>),
        }));
        const remoteKeys = new Set(
          remoteItems.flatMap((e) => [e.id, e.slug].filter(Boolean))
        );
        const defaultFallbacks = DEFAULT_EVENTS.filter(
          (def) => !remoteKeys.has(def.id) && !remoteKeys.has(def.slug)
        );
        const merged = [...defaultFallbacks, ...remoteItems];
        merged.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
        setEvents(merged);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'events');
      }
    );

    const teamQuery = query(collection(db, 'team_members'), where('isActive', '==', true));
    const unsubTeam = onSnapshot(
      teamQuery,
      (snap) => {
        const coreByName = new Map(
          CORE_TEAM_MEMBERS.map((core) => [core.fullName.trim().toLowerCase(), core])
        );
        const remoteItems: TeamMember[] = snap.docs.map((d) => {
          const item: TeamMember = {
            id: d.id,
            ...(d.data() as Omit<TeamMember, 'id'>),
          };
          const coreMatch = coreByName.get(item.fullName.trim().toLowerCase());
          if (!coreMatch) return item;
          return {
            ...item,
            photoUrl: item.photoUrl?.trim() ? item.photoUrl : coreMatch.photoUrl,
            imageClassName: item.imageClassName?.trim()
              ? item.imageClassName
              : coreMatch.imageClassName,
          };
        });
        const remoteNames = new Set(
          remoteItems.map((m) => m.fullName.trim().toLowerCase())
        );
        const coreFallbacks = CORE_TEAM_MEMBERS.filter(
          (core) => !remoteNames.has(core.fullName.trim().toLowerCase())
        );
        const merged = [...coreFallbacks, ...remoteItems];
        merged.sort((a, b) => (a.hierarchyOrder ?? 999) - (b.hierarchyOrder ?? 999));
        setTeamMembers(merged);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'team_members');
      }
    );

    const milestonesQuery = query(collection(db, 'milestones'), orderBy('sortOrder', 'asc'));
    const unsubMilestones = onSnapshot(
      milestonesQuery,
      (snap) => {
        const items: Milestone[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Milestone, 'id'>),
        }));
        setMilestones(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'milestones');
      }
    );

    const announcementsQuery = query(collection(db, 'announcements'), where('isActive', '==', true));
    const unsubAnnouncements = onSnapshot(
      announcementsQuery,
      (snap) => {
        const items: Announcement[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Announcement, 'id'>),
        }));
        setAnnouncements(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'announcements');
      }
    );

    return () => {
      unsubSettings();
      unsubEvents();
      unsubTeam();
      unsubMilestones();
      unsubAnnouncements();
    };
  }, []);

  const isBootstrapped =
    Boolean(user?.emailVerified) &&
    user?.email?.toLowerCase() === BOOTSTRAPPED_SUPER_ADMIN;

  const isAdmin = isBootstrapped || Boolean(adminAccount && adminAccount.isActive);
  const adminRole: AdminRole | null = isBootstrapped
    ? 'super_admin'
    : adminAccount?.isActive
      ? adminAccount.role
      : null;

  async function signInWithGoogle(): Promise<void> {
    await signInWithPopup(auth, googleProvider);
  }

  async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  async function logAdminActivity(action: string, section: string): Promise<void> {
    const actorEmail = user?.email?.toLowerCase();
    if (!actorEmail || !isAdmin) return;
    try {
      await addDoc(collection(db, 'activity_logs'), {
        actorEmail,
        action: action.slice(0, 240),
        section: section.slice(0, 80),
        createdAt: serverTimestamp(),
      });
    } catch {
      // Activity log write failure should not block primary admin mutation
    }
  }

  return (
    <PlatformContext.Provider
      value={{
        user,
        authReady,
        adminAccount,
        adminRole,
        isAdmin,
        adminChecked,
        siteSettings,
        settingsLoadedFromDb,
        events,
        teamMembers,
        milestones,
        announcements,
        publicDataLoading,
        signInWithGoogle,
        signOut,
        logAdminActivity,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform(): PlatformContextValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return ctx;
}
