import { useEffect, useMemo, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { usePlatform } from '../context/PlatformContext';
import { TEAM_CATEGORIES } from '../types';
import type { TeamMember } from '../types';
import { PageMeta } from '../components/PageMeta';
import { ImageSlot } from '../components/ImageSlot';
import { RevealSection, StaggerGrid, StaggerItem } from '../components/MotionPrimitives';

export function TeamPage() {
  const { teamMembers } = usePlatform();
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (!activeMember) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setActiveMember(null);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeMember]);

  const groupedByCategory = useMemo(() => {
    const groups: { category: string; members: TeamMember[] }[] = [];
    for (const cat of TEAM_CATEGORIES) {
      const members = teamMembers.filter((m) => m.category === cat);
      if (members.length > 0) {
        groups.push({ category: cat, members });
      }
    }
    return groups;
  }, [teamMembers]);

  return (
    <div className="bg-white text-[#08070C] min-h-[75vh]">
      <PageMeta
        title="Our Team"
        description="Meet the faculty coordinators, student leadership, technical builders, and outreach organisers of AWS Student Builder Group – UCER, Prayagraj."
      />

      {/* Editorial Header */}
      <section className="border-b border-[#08070C]/10 bg-[#FAFAFC]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-14 md:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-4">
            Community Directory · UCER Prayagraj
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <h1
              className="lg:col-span-7 font-display font-bold tracking-tight leading-[0.98]"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}
            >
              Our Team
            </h1>
            <p className="lg:col-span-5 text-sm sm:text-base text-[#08070C]/75 leading-relaxed">
              The student leadership team guiding cloud learning, technical workshops, campus
              coordination, outreach, and creative direction at United College of Engineering &amp;
              Research (UCER), Prayagraj.
            </p>
          </div>
        </div>
      </section>

      {/* Main Directory Content */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-14 md:py-20">
        {teamMembers.length === 0 ? (
          <RevealSection className="border border-[#08070C]/15 bg-[#E4D5FF]/25 p-10 md:p-14 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-wider text-[#243A68] mb-2">
              Team Directory Pending Profiles
            </p>
            <h2 className="font-display text-2xl font-bold tracking-tight mb-3">
              Authentic member profiles will appear here once added.
            </h2>
            <p className="text-sm text-[#08070C]/75 leading-relaxed">
              In line with community policy, no fictional team members are generated. Authorised
              administrators can add faculty coordinators, leadership, and team members with
              photographs from the Admin Dashboard.
            </p>
          </RevealSection>
        ) : (
          <div className="space-y-16">
            {groupedByCategory.map((group, groupIdx) => (
              <div key={group.category} className="space-y-8">
                <RevealSection className="flex items-baseline justify-between border-b border-[#08070C]/15 pb-3.5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-[#243A68] tabular-nums">
                      {String(groupIdx + 1).padStart(2, '0')}
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                      {group.category}
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-[#08070C]/55 tabular-nums">
                    {String(group.members.length).padStart(2, '0')}{' '}
                    {group.members.length === 1 ? 'Member' : 'Members'}
                  </span>
                </RevealSection>

                <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
                  {group.members.map((member, memberIdx) => {
                    const hasExtraDetails = Boolean(
                      member.bio ||
                        member.responsibility ||
                        member.department ||
                        member.academicYear ||
                        member.linkedinUrl ||
                        member.githubUrl
                    );

                    const cardHeaderAndBody = (
                      <>
                        <div className="relative bg-[#E4D5FF]/25 border-b border-[#08070C]/10">
                          <ImageSlot
                            src={member.photoUrl}
                            alt={`${member.fullName} — ${member.designation}`}
                            slotLabel="Member Photograph Slot"
                            aspectClass="aspect-[4/5]"
                            variant="lavender"
                            roundedClass="rounded-none"
                            imgClassName={member.imageClassName || 'object-[50%_18%]'}
                            hoverZoom
                            className="border-0"
                          />
                        </div>

                        <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className="font-mono text-[11px] font-medium tracking-wider text-[#243A68] tabular-nums">
                                  {String(memberIdx + 1).padStart(2, '0')}
                                </span>
                                <span
                                  className="w-5 h-[2px] bg-[#FF9900] transition-all duration-200 group-hover:w-9"
                                  aria-hidden="true"
                                />
                              </div>
                              {member.institution && (
                                <span className="font-mono text-[11px] uppercase tracking-widest text-[#243A68] font-semibold">
                                  {member.institution}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <h3 className="font-display text-xl sm:text-[1.375rem] font-bold tracking-tight text-[#08070C] leading-snug group-hover:text-[#243A68] transition-colors">
                                {member.fullName}
                              </h3>
                              <p className="text-sm sm:text-[15px] font-medium text-[#08070C]/75 leading-relaxed">
                                {member.designation}
                              </p>
                            </div>

                            {(member.department || member.academicYear) && (
                              <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/55 pt-1">
                                {[member.department, member.academicYear].filter(Boolean).join(' · ')}
                              </p>
                            )}
                            {member.responsibility && (
                              <p className="text-xs text-[#08070C]/70 line-clamp-2 pt-0.5 leading-relaxed">
                                {member.responsibility}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    );

                    return (
                      <StaggerItem key={member.id} className="flex">
                        <article className="group w-full border border-[#08070C]/14 bg-white flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:border-[#08070C]/45 hover:bg-[#FCFBFF] hover:shadow-[0_14px_32px_-16px_rgba(8,7,12,0.16)]">
                          {hasExtraDetails ? (
                            <button
                              type="button"
                              onClick={() => setActiveMember(member)}
                              className="text-left flex-1 flex flex-col cursor-pointer"
                            >
                              {cardHeaderAndBody}
                            </button>
                          ) : (
                            <div className="flex-1 flex flex-col">{cardHeaderAndBody}</div>
                          )}

                          {hasExtraDetails && (
                            <div className="px-6 sm:px-7 py-3.5 border-t border-[#08070C]/10 flex items-center justify-between text-xs font-mono bg-[#FAFAFC]/60">
                              <button
                                type="button"
                                onClick={() => setActiveMember(member)}
                                className="uppercase tracking-wider text-[#243A68] hover:text-[#08070C] transition-colors cursor-pointer"
                              >
                                Profile Details
                              </button>
                              <div className="flex items-center gap-3">
                                {member.linkedinUrl && (
                                  <a
                                    href={member.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#08070C]/65 hover:text-[#08070C] transition-colors"
                                  >
                                    IN
                                  </a>
                                )}
                                {member.githubUrl && (
                                  <a
                                    href={member.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#08070C]/65 hover:text-[#08070C] transition-colors"
                                  >
                                    GH
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </article>
                      </StaggerItem>
                    );
                  })}
                </StaggerGrid>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {activeMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-[#08070C]/55 backdrop-blur-[2px] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={activeMember.fullName}
            onClick={() => setActiveMember(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.985 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-[#08070C]/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-12 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sm:col-span-5 bg-[#F4F4F8]">
                <ImageSlot
                  src={activeMember.photoUrl}
                  alt={activeMember.fullName}
                  slotLabel="Member Photograph Slot"
                  aspectClass="aspect-[3/4]"
                  variant="lavender"
                  roundedClass="rounded-none"
                  className="h-full"
                />
              </div>
              <div className="sm:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-[#243A68]">
                        {activeMember.category}
                      </p>
                      <h2 className="font-display text-2xl font-bold tracking-tight mt-1">
                        {activeMember.fullName}
                      </h2>
                      <p className="text-sm font-medium text-[#08070C]/80 mt-0.5">
                        {activeMember.designation}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveMember(null)}
                      className="w-9 h-9 inline-flex items-center justify-center border border-[#08070C]/15 hover:border-[#08070C] transition-colors cursor-pointer shrink-0"
                      aria-label="Close member details"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {(activeMember.department || activeMember.academicYear) && (
                    <p className="font-mono text-xs text-[#08070C]/65 border-y border-[#08070C]/10 py-2.5">
                      {[activeMember.department, activeMember.academicYear].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  {activeMember.responsibility && (
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/55 mb-1">
                        Area of Responsibility
                      </p>
                      <p className="text-sm text-[#08070C]/85">{activeMember.responsibility}</p>
                    </div>
                  )}

                  {activeMember.bio && (
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/55 mb-1">
                        Biography
                      </p>
                      <p className="text-sm text-[#08070C]/80 leading-relaxed">{activeMember.bio}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-[#08070C]/10">
                  {activeMember.linkedinUrl && (
                    <a
                      href={activeMember.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#08070C] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#243A68] transition-colors"
                    >
                      <span>LinkedIn</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {activeMember.githubUrl && (
                    <a
                      href={activeMember.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#08070C]/25 text-xs font-mono uppercase tracking-wider hover:border-[#08070C] transition-colors"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
