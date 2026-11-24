import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { LogoLockup } from './LogoLockup';

export function Footer() {
  const { siteSettings } = usePlatform();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#08070C]/15 bg-white text-[#08070C]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 pb-8 sm:pb-12 border-b border-[#08070C]/10">
          {/* Identity Column */}
          <div className="md:col-span-5 space-y-4 sm:space-y-5">
            <LogoLockup
              awsLogoUrl={siteSettings.awsLogoUrl}
              ucerLogoUrl={siteSettings.ucerLogoUrl}
              size="md"
            />
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight">
                Student Builder Group – AWS
              </h2>
              <p className="text-sm text-[#08070C]/70 mt-1">
                United College of Engineering &amp; Research (UCER), Prayagraj, Uttar Pradesh, India
              </p>
            </div>
            <p className="font-editorial italic text-lg sm:text-xl text-[#243A68]">
              Learn. Connect. Build. Grow.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-2.5 sm:space-y-3.5">
            <p className="font-mono text-xs uppercase tracking-wider text-[#08070C]/55">
              Navigation
            </p>
            <ul className="space-y-1 sm:space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="inline-block py-1 sm:py-0 hover:text-[#243A68] hover:underline underline-offset-4 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="inline-block py-1 sm:py-0 hover:text-[#243A68] hover:underline underline-offset-4 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/team"
                  className="inline-block py-1 sm:py-0 hover:text-[#243A68] hover:underline underline-offset-4 transition-colors"
                >
                  Our Team
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="inline-block py-1 sm:py-0 hover:text-[#243A68] hover:underline underline-offset-4 transition-colors"
                >
                  Events &amp; Archive
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="inline-block py-1 sm:py-0 hover:text-[#243A68] hover:underline underline-offset-4 transition-colors"
                >
                  Event Registration
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="inline-block py-1 sm:py-0 hover:text-[#243A68] hover:underline underline-offset-4 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="md:col-span-4 space-y-3 sm:space-y-3.5 min-w-0">
            <p className="font-mono text-xs uppercase tracking-wider text-[#08070C]/55">
              Connect
            </p>
            <div className="space-y-2.5 text-sm text-[#08070C]/80">
              {siteSettings.contactEmail && (
                <p>
                  <a
                    href={`mailto:${siteSettings.contactEmail}`}
                    className="break-all underline decoration-[#08070C]/25 underline-offset-4 hover:decoration-[#FF9900] transition-colors"
                  >
                    {siteSettings.contactEmail}
                  </a>
                </p>
              )}
              <p className="text-xs text-[#08070C]/65 leading-relaxed">
                {siteSettings.contactAddress ||
                  'United College of Engineering & Research (UCER), Prayagraj, Uttar Pradesh, India'}
              </p>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-wider">
              {siteSettings.linkedinUrl ? (
                <a
                  href={siteSettings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 py-1.5 sm:py-0 hover:text-[#243A68] transition-colors"
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
                  className="inline-flex items-center gap-1 py-1.5 sm:py-0 hover:text-[#243A68] transition-colors"
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
                  className="inline-flex items-center gap-1 py-1.5 sm:py-0 hover:text-[#243A68] transition-colors"
                >
                  GitHub <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#08070C]/60">
          <p className="leading-relaxed">
            © {year} Student Builder Group – AWS at United College of Engineering &amp; Research,
            Prayagraj. Independent student-led campus community.
          </p>
        </div>
      </div>
    </footer>
  );
}
