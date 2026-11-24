import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Search, Award, Video } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { PageMeta } from '../components/PageMeta';
import { ImageSlot } from '../components/ImageSlot';
import { RevealSection, StaggerGrid, StaggerItem } from '../components/MotionPrimitives';
import { computeEventStatus, formatDisplayDate, isDeadlinePassed } from '../utils/validation';

type EventTab = 'upcoming' | 'ongoing' | 'past';

export function EventsPage() {
  const { events } = usePlatform();
  const [activeTab, setActiveTab] = useState<EventTab>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  const categorized = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const upcoming: typeof events = [];
    const ongoing: typeof events = [];
    const past: typeof events = [];

    for (const ev of events) {
      if (
        q &&
        !ev.title.toLowerCase().includes(q) &&
        !ev.category.toLowerCase().includes(q) &&
        !ev.venue.toLowerCase().includes(q)
      ) {
        continue;
      }
      const status = computeEventStatus(ev);
      if (status === 'ongoing') ongoing.push(ev);
      else if (status === 'past') past.push(ev);
      else upcoming.push(ev);
    }
    return { upcoming, ongoing, past };
  }, [events, searchQuery]);

  const currentList = categorized[activeTab];

  return (
    <div className="bg-white text-[#08070C] min-h-[75vh]">
      <PageMeta
        title="Events & Archive"
        description="Explore upcoming workshops, ongoing hackathons, and past event archives of AWS Student Builder Group – UCER, Prayagraj."
      />

      {/* Editorial Header */}
      <section className="border-b border-[#08070C]/10 bg-[#FAFAFC]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-14 md:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-4">
            Events &amp; Activities · UCER Prayagraj
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <h1
              className="lg:col-span-7 font-display font-bold tracking-tight leading-[0.98]"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}
            >
              Workshops, Hackathons &amp; Archive
            </h1>
            <p className="lg:col-span-5 text-sm sm:text-base text-[#08070C]/75 leading-relaxed">
              Live schedules, hands-on technical sessions, and archived community highlights—updated
              dynamically as events progress.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs & Search */}
      <section className="border-b border-[#08070C]/10 bg-white sticky top-16 md:top-[72px] z-30">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-[#F4F4F8] p-1 w-fit">
            {(
              [
                { id: 'upcoming', label: 'Upcoming Events', count: categorized.upcoming.length },
                { id: 'ongoing', label: 'Ongoing Events', count: categorized.ongoing.length },
                { id: 'past', label: 'Past Events', count: categorized.past.length },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#08070C] text-white'
                    : 'text-[#08070C]/70 hover:text-[#08070C]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#08070C]/45 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events or venues..."
              aria-label="Search events"
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#08070C]/20 focus:border-[#08070C] focus:outline-none bg-white"
            />
          </div>
        </div>
      </section>

      {/* Event List */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-14 md:py-20">
        {currentList.length === 0 ? (
          <RevealSection className="border border-[#08070C]/15 bg-[#DCE4F5]/30 p-10 md:p-14 max-w-3xl space-y-3">
            <p className="font-mono text-xs uppercase tracking-wider text-[#243A68]">
              {activeTab === 'upcoming'
                ? 'No Upcoming Events Published'
                : activeTab === 'ongoing'
                  ? 'No Ongoing Events Right Now'
                  : 'Past Events Archive Empty'}
            </p>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {activeTab === 'upcoming'
                ? 'New workshops and sessions will appear here once published.'
                : activeTab === 'ongoing'
                  ? 'Check Upcoming Events for scheduled sessions.'
                  : 'Completed events with galleries and highlights will be archived here.'}
            </h2>
            <p className="text-sm text-[#08070C]/70 leading-relaxed">
              Events are managed directly from the Admin Dashboard and transition automatically based
              on their scheduled dates.
            </p>
          </RevealSection>
        ) : (
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {currentList.map((ev) => {
              const expired = isDeadlinePassed(ev.registrationDeadline);
              const canRegister =
                activeTab !== 'past' && ev.registrationOpen && !expired;
              const isQrRegistration = ev.registrationCtaType === 'qr_poster';
              const isVirtual = (ev.mode || ev.venue).toLowerCase() === 'virtual';

              return (
                <StaggerItem key={ev.id} className="flex">
                  <article className="group w-full border border-[#08070C]/15 bg-white flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:border-[#08070C]">
                    <div>
                      <Link to={`/events/${ev.id}`} className="block">
                        <ImageSlot
                          src={ev.posterUrl}
                          alt={`${ev.title} poster`}
                          slotLabel="Event Poster Slot"
                          aspectClass={ev.posterAspect || 'aspect-[4/3]'}
                          fit={ev.posterFit || 'cover'}
                          variant={
                            ev.posterFit === 'contain'
                              ? 'neutral'
                              : activeTab === 'past'
                                ? 'pale'
                                : 'lavender'
                          }
                          roundedClass="rounded-none"
                          hoverZoom
                          className={
                            ev.posterFit === 'contain'
                              ? '!bg-white border-0 border-b border-[#08070C]/10'
                              : ''
                          }
                        />
                      </Link>

                      <div className="p-6 space-y-3">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-[#243A68]">
                          <span>{ev.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {ev.eligibilityLabel ||
                              (ev.eligibilityScope === 'ucer_only' ? 'UCER Students' : 'Open College')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className={canRegister ? 'text-[#08070C] font-semibold' : 'text-[#08070C]/50'}>
                            {activeTab === 'past'
                              ? 'Archived'
                              : isQrRegistration
                                ? 'Poster QR'
                                : canRegister
                                  ? 'Open'
                                  : 'Closed'}
                          </span>
                        </div>

                        <h2 className="font-display text-2xl font-bold tracking-tight text-balance">
                          <Link to={`/events/${ev.id}`} className="hover:text-[#243A68] transition-colors">
                            {ev.title}
                          </Link>
                        </h2>

                        <p className="text-sm text-[#08070C]/75 leading-relaxed line-clamp-3">
                          {ev.shortDescription}
                        </p>

                        <div className="pt-2 space-y-1.5 text-xs font-mono text-[#08070C]/70">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#FF9900] shrink-0" />
                            <span>
                              {ev.dateDisplayOverride || formatDisplayDate(ev.startDate)}
                              {ev.timeLabel ? ` · ${ev.timeLabel}` : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isVirtual ? (
                              <Video className="w-3.5 h-3.5 text-[#243A68] shrink-0" />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 text-[#243A68] shrink-0" />
                            )}
                            <span className="truncate">
                              {ev.mode ? `Mode: ${ev.mode}` : ev.venue}
                            </span>
                          </div>
                          {activeTab === 'past' && ev.participationSummary && (
                            <div className="flex items-center gap-2 pt-1 text-[#243A68]">
                              <Award className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{ev.participationSummary}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-[#08070C]/10 flex items-center justify-between gap-3">
                      <Link
                        to={`/events/${ev.id}`}
                        className="text-sm font-medium inline-flex items-center gap-1.5 hover:text-[#243A68] transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                      </Link>

                      {canRegister && (
                        <Link
                          to={isQrRegistration ? `/events/${ev.id}#poster-qr` : `/register/${ev.id}`}
                          className="px-4 py-2 bg-[#08070C] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#243A68] active:scale-[0.98] transition-all"
                        >
                          {isQrRegistration ? 'Scan Poster QR' : 'Register'}
                        </Link>
                      )}
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        )}
      </section>
    </div>
  );
}
