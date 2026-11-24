import { Link } from 'react-router-dom';
import { ArrowUpRight, Lock } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { LogoLockup } from './LogoLockup';

export function Footer() {
  const { siteSettings } = usePlatform();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#08070C]/15 bg-white text-[#08070C]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#08070C]/10">
          {/* Identity Column */}
          <div className="md:col-span-5 space-y-5">
            <LogoLockup
              awsLogoUrl={siteSettings.awsLogoUrl}
              ucerLogoUrl={siteSettings.ucerLogoUrl}
              size="md"
            />
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight">
                Student Builder Group – AWS
              </h2>
              <p className="text-sm text-[#08070C]/70 mt-1">
                United College of Engineering &amp; Research (UCER), Prayagraj, Uttar Pradesh, India
              </p>
            </div>
            <p className="font-editorial italic text-xl text-[#243A68]">
              Learn. Connect. Build. Grow.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-3.5">
            <p className="font-mono text-xs uppercase tracking-wider text-[#08070C]/55">
              Navigation
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="hover:text-[#243A68] hover:underline underline-offset-4 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-[#243A68] hover:underline underline-offset-4 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/team"
                  className="hover:text-[#243A68] hover:underline underline-offset-4 transition-colors"
                >
                  Our Team
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="hover:text-[#243A68] hover:underline underline-offset-4 transition-colors"
                >
                  Events &amp; Archive
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-[#243A68] hover:underline underline-offset-4 transition-colors"
                >
                  Event Registration
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-[#243A68] hover:underline underline-offset-4 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="md:col-span-4 space-y-3.5">
            <p className="font-mono text-xs uppercase tracking-wider text-[#08070C]/55">
              Connect
            </p>
            <div className="space-y-2.5 text-sm text-[#08070C]/80">
              <p>
                {siteSettings.contactEmail ? (
                  <a
                    href={`mailto:${siteSettings.contactEmail}`}
                    className="underline decoration-[#08070C]/25 underline-offset-4 hover:decoration-[#FF9900] transition-colors"
                  >
                    {siteSettings.contactEmail}
                  </a>
                ) : (
                  <span className="text-[#08070C]/50 font-mono text-xs">
                    Official email to be configured in Admin
                  </span>
                )}
              </p>
              <p className="text-xs text-[#08070C]/65 leading-relaxed">
                {siteSettings.contactAddress ||
                  'United College of Engineering & Research (UCER), Prayagraj, Uttar Pradesh, India'}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-wider">
              {siteSettings.linkedinUrl ? (
                <a
                  href={siteSettings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#243A68] transition-colors"
                >
                  LinkedIn <ArrowUpRight className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-[#08070C]/40">LinkedIn (Pending)</span>
              )}
              {siteSettings.instagramUrl ? (
                <a
                  href={siteSettings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#243A68] transition-colors"
                >
                  Instagram <ArrowUpRight className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-[#08070C]/40">Instagram (Pending)</span>
              )}
              {siteSettings.githubUrl && (
                <a
                  href={siteSettings.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#243A68] transition-colors"
                >
                  GitHub <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#08070C]/60">
          <p>
            © {year} Student Builder Group – AWS at United College of Engineering &amp; Research,
            Prayagraj. Independent student-led campus community.
          </p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider text-[#243A68] hover:text-[#08070C] transition-colors whitespace-nowrap shrink-0"
          >
            <Lock className="w-3 h-3" />
            <span>Admin Console</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
