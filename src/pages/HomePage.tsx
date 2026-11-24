import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Cloud,
  Cpu,
  Terminal,
  Trophy,
  Code2,
  Users,
  Compass,
  Calendar,
  MapPin,
  Video,
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { PageMeta } from '../components/PageMeta';
import { ImageSlot } from '../components/ImageSlot';
import { RevealSection, StaggerGrid, StaggerItem } from '../components/MotionPrimitives';
import { computeEventStatus, formatDisplayDate } from '../utils/validation';

const WHAT_WE_DO = [
  {
    num: '01',
    title: 'Cloud Computing and AWS',
    desc: 'Hands-on architecture labs exploring compute, storage, serverless workflows, and cloud-native infrastructure.',
    icon: Cloud,
    span: 'md:col-span-7',
    bg: 'bg-[#DCE4F5]/45',
  },
  {
    num: '02',
    title: 'Artificial Intelligence & Emerging Tech',
    desc: 'Applied machine learning, foundation model integration, and modern developer tooling.',
    icon: Cpu,
    span: 'md:col-span-5',
    bg: 'bg-white',
  },
  {
    num: '03',
    title: 'Technical Workshops',
    desc: 'Structured, live build-along sessions led by student practitioners and technical mentors.',
    icon: Terminal,
    span: 'md:col-span-4',
    bg: 'bg-white',
  },
  {
    num: '04',
    title: 'Hackathons & Innovation Challenges',
    desc: 'Campus sprints and problem-solving builds turning prototypes into working deployments.',
    icon: Trophy,
    span: 'md:col-span-4',
    bg: 'bg-[#E4D5FF]/40',
  },
  {
    num: '05',
    title: 'Project Development',
    desc: 'Collaborative engineering teams shipping open-source campus tools and cloud applications.',
    icon: Code2,
    span: 'md:col-span-4',
    bg: 'bg-white',
  },
  {
    num: '06',
    title: 'Peer-to-Peer Learning',
    desc: 'Cross-year study circles where seniors and peers mentor fellow students without hierarchy barriers.',
    icon: Users,
    span: 'md:col-span-6',
    bg: 'bg-white',
  },
  {
    num: '07',
    title: 'Community Building',
    desc: 'Connecting UCER builders with regional developer ecosystems, faculty guidance, and shared curiosity.',
    icon: Compass,
    span: 'md:col-span-6',
    bg: 'bg-[#DCE4F5]/35',
  },
];

const COLLAGE_SLOTS = [
  { label: '01 · Campus Outreach & Builder Desk', aspect: 'aspect-[4/3]' },
  { label: '02 · Student Conversations & Onboarding', aspect: 'aspect-[4/3]' },
  { label: '03 · AWS Career Showcase', aspect: 'aspect-[3/4]' },
  { label: '04 · Campus Pavilion Setup', aspect: 'aspect-[4/3]' },
  { label: '05 · Classroom Technical Session', aspect: 'aspect-[16/9]' },
  { label: '06 · AWS Builder Center Classroom Chalkboard', aspect: 'aspect-[16/10]' },
];

