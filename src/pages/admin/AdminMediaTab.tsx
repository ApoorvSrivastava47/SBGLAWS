import React, { useState } from 'react';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Upload, Trash2, Copy, Check } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../../firebase';
import { usePlatform } from '../../context/PlatformContext';
import type { MediaAsset, MediaCategory } from '../../types';

interface AdminMediaTabProps {
  mediaAssets: MediaAsset[];
}

export function AdminMediaTab({ mediaAssets }: AdminMediaTabProps) {
  const { user, siteSettings, logAdminActivity } = usePlatform();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MediaCategory>('community');
  const [altText, setAltText] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !altText.trim()) {
      setErrorMsg('Please provide a title and descriptive alt text.');
      return;
    }

    if (!file && !externalUrl.trim()) {
      setErrorMsg('Please select an image file to upload or provide an image URL.');
      return;
    }

    setUploading(true);
    try {
      let resolvedUrl = externalUrl.trim();

      if (file) {
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error('Authentication token unavailable.');

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${idToken}` },
          body: formData,
        });

        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          throw new Error(data.error || 'Image upload failed.');
        }
        resolvedUrl = data.url;
      }

      await addDoc(collection(db, 'media_assets'), {
        title: title.trim().slice(0, 160),
        category,
        url: resolvedUrl.slice(0, 1000),
        altText: altText.trim().slice(0, 300),
        uploadedBy: user?.email?.toLowerCase() || '',
        createdAt: serverTimestamp(),
      });

      await logAdminActivity(`Uploaded media "${title.trim()}" (${category})`, 'Media');
      setTitle('');
      setAltText('');
      setExternalUrl('');
      setFile(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function assignToSlot(slotField: 'awsLogoUrl' | 'ucerLogoUrl' | 'heroPhotoUrl', url: string) {
    try {
      await setDoc(
        doc(db, 'site_settings', 'main'),
        {
          ...siteSettings,
          [slotField]: url,
          updatedAt: serverTimestamp(),
          updatedBy: user?.email?.toLowerCase() || 'admin',
        },
        { merge: true }
      );
      await logAdminActivity(`Assigned media asset to ${slotField}`, 'Media');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'site_settings/main');
    }
  }

  async function handleDelete(asset: MediaAsset) {
    try {
      if (asset.url.startsWith('/uploads/')) {
        const filename = asset.url.replace('/uploads/', '');
        const idToken = await auth.currentUser?.getIdToken();
        if (idToken) {
          await fetch(`/api/media/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${idToken}` },
          });
        }
      }
      await deleteDoc(doc(db, 'media_assets', asset.id));
      await logAdminActivity(`Deleted media "${asset.title}"`, 'Media');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `media_assets/${asset.id}`);
    }
  }

  function copyUrl(id: string, url: string) {
    void navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Central Media Library</h2>
        <p className="text-sm text-[#08070C]/65">
          Upload official AWS &amp; UCER logos, event posters, team portraits, and community photos
          (JPEG, PNG, WEBP, SVG up to 5 MB).
        </p>
      </div>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="border border-[#08070C]/15 bg-white p-4 sm:p-6 space-y-4"
      >
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-sm">
            {errorMsg}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Asset Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Official AWS Logo"
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MediaCategory)}
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25 bg-white"
            >
              <option value="logo">Logo (AWS / UCER)</option>
              <option value="hero">Homepage Hero</option>
              <option value="community">Community / Collage</option>
              <option value="team">Team Portrait</option>
              <option value="event_poster">Event Poster</option>
              <option value="event_gallery">Event Gallery</option>
              <option value="milestone">Timeline Milestone</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Alt Text *</label>
            <input
              type="text"
              required
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Accessible image description"
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Upload Image File</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:border-0 file:bg-[#E4D5FF] file:text-[#08070C] file:text-xs file:font-mono file:uppercase cursor-pointer"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase mb-1">
              Or Direct Image URL (Optional)
            </label>
            <input
              type="text"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm border border-[#08070C]/25"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#08070C] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#243A68] disabled:opacity-50 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Uploading...' : 'Upload to Library'}</span>
        </button>
      </form>

      {/* Asset Grid */}
      {mediaAssets.length === 0 ? (
        <div className="border border-[#08070C]/15 bg-white p-8 text-center text-sm text-[#08070C]/65">
          No media assets uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mediaAssets.map((asset) => (
            <article key={asset.id} className="border border-[#08070C]/15 bg-white flex flex-col justify-between">
              <div>
                <div className="aspect-[16/10] bg-[#F4F4F8] border-b border-[#08070C]/10 overflow-hidden flex items-center justify-center">
                  <img
                    src={asset.url}
                    alt={asset.altText}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full ${
                      asset.category === 'logo' ? 'object-contain p-4' : 'object-cover'
                    }`}
                  />
                </div>
                <div className="p-4 space-y-1">
                  <p className="font-mono text-[11px] uppercase text-[#243A68]">{asset.category}</p>
                  <h3 className="font-display font-bold text-base truncate">{asset.title}</h3>
                  <p className="font-mono text-[11px] text-[#08070C]/55 truncate">{asset.url}</p>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-[#08070C]/10 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => assignToSlot('awsLogoUrl', asset.url)}
                    className="px-2 py-1 text-[10px] font-mono uppercase border border-[#08070C]/20 hover:bg-[#E4D5FF]/50 cursor-pointer"
                  >
                    Set AWS Logo
                  </button>
                  <button
                    type="button"
                    onClick={() => assignToSlot('ucerLogoUrl', asset.url)}
                    className="px-2 py-1 text-[10px] font-mono uppercase border border-[#08070C]/20 hover:bg-[#E4D5FF]/50 cursor-pointer"
                  >
                    Set UCER Logo
                  </button>
                  <button
                    type="button"
                    onClick={() => assignToSlot('heroPhotoUrl', asset.url)}
                    className="px-2 py-1 text-[10px] font-mono uppercase border border-[#08070C]/20 hover:bg-[#E4D5FF]/50 cursor-pointer"
                  >
                    Set Hero
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => copyUrl(asset.id, asset.url)}
                    className="inline-flex items-center gap-1 text-xs font-mono text-[#243A68] hover:text-[#08070C] cursor-pointer"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(asset)}
                    className="text-red-700 hover:text-red-900 p-1 cursor-pointer"
                    aria-label={`Delete ${asset.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
