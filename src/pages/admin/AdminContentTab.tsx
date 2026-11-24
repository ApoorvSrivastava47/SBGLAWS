import React, { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { usePlatform } from '../../context/PlatformContext';
import type { Announcement, Milestone, ObjectiveItem, SiteSettings } from '../../types';

interface AdminContentTabProps {
  allMilestones: Milestone[];
  allAnnouncements: Announcement[];
}

export function AdminContentTab({ allMilestones, allAnnouncements }: AdminContentTabProps) {
  const { user, siteSettings, logAdminActivity } = usePlatform();
  const [form, setForm] = useState<SiteSettings>(siteSettings);
  const [missionText, setMissionText] = useState((siteSettings.aboutMission || []).join('\n'));
  const [objectives, setObjectives] = useState<ObjectiveItem[]>(
    siteSettings.aboutObjectives || []
  );
  const [collageUrls, setCollageUrls] = useState<string[]>(() => {
    const base = [...(siteSettings.collagePhotoUrls || [])];
    while (base.length < 6) base.push('');
    return base.slice(0, 6);
  });
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // New Milestone state
  const [msDate, setMsDate] = useState('');
  const [msTitle, setMsTitle] = useState('');
  const [msDesc, setMsDesc] = useState('');
  const [msPhoto, setMsPhoto] = useState('');
  const [msOrder, setMsOrder] = useState(1);

  // New Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annSummary, setAnnSummary] = useState('');
  const [annLinkUrl, setAnnLinkUrl] = useState('');
  const [annLinkLabel, setAnnLinkLabel] = useState('');

  useEffect(() => {
    setForm(siteSettings);
    setMissionText((siteSettings.aboutMission || []).join('\n'));
    setObjectives(siteSettings.aboutObjectives || []);
    const nextCollage = [...(siteSettings.collagePhotoUrls || [])];
    while (nextCollage.length < 6) nextCollage.push('');
    setCollageUrls(nextCollage.slice(0, 6));
  }, [siteSettings]);

  async function saveSiteSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);

    const cleanMission = missionText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);

    const cleanObjectives = objectives
      .filter((o) => o.title.trim() && o.description.trim())
      .slice(0, 10)
      .map((o) => ({
        title: o.title.trim().slice(0, 120),
        description: o.description.trim().slice(0, 400),
      }));

    const payload = {
      heroHeadline: (form.heroHeadline || 'WE ARE BUILDERS.').trim().slice(0, 120),
      heroSubheadline: (form.heroSubheadline || 'LEARN. CONNECT. BUILD. GROW.').trim().slice(0, 200),
      heroDescription: (form.heroDescription || '').trim().slice(0, 600),
      heroPhotoUrl: (form.heroPhotoUrl || '').trim().slice(0, 1000),
      campusSessionPhotoUrl: (form.campusSessionPhotoUrl || '').trim().slice(0, 1000),
      awsLogoUrl: (form.awsLogoUrl || '').trim().slice(0, 1000),
      ucerLogoUrl: (form.ucerLogoUrl || '').trim().slice(0, 1000),
      introTitle: (form.introTitle || '').trim().slice(0, 160),
      introBody: (form.introBody || '').trim().slice(0, 2500),
      collagePhotoUrls: collageUrls.map((u) => u.trim().slice(0, 1000)),
      statsConfigured: Boolean(form.statsConfigured),
      statsTotalMembers: Number(form.statsTotalMembers) || 0,
      statsEventsConducted: Number(form.statsEventsConducted) || 0,
      statsWorkshopsOrganised: Number(form.statsWorkshopsOrganised) || 0,
      statsProjectsDeveloped: Number(form.statsProjectsDeveloped) || 0,
      aboutStoryTitle: (form.aboutStoryTitle || '').trim().slice(0, 160),
      aboutStoryBody: (form.aboutStoryBody || '').trim().slice(0, 4000),
      aboutVision: (form.aboutVision || '').trim().slice(0, 600),
      aboutMission: cleanMission,
      aboutObjectives: cleanObjectives,
      contactEmail: (form.contactEmail || '').trim().slice(0, 160),
      contactAddress: (form.contactAddress || '').trim().slice(0, 400),
      facultyCoordinatorContact: (form.facultyCoordinatorContact || '').trim().slice(0, 240),
      linkedinUrl: (form.linkedinUrl || '').trim().slice(0, 500),
      instagramUrl: (form.instagramUrl || '').trim().slice(0, 500),
      githubUrl: (form.githubUrl || '').trim().slice(0, 500),
      mapEmbedUrl: (form.mapEmbedUrl || '').trim().slice(0, 1000),
      updatedAt: serverTimestamp(),
      updatedBy: user?.email?.toLowerCase() || 'admin',
    };

    try {
      await setDoc(doc(db, 'site_settings', 'main'), payload);
      await logAdminActivity('Updated global website content & settings', 'Content');
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'site_settings/main');
    } finally {
      setSaving(false);
    }
  }

  async function addMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!msDate.trim() || !msTitle.trim() || !msDesc.trim()) return;
    try {
      await addDoc(collection(db, 'milestones'), {
        dateLabel: msDate.trim().slice(0, 60),
        sortOrder: Number(msOrder) || 1,
        title: msTitle.trim().slice(0, 160),
        description: msDesc.trim().slice(0, 1500),
        photoUrl: msPhoto.trim().slice(0, 1000),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await logAdminActivity(`Added journey milestone "${msTitle.trim()}"`, 'Journey');
      setMsDate('');
      setMsTitle('');
      setMsDesc('');
      setMsPhoto('');
      setMsOrder((prev) => prev + 1);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'milestones');
    }
  }

  async function deleteMilestone(id: string, title: string) {
    try {
      await deleteDoc(doc(db, 'milestones', id));
      await logAdminActivity(`Deleted milestone "${title}"`, 'Journey');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `milestones/${id}`);
    }
  }

  async function addAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!annTitle.trim() || !annSummary.trim()) return;
    try {
      await addDoc(collection(db, 'announcements'), {
        title: annTitle.trim().slice(0, 160),
        summary: annSummary.trim().slice(0, 500),
        linkUrl: annLinkUrl.trim().slice(0, 500),
        linkLabel: annLinkLabel.trim().slice(0, 60),
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await logAdminActivity(`Published announcement "${annTitle.trim()}"`, 'Announcements');
      setAnnTitle('');
      setAnnSummary('');
      setAnnLinkUrl('');
      setAnnLinkLabel('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'announcements');
    }
  }

  async function toggleAnnouncement(ann: Announcement) {
    try {
      await updateDoc(doc(db, 'announcements', ann.id), {
        isActive: !ann.isActive,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `announcements/${ann.id}`);
    }
  }

  async function deleteAnnouncement(id: string) {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
    }
  }

  return (
    <div className="space-y-12">
      {/* Global Site Content Form */}
      <form onSubmit={saveSiteSettings} className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Website Content &amp; Settings
            </h2>
            <p className="text-sm text-[#08070C]/65">
              Edit hero copy, brand logos, community statistics, About Us story, and official
              contact links.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {savedNotice && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                Saved to Firestore
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#08070C] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#243A68] disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Publish Changes'}
            </button>
          </div>
        </div>

        {/* Hero & Logos */}
        <div className="border border-[#08070C]/15 bg-white p-4 sm:p-6 space-y-4">
          <h3 className="font-display text-lg font-bold border-b border-[#08070C]/10 pb-2">
            Hero &amp; Brand Identity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase mb-1">Hero Headline</label>
              <input
                type="text"
                required
                value={form.heroHeadline}
                onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">Supporting Statement</label>
              <input
                type="text"
                required
                value={form.heroSubheadline}
                onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-mono text-xs uppercase mb-1">Hero Description</label>
              <textarea
                rows={2}
                required
                value={form.heroDescription}
                onChange={(e) => setForm({ ...form, heroDescription: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">AWS Logo URL</label>
              <input
                type="text"
                value={form.awsLogoUrl || ''}
                onChange={(e) => setForm({ ...form, awsLogoUrl: e.target.value })}
                placeholder="/uploads/... or URL"
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">UCER Logo URL</label>
              <input
                type="text"
                value={form.ucerLogoUrl || ''}
                onChange={(e) => setForm({ ...form, ucerLogoUrl: e.target.value })}
                placeholder="/uploads/... or URL"
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">
                Hero Community Photo URL
              </label>
              <input
                type="text"
                value={form.heroPhotoUrl || ''}
                onChange={(e) => setForm({ ...form, heroPhotoUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">
                Campus Session Photo URL
              </label>
              <input
                type="text"
                value={form.campusSessionPhotoUrl || ''}
                onChange={(e) => setForm({ ...form, campusSessionPhotoUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
          </div>
        </div>

        {/* Homepage Intro & 6 Collage Slots */}
        <div className="border border-[#08070C]/15 bg-white p-4 sm:p-6 space-y-4">
          <h3 className="font-display text-lg font-bold border-b border-[#08070C]/10 pb-2">
            Introduction &amp; Photo Collage Slots
          </h3>
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Introduction Title</label>
            <input
              type="text"
              required
              value={form.introTitle}
              onChange={(e) => setForm({ ...form, introTitle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Introduction Body</label>
            <textarea
              rows={3}
              required
              value={form.introBody}
              onChange={(e) => setForm({ ...form, introBody: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {collageUrls.map((url, idx) => (
              <div key={idx}>
                <label className="block font-mono text-[11px] uppercase mb-1">
                  Collage Slot {idx + 1} URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    const next = [...collageUrls];
                    next[idx] = e.target.value;
                    setCollageUrls(next);
                  }}
                  placeholder="/uploads/... or URL"
                  className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Community Statistics */}
        <div className="border border-[#08070C]/15 bg-white p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#08070C]/10 pb-2">
            <h3 className="font-display text-lg font-bold">Community Statistics</h3>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.statsConfigured}
                onChange={(e) => setForm({ ...form, statsConfigured: e.target.checked })}
              />
              <span>Publish Verified Counters on Homepage</span>
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">Total Members</label>
              <input
                type="number"
                min={0}
                value={form.statsTotalMembers ?? 0}
                onChange={(e) =>
                  setForm({ ...form, statsTotalMembers: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">Events Conducted</label>
              <input
                type="number"
                min={0}
                value={form.statsEventsConducted ?? 0}
                onChange={(e) =>
                  setForm({ ...form, statsEventsConducted: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">
                Workshops Organised
              </label>
              <input
                type="number"
                min={0}
                value={form.statsWorkshopsOrganised ?? 0}
                onChange={(e) =>
                  setForm({ ...form, statsWorkshopsOrganised: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">
                Projects Developed
              </label>
              <input
                type="number"
                min={0}
                value={form.statsProjectsDeveloped ?? 0}
                onChange={(e) =>
                  setForm({ ...form, statsProjectsDeveloped: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
          </div>
        </div>

        {/* About Us Content */}
        <div className="border border-[#08070C]/15 bg-white p-4 sm:p-6 space-y-4">
          <h3 className="font-display text-lg font-bold border-b border-[#08070C]/10 pb-2">
            About Us Story, Vision &amp; Mission
          </h3>
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Our Story Heading</label>
            <input
              type="text"
              value={form.aboutStoryTitle || ''}
              onChange={(e) => setForm({ ...form, aboutStoryTitle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Our Story Narrative</label>
            <textarea
              rows={4}
              value={form.aboutStoryBody || ''}
              onChange={(e) => setForm({ ...form, aboutStoryBody: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Vision Statement</label>
            <textarea
              rows={2}
              value={form.aboutVision || ''}
              onChange={(e) => setForm({ ...form, aboutVision: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase mb-1">
              Mission Statements (One per line)
            </label>
            <textarea
              rows={4}
              value={missionText}
              onChange={(e) => setMissionText(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase">Objectives</span>
              <button
                type="button"
                onClick={() => setObjectives([...objectives, { title: '', description: '' }])}
                className="px-3 py-1 border border-[#08070C]/25 text-xs font-mono uppercase cursor-pointer"
              >
                + Add Objective
              </button>
            </div>
            {objectives.map((obj, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                <input
                  type="text"
                  placeholder="Objective title"
                  value={obj.title}
                  onChange={(e) => {
                    const next = [...objectives];
                    next[idx] = { ...obj, title: e.target.value };
                    setObjectives(next);
                  }}
                  className="sm:col-span-4 px-3 py-2 text-sm border border-[#08070C]/20"
                />
                <input
                  type="text"
                  placeholder="Short description"
                  value={obj.description}
                  onChange={(e) => {
                    const next = [...objectives];
                    next[idx] = { ...obj, description: e.target.value };
                    setObjectives(next);
                  }}
                  className="sm:col-span-7 px-3 py-2 text-sm border border-[#08070C]/20"
                />
                <button
                  type="button"
                  onClick={() => setObjectives(objectives.filter((_, i) => i !== idx))}
                  className="sm:col-span-1 p-2 text-red-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Details & Social Links */}
        <div className="border border-[#08070C]/15 bg-white p-4 sm:p-6 space-y-4">
          <h3 className="font-display text-lg font-bold border-b border-[#08070C]/10 pb-2">
            Contact Details &amp; Social Media
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase mb-1">Official Email</label>
              <input
                type="email"
                value={form.contactEmail || ''}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">
                Faculty Coordinator Contact
              </label>
              <input
                type="text"
                value={form.facultyCoordinatorContact || ''}
                onChange={(e) =>
                  setForm({ ...form, facultyCoordinatorContact: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-mono text-xs uppercase mb-1">Campus Address</label>
              <input
                type="text"
                value={form.contactAddress || ''}
                onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={form.linkedinUrl || ''}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">Instagram URL</label>
              <input
                type="url"
                value={form.instagramUrl || ''}
                onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">GitHub URL</label>
              <input
                type="url"
                value={form.githubUrl || ''}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">
                Google Maps Embed URL
              </label>
              <input
                type="url"
                value={form.mapEmbedUrl || ''}
                onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })}
                placeholder="https://www.google.com/maps/embed?..."
                className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Journey Milestones CRUD */}
      <div className="border border-[#08070C]/15 bg-white p-4 sm:p-6 space-y-5">
        <h3 className="font-display text-xl font-bold">Our Journey Timeline Milestones</h3>

        <form onSubmit={addMilestone} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block font-mono text-[11px] uppercase mb-1">Order</label>
            <input
              type="number"
              value={msOrder}
              onChange={(e) => setMsOrder(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block font-mono text-[11px] uppercase mb-1">Date Label *</label>
            <input
              type="text"
              required
              placeholder="e.g. Oct 2026"
              value={msDate}
              onChange={(e) => setMsDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div className="sm:col-span-4">
            <label className="block font-mono text-[11px] uppercase mb-1">Title *</label>
            <input
              type="text"
              required
              value={msTitle}
              onChange={(e) => setMsTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block font-mono text-[11px] uppercase mb-1">Photo URL</label>
            <input
              type="text"
              value={msPhoto}
              onChange={(e) => setMsPhoto(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div className="sm:col-span-9">
            <label className="block font-mono text-[11px] uppercase mb-1">Description *</label>
            <input
              type="text"
              required
              value={msDesc}
              onChange={(e) => setMsDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#08070C] text-white text-xs font-mono uppercase cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>
        </form>

        {allMilestones.length > 0 && (
          <div className="divide-y divide-[#08070C]/10 border-t border-[#08070C]/10">
            {allMilestones.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-[#243A68]">
                    #{m.sortOrder} · {m.dateLabel}
                  </p>
                  <p className="font-semibold text-sm">{m.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteMilestone(m.id, m.title)}
                  className="p-2 text-red-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Announcements CRUD */}
      <div className="border border-[#08070C]/15 bg-white p-4 sm:p-6 space-y-5">
        <h3 className="font-display text-xl font-bold">Site-Wide Announcements</h3>

        <form onSubmit={addAnnouncement} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <label className="block font-mono text-[11px] uppercase mb-1">Title *</label>
            <input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div className="sm:col-span-5">
            <label className="block font-mono text-[11px] uppercase mb-1">Summary *</label>
            <input
              type="text"
              required
              value={annSummary}
              onChange={(e) => setAnnSummary(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block font-mono text-[11px] uppercase mb-1">Link Path</label>
            <input
              type="text"
              placeholder="/events"
              value={annLinkUrl}
              onChange={(e) => setAnnLinkUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div className="sm:col-span-9">
            <label className="block font-mono text-[11px] uppercase mb-1">Link Label</label>
            <input
              type="text"
              placeholder="Learn More"
              value={annLinkLabel}
              onChange={(e) => setAnnLinkLabel(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#08070C] text-white text-xs font-mono uppercase cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>
          </div>
        </form>

        {allAnnouncements.length > 0 && (
          <div className="divide-y divide-[#08070C]/10 border-t border-[#08070C]/10">
            {allAnnouncements.map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm">{a.title}</p>
                  <p className="text-xs text-[#08070C]/70">{a.summary}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAnnouncement(a)}
                    className="px-2.5 py-1 text-xs font-mono uppercase border border-[#08070C]/20 cursor-pointer"
                  >
                    {a.isActive ? 'Active' : 'Hidden'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAnnouncement(a.id)}
                    className="p-2 text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
