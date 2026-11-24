import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  ArrowUpRight,
  Users,
  Award,
  Mic,
  Video,
  CheckCircle2,
  QrCode,
  Maximize2,
  X,
} from 'lucide-react';
import { db } from '../firebase';
import { usePlatform } from '../context/PlatformContext';
import type { CommunityEvent } from '../types';
import { PageMeta } from '../components/PageMeta';
import { ImageSlot } from '../components/ImageSlot';
import { RevealSection } from '../components/MotionPrimitives';
import { computeEventStatus, formatDisplayDate, isDeadlinePassed } from '../utils/validation';

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { events } = usePlatform();
  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [posterZoomOpen, setPosterZoomOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const matched = events.find((e) => e.id === eventId || e.slug === eventId);
    if (matched) {
      setEvent(matched);
      setLoading(false);
      return;
    }

    async function fetchDirect() {
      if (!eventId) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'events', eventId));
        if (active && snap.exists()) {
          setEvent({ id: snap.id, ...(snap.data() as Omit<CommunityEvent, 'id'>) });
        }
      } catch {
        // Handled by not-found view
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchDirect();
    return () => {
      active = false;
    };
  }, [eventId, events]);

  if (loading) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-20">
        <div className="h-8 w-48 bg-[#F2F2F6] animate-pulse mb-6" />
        <div className="h-64 w-full bg-[#F2F2F6] animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-20 space-y-4">
        <PageMeta title="Event Not Found" description="Requested event could not be found." />
        <h1 className="font-display text-3xl font-bold">Event Not Found</h1>
        <p className="text-sm text-[#08070C]/70">
          This event may have been unpublished or removed.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#08070C] text-white text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>
      </div>
    );
  }

  const computedStatus = computeEventStatus(event);
  const expired = isDeadlinePassed(event.registrationDeadline);
  const canRegister = computedStatus !== 'past' && event.registrationOpen && !expired;
  const isQrRegistration = event.registrationCtaType === 'qr_poster';
  const isVirtual = (event.mode || event.venue).toLowerCase() === 'virtual';

  return (
    <div className="bg-white text-[#08070C]">
      <PageMeta title={event.title} description={event.shortDescription} />

      {/* Top Breadcrumb */}
      <div className="border-b border-[#08070C]/10 bg-[#FAFAFC]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-4">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#243A68] hover:text-[#08070C]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Events</span>
          </Link>
        </div>
      </div>

      {/* Hero Split */}
      <section className="border-b border-[#08070C]/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-8 sm:py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-10 items-start">
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-wider text-[#243A68]">
              <span>{event.category}</span>
              <span aria-hidden="true">·</span>
              <span>{computedStatus}</span>
              <span aria-hidden="true">·</span>
              <span>
                {event.eligibilityLabel ||
                  (event.eligibilityScope === 'ucer_only'
                    ? 'UCER Students Only'
                    : 'Open to All Colleges')}
              </span>
            </div>

            <div className="space-y-3">
              <h1
                className="font-display font-bold tracking-tight leading-[1.06] sm:leading-[1.02] text-balance"
                style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3.75rem)' }}
              >
                {event.title}
              </h1>
              {event.organiser && (
                <p className="font-mono text-xs uppercase tracking-wider text-[#08070C]/65">
                  Organised by {event.organiser}
                </p>
              )}
            </div>

            <p className="text-base sm:text-lg text-[#08070C]/75 leading-relaxed">
              {event.shortDescription}
            </p>

            {/* Key Logistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-5 border-t border-[#08070C]/10">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#FF9900] mt-1 shrink-0" />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/55">
                    Date
                  </p>
                  <p className="text-sm font-medium">
                    {event.dateDisplayOverride ||
                      `${formatDisplayDate(event.startDate)}${
                        event.endDate && event.endDate !== event.startDate
                          ? ` – ${formatDisplayDate(event.endDate)}`
                          : ''
                      }`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#243A68] mt-1 shrink-0" />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/55">
                    Time
                  </p>
                  <p className="text-sm font-medium">{event.timeLabel || 'Schedule TBA'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {isVirtual ? (
                  <Video className="w-4 h-4 text-[#243A68] mt-1 shrink-0" />
                ) : (
                  <MapPin className="w-4 h-4 text-[#243A68] mt-1 shrink-0" />
                )}
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/55">
                    {event.mode ? 'Mode' : 'Venue'}
                  </p>
                  <p className="text-sm font-medium">{event.mode || event.venue}</p>
                </div>
              </div>

              {event.speaker ? (
                <div className="flex items-start gap-3">
                  <Mic className="w-4 h-4 text-[#FF9900] mt-1 shrink-0" />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/55">
                      Speaker
                    </p>
                    <p className="text-sm font-medium">{event.speaker}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-[#FF9900] mt-1 shrink-0" />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/55">
                      Participation Mode
                    </p>
                    <p className="text-sm font-medium capitalize">
                      {event.registrationMode === 'both'
                        ? `Individual or Team (Max ${event.maxTeamSize || 4})`
                        : event.registrationMode === 'team'
                          ? `Team (Max ${event.maxTeamSize || 4})`
                          : 'Individual'}
                    </p>
                  </div>
                </div>
              )}

              {event.eligibilityLabel && (
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-[#243A68] mt-1 shrink-0" />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/55">
                      Eligibility
                    </p>
                    <p className="text-sm font-medium">{event.eligibilityLabel}</p>
                  </div>
                </div>
              )}

              {event.prerequisites && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#FF9900] mt-1 shrink-0" />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/55">
                      Prerequisites
                    </p>
                    <p className="text-sm font-medium">{event.prerequisites}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Registration CTA */}
            {isQrRegistration ? (
              <div className="pt-2 sm:pt-4">
                <div className="border border-[#08070C]/15 bg-[#E4D5FF]/35 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <QrCode className="w-5 h-5 text-[#243A68] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-[#243A68] font-semibold">
                        Registration
                      </p>
                      <p className="text-sm sm:text-base font-medium text-[#08070C] mt-0.5">
                        {event.registrationNote || 'Register Now — Scan the QR code on the poster.'}
                      </p>
                    </div>
                  </div>
                  {event.posterUrl && (
                    <button
                      type="button"
                      onClick={() => setPosterZoomOpen(true)}
                      className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#08070C] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#243A68] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-[#FF9900]" />
                      <span>Enlarge Poster QR</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-4">
                {canRegister ? (
                  <Link
                    to={`/register/${event.id}`}
                    className="group w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68] active:scale-[0.98] transition-all"
                  >
                    <span>Register Now</span>
                    <ArrowUpRight className="w-4 h-4 text-[#FF9900] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                ) : (
                  <span className="px-6 py-3.5 bg-[#F4F4F8] border border-[#08070C]/15 text-sm font-medium text-[#08070C]/65">
                    {computedStatus === 'past'
                      ? 'Event Completed & Archived'
                      : expired
                        ? 'Registration Deadline Passed'
                        : 'Registrations Currently Closed'}
                  </span>
                )}

                {event.registrationDeadline && (
                  <span className="font-mono text-xs text-[#08070C]/65">
                    Deadline: {formatDisplayDate(event.registrationDeadline)}
                  </span>
                )}
              </div>
            )}
          </div>

          <div id="poster-qr" className="lg:col-span-5 max-w-md mx-auto lg:max-w-none w-full space-y-3">
            <div className="bg-white border border-[#08070C]/15 rounded-2xl overflow-hidden shadow-xs">
              <ImageSlot
                src={event.posterUrl}
                alt={`${event.title} official poster`}
                slotLabel="Event Poster / Banner Slot"
                aspectClass={event.posterAspect || 'aspect-[4/3]'}
                fit={event.posterFit || 'cover'}
                variant={event.posterFit === 'contain' ? 'neutral' : 'lavender'}
                roundedClass="rounded-none"
                priority
                className={event.posterFit === 'contain' ? '!bg-white border-0' : 'border-0'}
              />
            </div>
            {event.posterUrl && isQrRegistration && (
              <div className="flex items-center justify-between gap-3 px-1">
                <p className="font-mono text-[11px] text-[#08070C]/65">
                  Official event poster with registration QR code
                </p>
                <button
                  type="button"
                  onClick={() => setPosterZoomOpen(true)}
                  className="inline-flex items-center gap-1.5 py-1.5 px-2 -mr-2 font-mono text-[11px] uppercase tracking-wider text-[#243A68] hover:text-[#08070C] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Full View</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content & Details */}
      <RevealSection className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
        <div className="lg:col-span-8 space-y-8 sm:space-y-12">
          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest text-[#243A68]">
              About This Event
            </p>
            <div className="text-base text-[#08070C]/85 leading-relaxed whitespace-pre-line max-w-2xl">
              {event.fullDescription}
            </div>
          </div>

          {event.instructions && (
            <div className="bg-[#DCE4F5]/40 border border-[#243A68]/15 p-6 sm:p-8 space-y-3">
              <p className="font-mono text-xs uppercase tracking-widest text-[#243A68]">
                Important Instructions
              </p>
              <div className="text-sm text-[#08070C]/85 leading-relaxed whitespace-pre-line">
                {event.instructions}
              </div>
            </div>
          )}

          {event.highlights && event.highlights.length > 0 && (
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-widest text-[#243A68]">
                {event.highlightsTitle || 'Event Highlights'}
              </p>
              <ul className="divide-y divide-[#08070C]/10 border-y border-[#08070C]/10">
                {event.highlights.map((hl, i) => (
                  <li key={i} className="py-3.5 flex items-baseline gap-4 text-sm sm:text-base">
                    <span className="font-mono text-xs text-[#FF9900] tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(event.winnersSummary || event.participationSummary) && (
            <div className="bg-[#E4D5FF]/35 border border-[#08070C]/15 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-[#243A68]">
                <Award className="w-5 h-5" />
                <p className="font-mono text-xs uppercase tracking-widest font-semibold">
                  Archive Outcomes &amp; Recognition
                </p>
              </div>
              {event.participationSummary && (
                <p className="text-sm font-medium text-[#08070C]">
                  {event.participationSummary}
                </p>
              )}
              {event.winnersSummary && (
                <p className="text-sm text-[#08070C]/80 whitespace-pre-line leading-relaxed">
                  {event.winnersSummary}
                </p>
              )}
            </div>
          )}

          {/* Event Gallery */}
          {(computedStatus === 'past' ||
            (event.galleryUrls && event.galleryUrls.length > 0)) && (
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-widest text-[#243A68]">
                Event Gallery
              </p>
              {event.galleryUrls && event.galleryUrls.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.galleryUrls.map((url, idx) => (
                    <ImageSlot
                      key={idx}
                      src={url}
                      alt={`${event.title} gallery photo ${idx + 1}`}
                      slotLabel={`Gallery Photo ${idx + 1}`}
                      aspectClass="aspect-[4/3]"
                      variant="neutral"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageSlot
                    alt="Event gallery photo slot 1"
                    slotLabel="Event Gallery Slot 01"
                    aspectClass="aspect-[4/3]"
                    variant="pale"
                  />
                  <ImageSlot
                    alt="Event gallery photo slot 2"
                    slotLabel="Event Gallery Slot 02"
                    aspectClass="aspect-[4/3]"
                    variant="lavender"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Organising Team Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="border border-[#08070C]/15 p-6 space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest text-[#243A68]">
              Organising Team
            </p>
            {event.organisingTeamNames && event.organisingTeamNames.length > 0 ? (
              <ul className="space-y-2 text-sm text-[#08070C]/85">
                {event.organisingTeamNames.map((name, i) => (
                  <li key={i} className="py-1.5 border-b border-[#08070C]/10 last:border-b-0">
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#08070C]/65">
                Organised by Student Builder Group – AWS at UCER Prayagraj.
              </p>
            )}
          </div>
        </aside>
      </RevealSection>

      {/* Full-Resolution Poster Modal for QR Code Scanning */}
      {posterZoomOpen && event.posterUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${event.title} full resolution poster`}
          onClick={() => setPosterZoomOpen(false)}
          className="fixed inset-0 z-50 bg-[#08070C]/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white border border-[#08070C]/20 max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 px-3.5 sm:px-4 py-3 border-b border-[#08070C]/10">
              <p className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[#243A68] truncate">
                Official Poster · Scan QR Code to Register
              </p>
              <button
                type="button"
                onClick={() => setPosterZoomOpen(false)}
                aria-label="Close full poster view"
                className="w-10 h-10 sm:w-8 sm:h-8 inline-flex items-center justify-center border border-[#08070C]/15 hover:border-[#08070C] cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 sm:p-5 overflow-auto flex items-center justify-center bg-white">
              <img
                src={event.posterUrl}
                alt={`${event.title} full poster`}
                referrerPolicy="no-referrer"
                className="max-h-[80vh] w-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
