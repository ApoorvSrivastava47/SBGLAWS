import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Mail, MapPin, UserCheck, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../firebase';
import { usePlatform } from '../context/PlatformContext';
import { PageMeta } from '../components/PageMeta';
import { RevealSection } from '../components/MotionPrimitives';
import { EMAIL_REGEX } from '../utils/validation';

export function ContactPage() {
  const { siteSettings } = usePlatform();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [lastSubmittedAt, setLastSubmittedAt] = useState<number>(0);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (honeypot.trim().length > 0) {
      return;
    }
    if (Date.now() - lastSubmittedAt < 10000) {
      setErrorMsg('Please wait a few seconds before sending another message.');
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (cleanName.length < 2 || cleanName.length > 120) {
      setErrorMsg('Please enter your name (2–120 characters).');
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (cleanSubject.length < 2 || cleanSubject.length > 180) {
      setErrorMsg('Please enter a clear subject.');
      return;
    }
    if (cleanMessage.length < 10 || cleanMessage.length > 3000) {
      setErrorMsg('Message must be between 10 and 3000 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        honeypot: '',
        status: 'new',
        createdAt: serverTimestamp(),
      });
      setLastSubmittedAt(Date.now());
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      setErrorMsg('Unable to submit your message right now. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white text-[#08070C]">
      <PageMeta
        title="Contact Us"
        description="Reach out to the AWS Student Builder Group at United College of Engineering & Research (UCER), Prayagraj, Uttar Pradesh, India."
      />

      <section className="border-b border-[#08070C]/10 bg-[#FAFAFC]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-14 md:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-3 sm:mb-4">
            Contact &amp; Campus Presence · UCER Prayagraj
          </p>
          <h1
            className="font-display font-bold tracking-tight leading-[1.02] sm:leading-[0.98]"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 4.5rem)' }}
          >
            Connect With Us
          </h1>
        </div>
      </section>

      <RevealSection className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
        {/* Institutional Details + Campus Map Placeholder */}
        <div className="lg:col-span-5 space-y-6 sm:space-y-8">
          <div className="space-y-5 sm:space-y-6 border border-[#08070C]/15 p-5 sm:p-7 bg-[#E4D5FF]/25">
            {siteSettings.contactEmail && (
              <div className="flex items-start gap-3.5 min-w-0">
                <Mail className="w-5 h-5 text-[#243A68] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-mono text-xs uppercase tracking-wider text-[#08070C]/60">
                    Community Email
                  </p>
                  <a
                    href={`mailto:${siteSettings.contactEmail}`}
                    className="text-base font-medium break-all underline decoration-[#08070C]/30 underline-offset-4 hover:decoration-[#FF9900] transition-colors"
                  >
                    {siteSettings.contactEmail}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3.5">
              <MapPin className="w-5 h-5 text-[#243A68] mt-0.5 shrink-0" />
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-[#08070C]/60">
                  Campus Address
                </p>
                <p className="text-sm text-[#08070C]/85 mt-1 leading-relaxed">
                  {siteSettings.contactAddress ||
                    'United College of Engineering & Research (UCER), Prayagraj, Uttar Pradesh, India'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <UserCheck className="w-5 h-5 text-[#243A68] mt-0.5 shrink-0" />
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-[#08070C]/60">
                  Faculty Coordinators
                </p>
                {siteSettings.facultyCoordinatorContact ? (
                  <p className="text-sm text-[#08070C]/85 mt-1 whitespace-pre-line leading-relaxed">
                    {siteSettings.facultyCoordinatorContact}
                  </p>
                ) : (
                  <p className="font-mono text-xs text-[#08070C]/55 mt-1">
                    To be provided &amp; configured in Admin
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#08070C]/10 flex flex-wrap gap-4 text-xs font-mono uppercase tracking-wider">
              {siteSettings.linkedinUrl ? (
                <a
                  href={siteSettings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 py-1.5 sm:py-0 hover:text-[#243A68] transition-colors"
                >
                  LinkedIn <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-[#08070C]/45">LinkedIn (Pending)</span>
              )}
              {siteSettings.instagramUrl ? (
                <a
                  href={siteSettings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 py-1.5 sm:py-0 hover:text-[#243A68] transition-colors"
                >
                  Instagram <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-[#08070C]/45">Instagram (Pending)</span>
              )}
            </div>
          </div>

          {/* Google Maps Embed Placeholder for UCER Campus */}
          <div className="border border-[#08070C]/15 bg-[#DCE4F5]/35 overflow-hidden">
            {siteSettings.mapEmbedUrl &&
            siteSettings.mapEmbedUrl.startsWith('https://www.google.com/maps/embed') ? (
              <iframe
                title="UCER Prayagraj Campus Map"
                src={siteSettings.mapEmbedUrl}
                className="w-full h-56 sm:h-72 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="h-56 sm:h-72 p-5 sm:p-6 flex flex-col items-center justify-center text-center space-y-2">
                <MapPin className="w-6 h-6 text-[#243A68]" />
                <p className="font-mono text-xs uppercase tracking-wider text-[#243A68]">
                  UCER Campus Google Maps Embed Slot
                </p>
                <p className="text-xs text-[#08070C]/65 max-w-xs leading-relaxed">
                  United College of Engineering &amp; Research, Prayagraj, Uttar Pradesh, India.
                  Add an official Google Maps embed URL in Admin Settings to render an interactive
                  map here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="border border-[#08070C]/15 p-5 sm:p-10 space-y-5 sm:space-y-6 bg-white"
            noValidate
          >
            <div className="border-b border-[#08070C]/10 pb-4">
              <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-2">
                Send an Inquiry
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                Direct Message
              </h2>
            </div>

            {submitted && (
              <div className="flex items-start gap-3 p-4 bg-[#DCE4F5]/60 border border-[#243A68]/25 text-sm">
                <CheckCircle2 className="w-5 h-5 text-[#243A68] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Message Received</p>
                  <p className="text-[#08070C]/75">
                    Thank you for reaching out. Our student coordinators will review your inquiry.
                  </p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div
                role="alert"
                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-900 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Anti-spam Honeypot */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website-field">Leave empty</label>
              <input
                id="website-field"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#08070C]/75 mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 focus:border-[#08070C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#08070C]/75 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  maxLength={160}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 focus:border-[#08070C] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#08070C]/75 mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                required
                maxLength={180}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Collaboration, workshop query, membership..."
                className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 focus:border-[#08070C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#08070C]/75 mb-1.5">
                Message *
              </label>
              <textarea
                rows={5}
                required
                maxLength={3000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message (minimum 10 characters)..."
                className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 focus:border-[#08070C] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto min-h-[44px] px-7 py-3.5 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68] active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </RevealSection>
    </div>
  );
}