export function HomePage() {
  const { siteSettings, events, teamMembers, announcements } = usePlatform();

  const upcomingEvents = events
    .filter((ev) => {
      const status = computeEventStatus(ev);
      return status === 'upcoming' || status === 'ongoing';
    })
    .slice(0, 3);

  const featuredTeam = teamMembers.filter((m) => m.isFeatured).slice(0, 4);
  const previewTeam = featuredTeam.length > 0 ? featuredTeam : teamMembers.slice(0, 4);

  return (
    <div className="bg-white text-[#08070C]">
      <PageMeta
        title="Home"
        description="Student Builder Group – AWS at United College of Engineering & Research (UCER), Prayagraj, Uttar Pradesh, India. Learn. Connect. Build. Grow."
      />

      {/* Active Announcement Strip */}
      {announcements.length > 0 && (
        <div className="bg-[#DCE4F5]/65 border-b border-[#243A68]/15">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#243A68] font-semibold shrink-0">
                Announcement
              </span>
              <span className="text-[#08070C]/40" aria-hidden="true">
                /
              </span>
              <p className="truncate font-medium text-[#08070C]">
                {announcements[0].title} —{' '}
                <span className="font-normal text-[#08070C]/75">
                  {announcements[0].summary}
                </span>
              </p>
            </div>
            {announcements[0].linkUrl && (
              <Link
                to={announcements[0].linkUrl}
                className="font-mono text-xs uppercase tracking-wider text-[#243A68] hover:text-[#08070C] inline-flex items-center gap-1 shrink-0 transition-colors"
              >
                <span>{announcements[0].linkLabel || 'Read More'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 3.1 Hero Section */}
      <section className="relative overflow-hidden border-b border-[#08070C]/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 md:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Editorial Left Column */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 flex flex-col justify-between gap-8 lg:gap-10 py-1 lg:py-2"
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-display text-xl sm:text-[22px] font-bold tracking-tight text-[#08070C]">
                  Student Builder Group
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-[#243A68] border-l border-[#08070C]/20 pl-4">
                  UCER · Prayagraj
                </span>
              </div>

              <div className="space-y-7 lg:space-y-8 my-auto">
                <div className="space-y-5">
                  <h1
                    className="font-display font-bold tracking-[-0.035em] leading-[0.9] text-[#08070C] max-w-[11ch]"
                    style={{ fontSize: 'clamp(3.35rem, 7.4vw, 6.9rem)' }}
                  >
                    {siteSettings.heroHeadline}
                  </h1>
                  <div className="flex items-center gap-4 pt-1">
                    <span className="w-12 h-1.5 bg-[#FF9900] shrink-0" aria-hidden="true" />
                    <p className="font-editorial italic text-3xl sm:text-4xl lg:text-[2.65rem] text-[#243A68] tracking-tight leading-tight">
                      {siteSettings.heroSubheadline}
                    </p>
                  </div>
                </div>

                <p className="text-lg sm:text-xl lg:text-[1.375rem] text-[#08070C]/80 leading-[1.6] max-w-[46ch]">
                  {siteSettings.heroDescription}
                </p>
              </div>

              <div className="pt-6 border-t border-[#08070C]/12 flex flex-wrap items-center gap-4">
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-2.5 px-7 py-4 bg-[#08070C] text-white text-sm sm:text-base font-medium hover:bg-[#243A68] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0"
                >
                  <span>Explore Our Community</span>
                  <ArrowRight className="w-4 h-4 text-[#FF9900] transition-transform duration-150 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2.5 px-7 py-4 border border-[#08070C]/25 text-[#08070C] text-sm sm:text-base font-medium hover:border-[#08070C] hover:bg-[#E4D5FF]/35 active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0"
                >
                  <span>Discover Events</span>
                </Link>
              </div>
            </motion.div>

            {/* Editorial Overlapping Visual Right Column */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative max-w-lg mx-auto w-full lg:max-w-[465px] lg:ml-auto flex flex-col justify-between"
            >
              {/* Signature Lavender Geometric Panel */}
              <div
                className="absolute -top-5 -right-3 sm:-right-6 w-[88%] h-[88%] bg-[#E4D5FF] rounded-3xl pointer-events-none"
                aria-hidden="true"
              />
              {/* Orange Accent Bar */}
              <div
                className="hidden sm:block absolute -left-3 bottom-12 w-6 h-24 bg-[#FF9900] z-20"
                aria-hidden="true"
              />

              <div className="relative z-10 space-y-4">
                <ImageSlot
                  src={siteSettings.heroPhotoUrl}
                  alt="AWS Student Builder Group – UCER community poster and photographs"
                  slotLabel="Hero Community Photograph Slot (Upload via Admin)"
                  aspectClass="aspect-[3/4]"
                  fit="contain"
                  variant="neutral"
                  roundedClass="rounded-2xl"
                  priority
                  className="shadow-sm !bg-white"
                />

                <div className="grid grid-cols-12 gap-4 items-stretch">
                  <div className="col-span-7 bg-white border border-[#08070C]/15 p-4 sm:p-5 rounded-xl flex flex-col justify-center">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[#243A68] font-medium">
                      Student Builder Group – AWS
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-[#08070C] mt-1">
                      United College of Engineering &amp; Research
                    </p>
                    <p className="font-mono text-[11px] text-[#08070C]/60 mt-0.5">
                      Prayagraj, Uttar Pradesh, India
                    </p>
                  </div>
                  <div className="col-span-5">
                    <ImageSlot
                      src={siteSettings.campusSessionPhotoUrl}
                      alt="Campus session at UCER Prayagraj"
                      slotLabel="Campus Session Slot"
                      aspectClass="aspect-[4/3]"
                      fit="cover"
                      variant="lavender"
                      roundedClass="rounded-xl"
                      priority
                      className="h-full shadow-xs"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3.2 Introduction */}
      <section className="border-b border-[#08070C]/10 bg-[#FFFFFF]">
        <RevealSection className="max-w-[1360px] mx-auto px-4 sm:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-4">
              <p className="font-mono text-xs uppercase tracking-widest text-[#243A68]">
                01 · Identity &amp; Purpose
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] text-balance">
                {siteSettings.introTitle}
              </h2>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <p className="text-base sm:text-lg text-[#08070C]/80 leading-relaxed max-w-2xl">
                {siteSettings.introBody}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-7 border-t border-[#08070C]/10">
                <div>
                  <h3 className="font-display text-base font-semibold">Accessible Cloud</h3>
                  <p className="text-sm text-[#08070C]/70 mt-1.5 leading-relaxed">
                    Breaking down cloud computing concepts for beginners and advanced builders alike.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold">Hands-On Engineering</h3>
                  <p className="text-sm text-[#08070C]/70 mt-1.5 leading-relaxed">
                    Moving from theory to real deployments, labs, and working architectures.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold">Real Student Projects</h3>
                  <p className="text-sm text-[#08070C]/70 mt-1.5 leading-relaxed">
                    Encouraging students to design, ship, and showcase practical software solutions.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold">Peer Ecosystem</h3>
                  <p className="text-sm text-[#08070C]/70 mt-1.5 leading-relaxed">
                    Connecting students across departments with technology, mentors, and peers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* 3.3 What We Do */}
      <section className="border-b border-[#08070C]/10 bg-[#FAFAFC]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-16 md:py-24">
          <RevealSection className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-3">
                02 · Core Disciplines
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-balance">
                What We Build &amp; Practise
              </h2>
            </div>
            <p className="text-sm text-[#08070C]/70 max-w-md leading-relaxed">
              Seven structured pillars driving technical curiosity and peer execution across campus.
            </p>
          </RevealSection>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {WHAT_WE_DO.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.num} className={`${item.span} flex`}>
                  <article
                    className={`w-full ${item.bg} border border-[#08070C]/12 p-6 sm:p-8 flex flex-col justify-between gap-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#08070C]/40 hover:shadow-xs`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-[#243A68] tabular-nums">
                        {item.num}.
                      </span>
                      <Icon className="w-5 h-5 text-[#08070C]/75" strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold tracking-tight mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[#08070C]/75 leading-relaxed">{item.desc}</p>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* 3.4 Upcoming Events */}
      <section className="border-b border-[#08070C]/10 bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-16 md:py-24">
          <RevealSection className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-3">
                03 · Calendar &amp; Activities
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
                Upcoming Events
              </h2>
            </div>
            <Link
              to="/events"
              className="group inline-flex items-center gap-2 text-sm font-medium text-[#08070C] hover:text-[#243A68] underline underline-offset-4 whitespace-nowrap shrink-0 transition-colors"
            >
              <span>View All Events &amp; Archive</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
            </Link>
          </RevealSection>

          {upcomingEvents.length === 0 ? (
            <RevealSection className="border border-[#08070C]/15 bg-[#DCE4F5]/30 p-10 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <p className="font-mono text-xs uppercase tracking-wider text-[#243A68]">
                  Schedule Pending Publication
                </p>
                <h3 className="font-display text-2xl font-bold tracking-tight">
                  Upcoming sessions will appear here automatically.
                </h3>
                <p className="text-sm text-[#08070C]/70 leading-relaxed">
                  Once community administrators publish an event in the Admin Dashboard, its poster,
                  venue, schedule, and registration link appear here in real time.
                </p>
              </div>
              <Link
                to="/events"
                className="px-5 py-3 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68] transition-colors whitespace-nowrap shrink-0"
              >
                Browse Past Archive
              </Link>
            </RevealSection>
          ) : (
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((ev) => {
                const isQrRegistration = ev.registrationCtaType === 'qr_poster';
                const isVirtual = (ev.mode || ev.venue).toLowerCase() === 'virtual';
                return (
                  <StaggerItem key={ev.id} className="flex">
                    <article className="group w-full border border-[#08070C]/15 bg-white flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:border-[#08070C]/55">
                      <div>
                        <Link to={`/events/${ev.id}`} className="block">
                          <ImageSlot
                            src={ev.posterUrl}
                            alt={`${ev.title} poster`}
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
                        </Link>
                        <div className="p-6 space-y-3">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-[#243A68]">
                            <span>{ev.category}</span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                ev.registrationOpen
                                  ? 'text-[#08070C] font-semibold'
                                  : 'text-[#08070C]/50'
                              }
                            >
                              {isQrRegistration
                                ? 'Register via Poster QR'
                                : ev.registrationOpen
                                  ? 'Registrations Open'
                                  : 'Registrations Closed'}
                            </span>
                          </div>

                          <h3 className="font-display text-xl font-bold tracking-tight text-balance">
                            <Link
                              to={`/events/${ev.id}`}
                              className="hover:text-[#243A68] transition-colors"
                            >
                              {ev.title}
                            </Link>
                          </h3>

                          <p className="text-sm text-[#08070C]/75 line-clamp-3 leading-relaxed">
                            {ev.shortDescription}
                          </p>

                          <div className="pt-2 space-y-1.5 text-xs text-[#08070C]/70 font-mono">
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
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-4 border-t border-[#08070C]/10 flex items-center justify-between gap-3">
                        <Link
                          to={`/events/${ev.id}`}
                          className="text-sm font-medium text-[#08070C] hover:text-[#243A68] inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                        </Link>
                        {ev.registrationOpen && (
                          <Link
                            to={isQrRegistration ? `/events/${ev.id}#poster-qr` : `/register/${ev.id}`}
                            className="font-mono text-xs uppercase tracking-wider text-[#243A68] hover:text-[#FF9900] font-semibold transition-colors"
                          >
                            {isQrRegistration ? 'Scan QR' : 'Register'}
                          </Link>
                        )}
                      </div>
                    </article>
                  </StaggerItem>
                );
              })}
            </StaggerGrid>
          )}
        </div>
      </section>

      {/* 3.6 Community Preview */}
      <section className="border-b border-[#08070C]/10 bg-[#E4D5FF]/25">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-16 md:py-24">
          <RevealSection className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-3">
                04 · People Behind the Community
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
                Builders &amp; Mentors
              </h2>
            </div>
            <Link
              to="/team"
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
            >
              <span>View Our Team</span>
              <ArrowRight className="w-4 h-4 text-[#FF9900] transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </RevealSection>

          {previewTeam.length === 0 ? (
            <RevealSection className="border border-[#08070C]/15 bg-white p-10 md:p-12">
              <p className="font-mono text-xs uppercase tracking-wider text-[#243A68] mb-2">
                Directory Awaiting Profiles
              </p>
              <p className="text-base text-[#08070C]/75 max-w-2xl leading-relaxed">
                Team profiles, faculty coordinators, and student leads are added directly through
                the Team Management console. No fictional profiles are displayed.
              </p>
            </RevealSection>
          ) : (
            <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {previewTeam.map((member) => (
                <StaggerItem key={member.id} className="flex">
                  <Link
                    to="/team"
                    className="group w-full bg-white border border-[#08070C]/14 hover:border-[#08070C] hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                  >
                    <ImageSlot
                      src={member.photoUrl}
                      alt={`${member.fullName} — ${member.designation}`}
                      slotLabel="Member Portrait Slot"
                      aspectClass="aspect-[4/5]"
                      variant="lavender"
                      roundedClass="rounded-none"
                      imgClassName={member.imageClassName || 'object-[50%_18%]'}
                      hoverZoom
                      className="border-0 border-b border-[#08070C]/10"
                    />
                    <div className="p-5 space-y-1.5">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-[#243A68] truncate">
                        {[member.institution, member.category].filter(Boolean).join(' · ')}
                      </p>
                      <h3 className="font-display text-lg font-bold tracking-tight group-hover:text-[#243A68] transition-colors">
                        {member.fullName}
                      </h3>
                      <p className="text-sm text-[#08070C]/75 leading-snug">{member.designation}</p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </div>
      </section>

      {/* 3.7 Photo Collage */}
      <section className="border-b border-[#08070C]/10 bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-16 md:py-24">
          <RevealSection className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
            <div className="lg:col-span-7">
              <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-3">
                05 · Visual Archive
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-balance">
                Inside UCER Builder Sessions
              </h2>
            </div>
            <p className="lg:col-span-5 text-sm text-[#08070C]/70 leading-relaxed">
              Moments from campus outreach desks, peer discussions, technical classroom walkthroughs,
              and hands-on student builder sessions at UCER, Prayagraj.
            </p>
          </RevealSection>

          <RevealSection className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-5 space-y-5">
              <div className="group">
                <ImageSlot
                  src={siteSettings.collagePhotoUrls?.[0]}
                  alt="Students engaging at the AWS Student Builder Group campus desk at UCER"
                  slotLabel={COLLAGE_SLOTS[0].label}
                  aspectClass="aspect-[4/3]"
                  variant="lavender"
                  imgClassName="object-cover object-center"
                  hoverZoom
                />
              </div>
              <div className="md:pl-8 group">
                <ImageSlot
                  src={siteSettings.collagePhotoUrls?.[1]}
                  alt="Peer conversations and onboarding at the UCER AWS session booth"
                  slotLabel={COLLAGE_SLOTS[1].label}
                  aspectClass="aspect-[4/3]"
                  variant="pale"
                  imgClassName="object-cover object-center"
                  hoverZoom
                />
              </div>
            </div>

            <div className="md:col-span-3 space-y-5 md:-mt-6">
              <div className="group">
                <ImageSlot
                  src={siteSettings.collagePhotoUrls?.[2]}
                  alt="Boost Your Career in Tech showcase and AWS community merchandise"
                  slotLabel={COLLAGE_SLOTS[2].label}
                  aspectClass="aspect-[3/4]"
                  variant="neutral"
                  imgClassName="object-cover object-center"
                  hoverZoom
                />
              </div>
              <div className="group">
                <ImageSlot
                  src={siteSettings.collagePhotoUrls?.[3]}
                  alt="AWS Student Builder Group outdoor pavilion setup at UCER"
                  slotLabel={COLLAGE_SLOTS[3].label}
                  aspectClass="aspect-[4/3]"
                  variant="lavender"
                  imgClassName="object-cover object-center"
                  hoverZoom
                />
              </div>
            </div>

            <div className="md:col-span-4 space-y-5 md:mt-6">
              <div className="group">
                <ImageSlot
                  src={siteSettings.collagePhotoUrls?.[4]}
                  alt="Technical classroom session led by student builders at UCER"
                  slotLabel={COLLAGE_SLOTS[4].label}
                  aspectClass="aspect-[16/9]"
                  variant="pale"
                  imgClassName="object-cover object-center"
                  hoverZoom
                />
              </div>
              <div className="group">
                <ImageSlot
                  src={siteSettings.collagePhotoUrls?.[5]}
                  alt="AWS Builder Center chalkboard session with UCER student builder"
                  slotLabel={COLLAGE_SLOTS[5].label}
                  aspectClass="aspect-[16/10]"
                  variant="neutral"
                  imgClassName="object-cover object-center"
                  hoverZoom
                />
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* 3.8 Final CTA */}
      <section className="bg-white py-16 md:py-24">
        <RevealSection className="max-w-[1360px] mx-auto px-4 sm:px-8">
          <div className="bg-[#E4D5FF] rounded-3xl p-8 sm:p-12 md:p-16 border border-[#08070C]/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <p className="font-mono text-xs uppercase tracking-widest text-[#243A68]">
                Student Builder Group – AWS · UCER Prayagraj
              </p>
              <h2
                className="font-display font-bold tracking-tight leading-[0.98] text-[#08070C] text-balance"
                style={{ fontSize: 'clamp(2.25rem, 4.5vw, 4rem)' }}
              >
                YOUR NEXT BIG IDEA STARTS HERE.
              </h2>
              <p className="font-editorial italic text-2xl sm:text-3xl text-[#243A68]">
                Learn together. Build together. Grow together.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68] active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <span>Become a Member</span>
                <ArrowUpRight className="w-4 h-4 text-[#FF9900] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white border border-[#08070C]/20 text-[#08070C] text-sm font-medium hover:border-[#08070C] active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <span>Explore Events</span>
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>
    </div>
  );
}
