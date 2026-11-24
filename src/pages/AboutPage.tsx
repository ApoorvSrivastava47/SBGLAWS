import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { PageMeta } from '../components/PageMeta';
import { ImageSlot } from '../components/ImageSlot';
import { RevealSection, StaggerGrid, StaggerItem } from '../components/MotionPrimitives';

export function AboutPage() {
  const { siteSettings, milestones } = usePlatform();

  return (
    <div className="bg-white text-[#08070C]">
      <PageMeta
        title="About Us"
        description="Discover the story, vision, mission, objectives, and journey of the AWS Student Builder Group at UCER, Prayagraj, Uttar Pradesh, India."
      />

      {/* Editorial Header */}
      <section className="border-b border-[#08070C]/10 bg-[#FAFAFC]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-14 md:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-3 sm:mb-4">
            About the Community · UCER Prayagraj
          </p>
          <h1
            className="font-display font-bold tracking-tight leading-[1.02] sm:leading-[0.98] text-balance max-w-4xl"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 4.75rem)' }}
          >
            Built by Students. Driven by Curiosity.
          </h1>
        </div>
      </section>

      {/* 4.1 Our Story */}
      <section className="border-b border-[#08070C]/10">
        <RevealSection className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-4 space-y-2.5 sm:space-y-3">
              <p className="font-mono text-xs uppercase tracking-widest text-[#243A68]">
                01 · Our Story
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                {siteSettings.aboutStoryTitle || 'Conceptualised at UCER'}
              </h2>
            </div>

            <div className="lg:col-span-8 space-y-5 sm:space-y-6">
              <div className="text-base sm:text-lg text-[#08070C]/80 leading-relaxed whitespace-pre-line max-w-2xl">
                {siteSettings.aboutStoryBody}
              </div>
              <figure className="mt-4 sm:mt-6">
                <ImageSlot
                  src={siteSettings.aboutLaunchPhotoUrl}
                  alt="AWS Student Builder Group – UCER launch and founding photograph"
                  slotLabel="Community Launch Photograph Slot"
                  aspectClass="aspect-[16/9] sm:aspect-[2/1]"
                  variant="lavender"
                  roundedClass="rounded-xl sm:rounded-2xl"
                  imgClassName="object-cover object-center"
                />
                <figcaption className="font-mono text-xs text-[#08070C]/60 mt-2.5 sm:mt-3 leading-relaxed">
                  Community Launch Session · AWS Student Builder Group at United College of
                  Engineering &amp; Research (UCER), Prayagraj
                </figcaption>
              </figure>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* 4.2 Our Vision */}
      <section className="border-b border-[#08070C]/10 bg-[#DCE4F5]/35">
        <RevealSection className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-16 md:py-24">
          <div className="max-w-4xl space-y-4 sm:space-y-5">
            <p className="font-mono text-xs uppercase tracking-widest text-[#243A68]">
              02 · Our Vision
            </p>
            <blockquote className="font-editorial italic text-2xl sm:text-4xl md:text-5xl leading-[1.22] sm:leading-[1.18] text-[#08070C]">
              “{siteSettings.aboutVision}”
            </blockquote>
          </div>
        </RevealSection>
      </section>

      {/* 4.3 Our Mission & 4.4 Our Objectives */}
      <section className="border-b border-[#08070C]/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-16 md:py-24 space-y-12 sm:space-y-20">
          {/* Mission */}
          <RevealSection className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-10 items-start">
            <div className="lg:col-span-4 space-y-2.5 sm:space-y-3">
              <p className="font-mono text-xs uppercase tracking-widest text-[#243A68]">
                03 · Our Mission
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                How We Operate
              </h2>
            </div>

            <div className="lg:col-span-8 divide-y divide-[#08070C]/10 border-t border-b border-[#08070C]/10">
              {(siteSettings.aboutMission || []).map((item, idx) => (
                <div key={idx} className="py-4 sm:py-5 flex items-baseline gap-4 sm:gap-6">
                  <span className="font-mono text-xs text-[#243A68] tabular-nums shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm sm:text-lg text-[#08070C]/85 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </RevealSection>

          {/* Objectives */}
          <div className="space-y-6 sm:space-y-8">
            <RevealSection>
              <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-2 sm:mb-3">
                04 · Our Objectives
              </p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
                Strategic Focus Areas
              </h2>
            </RevealSection>

            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {(siteSettings.aboutObjectives || []).map((obj, idx) => (
                <StaggerItem key={idx} className="flex">
                  <article className="w-full border border-[#08070C]/12 p-5 sm:p-7 md:p-9 bg-white space-y-2.5 sm:space-y-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#08070C]/40">
                    <span className="font-mono text-xs text-[#FF9900] font-semibold">
                      Objective {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                      {obj.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#08070C]/75 leading-relaxed">
                      {obj.description}
                    </p>
                  </article>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </div>
      </section>

      {/* 4.5 Our Journey (Chronological Timeline) */}
      <section className="border-b border-[#08070C]/10 bg-[#FAFAFC]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-16 md:py-24">
          <div className="mb-8 sm:mb-12">
            <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-2 sm:mb-3">
              05 · Chronological Timeline
            </p>
            <h2 className="font-display text-2xl sm:text-5xl font-bold tracking-tight">
              Our Journey
            </h2>
          </div>

          {milestones.length === 0 ? (
            <div className="border border-[#08070C]/15 bg-white p-6 sm:p-10">
              <p className="font-mono text-xs uppercase tracking-wider text-[#243A68] mb-2">
                Timeline Ready for Entries
              </p>
              <p className="text-sm text-[#08070C]/75 max-w-2xl">
                Milestones—including launch dates, inaugural workshops, and community achievements—can
                be added chronologically through the Admin Dashboard.
              </p>
            </div>
          ) : (
            <div className="relative border-l border-[#08070C]/20 pl-5 sm:pl-10 space-y-8 sm:space-y-12 ml-1.5 sm:ml-2">
              {milestones.map((ms) => (
                <article
                  key={ms.id}
                  className="relative grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start"
                >
                  <span
                    className="absolute -left-[25px] sm:-left-[45px] top-1.5 w-2.5 h-2.5 bg-[#FF9900] border border-[#08070C]"
                    aria-hidden="true"
                  />
                  <div className="lg:col-span-7 space-y-3 bg-white border border-[#08070C]/12 p-5 sm:p-8">
                    <p className="font-mono text-xs uppercase tracking-wider text-[#243A68]">
                      {ms.dateLabel}
                    </p>
                    <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                      {ms.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#08070C]/75 leading-relaxed">
                      {ms.description}
                    </p>
                    {ms.relatedEventId && (
                      <Link
                        to={`/events/${ms.relatedEventId}`}
                        className="inline-flex items-center gap-1.5 py-1 text-xs font-mono uppercase tracking-wider text-[#243A68] hover:text-[#08070C] pt-2"
                      >
                        <span>View Related Event</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                  <div className="lg:col-span-5">
                    <ImageSlot
                      src={ms.photoUrl}
                      alt={ms.title}
                      slotLabel="Milestone Photograph Slot"
                      aspectClass="aspect-[16/10]"
                      variant="pale"
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4.6 Our Philosophy */}
      <section className="py-10 sm:py-16 md:py-24 bg-white">
        <RevealSection className="max-w-[1360px] mx-auto px-4 sm:px-8">
          <div className="bg-[#E4D5FF] rounded-2xl sm:rounded-3xl p-6 sm:p-14 md:p-20 border border-[#08070C]/10">
            <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-4 sm:mb-6">
              06 · Our Philosophy
            </p>
            <h2
              className="font-display font-bold tracking-[-0.03em] leading-[0.95] text-[#08070C]"
              style={{ fontSize: 'clamp(2rem, 6.5vw, 5.75rem)' }}
            >
              LEARN.
              <br />
              CONNECT.
              <br />
              BUILD.
              <br />
              <span className="text-[#243A68]">GROW.</span>
            </h2>
            <div className="mt-7 sm:mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Link
                to="/team"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:py-3 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68] active:scale-[0.98] transition-all"
              >
                Meet Our Team
              </Link>
              <Link
                to="/events"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:py-3 bg-white border border-[#08070C]/20 text-sm font-medium hover:border-[#08070C] active:scale-[0.98] transition-all"
              >
                Explore Events
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>
    </div>
  );
}
