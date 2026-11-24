import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc, serverTimestamp, writeBatch, collection } from 'firebase/firestore';
import { CheckCircle2, Plus, Trash2, Printer, ArrowLeft, AlertCircle } from 'lucide-react';
import { db } from '../firebase';
import { usePlatform } from '../context/PlatformContext';
import type { CommunityEvent, TeamMemberSubmission } from '../types';
import { PageMeta } from '../components/PageMeta';
import { ImageSlot } from '../components/ImageSlot';
import { RevealSection } from '../components/MotionPrimitives';
import {
  buildRegistrationLockId,
  computeEventStatus,
  EMAIL_REGEX,
  formatDisplayDate,
  generateRegistrationCode,
  isDeadlinePassed,
  PHONE_REGEX,
} from '../utils/validation';

export function EventRegistrationPage() {
  const { eventId } = useParams<{ eventId?: string }>();
  const { events } = usePlatform();

  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(Boolean(eventId));

  // Form fields
  const [fullName, setFullName] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [collegeName, setCollegeName] = useState(
    'United College of Engineering & Research (UCER)'
  );
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('2nd Year');
  const [studentId, setStudentId] = useState('');
  const [registrationType, setRegistrationType] = useState<'individual' | 'team'>('individual');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMemberSubmission[]>([]);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [consentAccepted, setConsentAccepted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedTicket, setConfirmedTicket] = useState<{
    registrationCode: string;
    eventTitle: string;
    fullName: string;
    collegeEmail: string;
    registrationType: string;
    teamName?: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    if (!eventId) {
      setSelectedEvent(null);
      setLoadingEvent(false);
      return;
    }

    const fromContext = events.find((e) => e.id === eventId || e.slug === eventId);
    if (fromContext) {
      setSelectedEvent(fromContext);
      setLoadingEvent(false);
      return;
    }

    async function loadOne() {
      if (!eventId) return;
      setLoadingEvent(true);
      try {
        const snap = await getDoc(doc(db, 'events', eventId));
        if (active && snap.exists()) {
          setSelectedEvent({ id: snap.id, ...(snap.data() as Omit<CommunityEvent, 'id'>) });
        }
      } catch {
        // Handled cleanly
      } finally {
        if (active) setLoadingEvent(false);
      }
    }
    void loadOne();

    return () => {
      active = false;
    };
  }, [eventId, events]);

  useEffect(() => {
    if (!selectedEvent) return;
    if (selectedEvent.registrationMode === 'team') {
      setRegistrationType('team');
    } else {
      setRegistrationType('individual');
    }
    if (selectedEvent.eligibilityScope === 'ucer_only') {
      setCollegeName('United College of Engineering & Research (UCER)');
    }
  }, [selectedEvent]);

  const openEvents = events.filter((ev) => {
    const status = computeEventStatus(ev);
    return status !== 'past' && ev.registrationOpen && !isDeadlinePassed(ev.registrationDeadline);
  });

  function addTeamMemberRow() {
    const maxExtra = Math.max(0, (selectedEvent?.maxTeamSize || 4) - 1);
    if (teamMembers.length >= maxExtra) return;
    setTeamMembers((prev) => [
      ...prev,
      { name: '', email: '', department: '', academicYear: '2nd Year' },
    ]);
  }

  function updateTeamMember(index: number, field: keyof TeamMemberSubmission, val: string) {
    setTeamMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: val } : m))
    );
  }

  function removeTeamMember(index: number) {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEvent) return;
    setErrorMessage('');

    const cleanName = fullName.trim();
    const cleanEmail = collegeEmail.trim().toLowerCase();
    const cleanPhone = contactNumber.trim();
    const cleanCollege =
      selectedEvent.eligibilityScope === 'ucer_only'
        ? 'United College of Engineering & Research (UCER)'
        : collegeName.trim();
    const cleanDept = department.trim();

    if (cleanName.length < 2 || cleanName.length > 120) {
      setErrorMessage('Please enter your full name (2–120 characters).');
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!PHONE_REGEX.test(cleanPhone)) {
      setErrorMessage('Please enter a valid contact number (7–20 digits).');
      return;
    }
    if (cleanCollege.length < 2) {
      setErrorMessage('Please enter your college name.');
      return;
    }
    if (!cleanDept) {
      setErrorMessage('Please enter your department or branch.');
      return;
    }
    if (selectedEvent.requireStudentId && !studentId.trim()) {
      setErrorMessage('Student ID / Roll Number is required for this event.');
      return;
    }
    if (registrationType === 'team' && !teamName.trim()) {
      setErrorMessage('Please enter a team name.');
      return;
    }
    if (registrationType === 'team') {
      for (let i = 0; i < teamMembers.length; i += 1) {
        const tm = teamMembers[i];
        if (!tm.name.trim() || !EMAIL_REGEX.test(tm.email.trim())) {
          setErrorMessage(`Please enter a valid name and email for Team Member ${i + 2}.`);
          return;
        }
      }
    }

    for (const q of selectedEvent.customQuestions || []) {
      if (q.required && !(customAnswers[q.id] || '').trim()) {
        setErrorMessage(`Please answer the required question: "${q.label}"`);
        return;
      }
    }

    if (!consentAccepted) {
      setErrorMessage('Please confirm the participation consent checkbox to continue.');
      return;
    }

    if (!selectedEvent.registrationOpen || isDeadlinePassed(selectedEvent.registrationDeadline)) {
      setErrorMessage('Registrations for this event are closed.');
      return;
    }

    setSubmitting(true);
    try {
      const regRef = doc(collection(db, 'registrations'));
      const registrationId = regRef.id;
      const lockId = buildRegistrationLockId(selectedEvent.id, cleanEmail);
      const lockRef = doc(db, 'registration_locks', lockId);
      const registrationCode = generateRegistrationCode();

      const customAnswerList = (selectedEvent.customQuestions || []).map((q) => ({
        questionId: q.id,
        questionLabel: q.label.slice(0, 160),
        answer: (customAnswers[q.id] || '').trim().slice(0, 500),
      }));

      const batch = writeBatch(db);
      batch.set(lockRef, {
        eventId: selectedEvent.id,
        registrationId,
        createdAt: serverTimestamp(),
      });

      const payload: Record<string, unknown> = {
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title.slice(0, 160),
        registrationCode,
        lockId,
        fullName: cleanName,
        collegeEmail: cleanEmail,
        contactNumber: cleanPhone,
        collegeName: cleanCollege.slice(0, 180),
        department: cleanDept.slice(0, 120),
        academicYear: academicYear.slice(0, 40),
        registrationType,
        consentAccepted: true,
        status: 'confirmed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (studentId.trim()) {
        payload.studentId = studentId.trim().slice(0, 60);
      }
      if (registrationType === 'team') {
        payload.teamName = teamName.trim().slice(0, 120);
        payload.teamMembers = teamMembers.map((tm) => ({
          name: tm.name.trim().slice(0, 120),
          email: tm.email.trim().toLowerCase().slice(0, 160),
          department: tm.department.trim().slice(0, 120),
          academicYear: tm.academicYear.slice(0, 40),
        }));
      }
      if (customAnswerList.length > 0) {
        payload.customAnswers = customAnswerList;
      }

      batch.set(regRef, payload);
      await batch.commit();

      setConfirmedTicket({
        registrationCode,
        eventTitle: selectedEvent.title,
        fullName: cleanName,
        collegeEmail: cleanEmail,
        registrationType,
        teamName: registrationType === 'team' ? teamName.trim() : undefined,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('permission') || msg.includes('already exists')) {
        setErrorMessage(
          'This email address is already registered for this event, or registrations have just closed.'
        );
      } else {
        setErrorMessage('Could not submit registration. Please verify your details and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Case 1: Selector when visiting /register without eventId
  if (!eventId) {
    return (
      <div className="bg-white text-[#08070C] min-h-[75vh]">
        <PageMeta
          title="Event Registration"
          description="Select an open AWS Student Builder Group – UCER event to complete your registration."
        />
        <section className="border-b border-[#08070C]/10 bg-[#FAFAFC]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-14 md:py-20">
            <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-3">
              Event Registration Portal
            </p>
            <h1
              className="font-display font-bold tracking-tight leading-[1.02]"
              style={{ fontSize: 'clamp(1.85rem, 5vw, 4rem)' }}
            >
              Join an Upcoming Event
            </h1>
          </div>
        </section>

        <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-14 md:py-20">
          {openEvents.length === 0 ? (
            <div className="border border-[#08070C]/15 bg-[#E4D5FF]/30 p-6 sm:p-10 max-w-2xl space-y-4">
              <p className="font-mono text-xs uppercase tracking-wider text-[#243A68]">
                No Open Registrations Currently
              </p>
              <h2 className="font-display text-2xl font-bold">
                There are no active event registration forms open right now.
              </h2>
              <p className="text-sm text-[#08070C]/75">
                Explore the Events page for upcoming schedules and past archives, or reach out via
                Contact Us to connect with the UCER community team.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/events"
                  className="px-5 py-2.5 bg-[#08070C] text-white text-sm font-medium"
                >
                  Browse Events
                </Link>
                <Link
                  to="/contact"
                  className="px-5 py-2.5 border border-[#08070C]/25 text-sm font-medium"
                >
                  Contact Community
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openEvents.map((ev) => {
                const isQrRegistration = ev.registrationCtaType === 'qr_poster';
                return (
                  <div
                    key={ev.id}
                    className="group border border-[#08070C]/15 bg-white flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:border-[#08070C]"
                  >
                    <div>
                      <ImageSlot
                        src={ev.posterUrl}
                        alt={ev.title}
                        slotLabel="Event Poster Slot"
                        aspectClass={ev.posterAspect || 'aspect-[4/3]'}
                        fit={ev.posterFit || 'cover'}
                        variant={ev.posterFit === 'contain' ? 'neutral' : 'lavender'}
                        roundedClass="rounded-none"
                        hoverZoom
                        className={
                          ev.posterFit === 'contain'
                            ? '!bg-white border-0 border-b border-[#08070C]/10'
                            : ''
                        }
                      />
                      <div className="p-5 sm:p-6 space-y-2">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-[#243A68]">
                          {ev.category} · {ev.dateDisplayOverride || formatDisplayDate(ev.startDate)}
                        </p>
                        <h2 className="font-display text-xl font-bold">{ev.title}</h2>
                        <p className="text-sm text-[#08070C]/75 line-clamp-2">{ev.shortDescription}</p>
                      </div>
                    </div>
                    <div className="px-5 sm:px-6 py-4 border-t border-[#08070C]/10">
                      <Link
                        to={isQrRegistration ? `/events/${ev.id}#poster-qr` : `/register/${ev.id}`}
                        className="w-full min-h-[44px] inline-flex items-center justify-center py-2.5 bg-[#08070C] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#243A68] active:scale-[0.98] transition-all"
                      >
                        {isQrRegistration ? 'View Poster & Scan QR' : 'Open Registration Form'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (loadingEvent) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-20">
        <div className="h-10 w-64 bg-[#F2F2F6] animate-pulse mb-6" />
        <div className="h-96 w-full bg-[#F2F2F6] animate-pulse" />
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-20 space-y-4">
        <PageMeta title="Event Not Found" description="Selected event does not exist." />
        <h1 className="font-display text-3xl font-bold">Selected Event Not Found</h1>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#08070C] text-white text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>View All Events</span>
        </Link>
      </div>
    );
  }

  const status = computeEventStatus(selectedEvent);
  const deadlinePassed = isDeadlinePassed(selectedEvent.registrationDeadline);
  const isClosed = status === 'past' || !selectedEvent.registrationOpen || deadlinePassed;

  return (
    <div className="bg-white text-[#08070C] min-h-[75vh]">
      <PageMeta
        title={`Register — ${selectedEvent.title}`}
        description={`Official event registration form for ${selectedEvent.title}.`}
      />

      <div className="border-b border-[#08070C]/10 bg-[#FAFAFC]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-2">
          <Link
            to={`/events/${selectedEvent.id}`}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#243A68] hover:text-[#08070C]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Event Details</span>
          </Link>
          <span className="font-mono text-xs text-[#08070C]/60">
            {selectedEvent.eligibilityScope === 'ucer_only'
              ? 'Eligibility: UCER Students'
              : 'Eligibility: Open to All Colleges'}
          </span>
        </div>
      </div>

      <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-8 sm:py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-10 items-start">
        {/* Selected Event Summary Sidebar */}
        <aside className="lg:col-span-4 border border-[#08070C]/15 bg-[#DCE4F5]/30 p-5 sm:p-6 space-y-4 sm:space-y-5 lg:sticky lg:top-24">
          <ImageSlot
            src={selectedEvent.posterUrl}
            alt={selectedEvent.title}
            slotLabel="Event Poster Slot"
            aspectClass={selectedEvent.posterAspect || 'aspect-[4/3]'}
            fit={selectedEvent.posterFit || 'cover'}
            variant={selectedEvent.posterFit === 'contain' ? 'neutral' : 'lavender'}
            className={selectedEvent.posterFit === 'contain' ? '!bg-white' : ''}
          />
          <div className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#243A68]">
              Selected Event
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              {selectedEvent.title}
            </h2>
            <p className="text-sm text-[#08070C]/75 leading-relaxed">
              {selectedEvent.shortDescription}
            </p>
          </div>
          <div className="pt-3 border-t border-[#08070C]/10 space-y-2 font-mono text-xs text-[#08070C]/80">
            <p>
              Date: {selectedEvent.dateDisplayOverride || formatDisplayDate(selectedEvent.startDate)}
            </p>
            {selectedEvent.timeLabel && <p>Time: {selectedEvent.timeLabel}</p>}
            <p>{selectedEvent.mode ? `Mode: ${selectedEvent.mode}` : `Venue: ${selectedEvent.venue}`}</p>
            {selectedEvent.registrationDeadline && (
              <p>Deadline: {formatDisplayDate(selectedEvent.registrationDeadline)}</p>
            )}
          </div>
        </aside>

        {/* Registration Form or Confirmation Ticket */}
        <div className="lg:col-span-8">
          {confirmedTicket ? (
            <RevealSection className="border-2 border-[#08070C] bg-[#E4D5FF]/30 p-5 sm:p-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-[#243A68] font-mono text-xs uppercase tracking-wider font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#08070C]" />
                    <span>Registration Confirmed</span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
                    You are registered.
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 border border-[#08070C]/25 bg-white text-xs font-mono uppercase tracking-wider hover:border-[#08070C] cursor-pointer self-start"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Pass</span>
                </button>
              </div>

              <div className="bg-white border border-[#08070C]/15 p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/55">
                    Unique Registration ID
                  </p>
                  <p className="font-mono text-xl font-bold text-[#243A68] mt-1 tabular-nums">
                    {confirmedTicket.registrationCode}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/55">
                    Event
                  </p>
                  <p className="text-sm font-semibold mt-1">{confirmedTicket.eventTitle}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/55">
                    Participant
                  </p>
                  <p className="text-sm font-medium mt-1">{confirmedTicket.fullName}</p>
                  <p className="text-xs text-[#08070C]/65">{confirmedTicket.collegeEmail}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/55">
                    Format
                  </p>
                  <p className="text-sm font-medium capitalize mt-1">
                    {confirmedTicket.registrationType}
                    {confirmedTicket.teamName ? ` — ${confirmedTicket.teamName}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/events/${selectedEvent.id}`}
                  className="px-5 py-2.5 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68] transition-colors"
                >
                  Back to Event Details
                </Link>
                <Link
                  to="/events"
                  className="px-5 py-2.5 border border-[#08070C]/25 bg-white text-sm font-medium hover:border-[#08070C] transition-colors"
                >
                  Explore Other Events
                </Link>
              </div>
            </RevealSection>
          ) : selectedEvent.registrationCtaType === 'qr_poster' ? (
            <div className="border border-[#08070C]/15 bg-[#E4D5FF]/30 p-5 sm:p-10 space-y-4">
              <p className="font-mono text-xs uppercase tracking-wider text-[#243A68]">
                Registration via Official Poster
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                {selectedEvent.registrationNote || 'Register Now — Scan the QR code on the poster.'}
              </h1>
              <p className="text-sm text-[#08070C]/75 leading-relaxed">
                Please scan the official QR code displayed on the event poster to complete your
                registration.
              </p>
              <Link
                to={`/events/${selectedEvent.id}#poster-qr`}
                className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-3 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68] transition-colors"
              >
                Open Full Event Details &amp; Poster
              </Link>
            </div>
          ) : isClosed ? (
            <div className="border border-[#08070C]/15 bg-[#F7F7FA] p-5 sm:p-10 space-y-4">
              <p className="font-mono text-xs uppercase tracking-wider text-[#243A68]">
                Registrations Unavailable
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                Registrations for this event are closed.
              </h1>
              <p className="text-sm text-[#08070C]/75">
                {deadlinePassed
                  ? 'The registration deadline for this event has passed.'
                  : 'Administrators have closed submissions for this event.'}
              </p>
              <Link
                to="/events"
                className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-3 bg-[#08070C] text-white text-sm font-medium"
              >
                Explore Open Events
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="border border-[#08070C]/15 p-5 sm:p-10 space-y-6 bg-white"
              noValidate
            >
              <div className="border-b border-[#08070C]/10 pb-4 sm:pb-5">
                <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-2">
                  Registration Form
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                  Participant Details
                </h1>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-900 text-sm"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Registration Mode Switcher */}
              {selectedEvent.registrationMode === 'both' && (
                <div className="space-y-2">
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#08070C]/75">
                    Participation Type *
                  </label>
                  <div className="flex sm:inline-flex w-full sm:w-auto border border-[#08070C]/20 p-1 bg-[#F4F4F8]">
                    {(['individual', 'team'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setRegistrationType(mode)}
                        className={`flex-1 sm:flex-initial min-h-[40px] px-4 py-2 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors ${
                          registrationType === mode
                            ? 'bg-[#08070C] text-white'
                            : 'text-[#08070C]/70'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#08070C]/75 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 focus:border-[#08070C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#08070C]/75 mb-1.5">
                    College Email *
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={160}
                    value={collegeEmail}
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    placeholder="name@college.edu"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 focus:border-[#08070C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#08070C]/75 mb-1.5">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={20}
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91 98XXXXXXXX"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 focus:border-[#08070C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#08070C]/75 mb-1.5">
                    College Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={180}
                    value={collegeName}
                    readOnly={selectedEvent.eligibilityScope === 'ucer_only'}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 focus:border-[#08070C] focus:outline-none ${
                      selectedEvent.eligibilityScope === 'ucer_only' ? 'bg-[#F4F4F8]' : 'bg-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#08070C]/75 mb-1.5">
                    Department / Branch *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. CSE, IT, ECE, AIML"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 focus:border-[#08070C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#08070C]/75 mb-1.5">
                    Academic Year *
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 focus:border-[#08070C] focus:outline-none bg-white"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#08070C]/75 mb-1.5">
                    Student ID / Roll Number {selectedEvent.requireStudentId ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="text"
                    required={Boolean(selectedEvent.requireStudentId)}
                    maxLength={60}
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="University Roll No. or College ID"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 focus:border-[#08070C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Team Details Section */}
              {registrationType === 'team' && (
                <div className="pt-5 border-t border-[#08070C]/10 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold">Team Information</h3>
                      <p className="text-xs text-[#08070C]/65">
                        You are registered as Team Lead. Add up to{' '}
                        {Math.max(0, (selectedEvent.maxTeamSize || 4) - 1)} additional teammates.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addTeamMemberRow}
                      disabled={
                        teamMembers.length >= Math.max(0, (selectedEvent.maxTeamSize || 4) - 1)
                      }
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 border border-[#08070C]/25 text-xs font-mono uppercase tracking-wider hover:border-[#08070C] disabled:opacity-40 cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Member</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#08070C]/75 mb-1.5">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter your team name"
                      className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 focus:border-[#08070C] focus:outline-none"
                    />
                  </div>

                  {teamMembers.map((member, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-[#08070C]/15 bg-[#FAFAFC] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-wider text-[#243A68]">
                          Team Member {idx + 2}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTeamMember(idx)}
                          className="text-red-700 hover:text-red-900 p-2 -mr-1 cursor-pointer"
                          aria-label={`Remove team member ${idx + 2}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={member.name}
                          onChange={(e) => updateTeamMember(idx, 'name', e.target.value)}
                          className="px-3 py-2 text-base sm:text-sm border border-[#08070C]/20 bg-white"
                        />
                        <input
                          type="email"
                          placeholder="College Email *"
                          value={member.email}
                          onChange={(e) => updateTeamMember(idx, 'email', e.target.value)}
                          className="px-3 py-2 text-base sm:text-sm border border-[#08070C]/20 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Department"
                          value={member.department}
                          onChange={(e) => updateTeamMember(idx, 'department', e.target.value)}
                          className="px-3 py-2 text-base sm:text-sm border border-[#08070C]/20 bg-white"
                        />
                        <select
                          value={member.academicYear}
                          onChange={(e) => updateTeamMember(idx, 'academicYear', e.target.value)}
                          className="px-3 py-2 text-base sm:text-sm border border-[#08070C]/20 bg-white"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Event-Specific Custom Questions */}
              {selectedEvent.customQuestions && selectedEvent.customQuestions.length > 0 && (
                <div className="pt-5 border-t border-[#08070C]/10 space-y-4">
                  <h3 className="font-display text-lg font-bold">Event-Specific Questions</h3>
                  {selectedEvent.customQuestions.map((q) => (
                    <div key={q.id}>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#08070C]/75 mb-1.5">
                        {q.label} {q.required ? '*' : ''}
                      </label>
                      {q.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          required={q.required}
                          maxLength={500}
                          value={customAnswers[q.id] || ''}
                          onChange={(e) =>
                            setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 focus:border-[#08070C] focus:outline-none"
                        />
                      ) : q.type === 'select' ? (
                        <select
                          required={q.required}
                          value={customAnswers[q.id] || ''}
                          onChange={(e) =>
                            setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 bg-white focus:border-[#08070C] focus:outline-none"
                        >
                          <option value="">Select an option</option>
                          {(q.options || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required={q.required}
                          maxLength={500}
                          value={customAnswers[q.id] || ''}
                          onChange={(e) =>
                            setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#08070C]/25 focus:border-[#08070C] focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Consent */}
              <div className="pt-4 border-t border-[#08070C]/10">
                <label className="flex items-start gap-3 text-sm text-[#08070C]/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#08070C]"
                  />
                  <span>
                    I confirm that the submitted details are accurate and agree to abide by the
                    event guidelines of Student Builder Group – AWS at UCER.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68] active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? 'Submitting Registration...' : 'Confirm Registration'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
