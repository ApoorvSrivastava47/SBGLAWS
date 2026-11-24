import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { usePlatform } from '../context/PlatformContext';
import { LogoLockup } from './LogoLockup';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/team', label: 'Our Team' },
  { to: '/events', label: 'Events' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { siteSettings } = usePlatform();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#08070C]/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-16 md:h-[72px] flex items-center justify-between gap-4 xl:gap-8">
          {/* Zone 1: Dual Logos + Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-3.5 shrink-0 group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#243A68]"
            aria-label="AWS Student Builder Group – UCER Home"
          >
            <LogoLockup
              awsLogoUrl={siteSettings.awsLogoUrl}
              ucerLogoUrl={siteSettings.ucerLogoUrl}
              size="sm"
            />
            <span className="hidden xl:inline-block font-display text-[15px] font-bold tracking-tight text-[#08070C] whitespace-nowrap shrink-0 pl-1 border-l border-[#08070C]/15">
              Student Builder Group
            </span>
          </Link>

          {/* Zone 2: Primary Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-6 xl:gap-8"
            aria-label="Primary navigation"
          >
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:origin-left after:transition-transform after:duration-200 after:ease-out ${
                    isActive
                      ? 'text-[#08070C] after:bg-[#FF9900] after:scale-x-100'
                      : 'text-[#08070C]/65 hover:text-[#08070C] after:bg-[#08070C]/35 after:scale-x-0 hover:after:scale-x-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Single Primary CTA + Mobile Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/register"
              className="group hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#08070C] text-white text-xs md:text-sm font-medium whitespace-nowrap shrink-0 hover:bg-[#243A68] active:scale-[0.98] transition-all duration-150"
            >
              <span>Join Our Community</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#FF9900] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 border border-[#08070C]/15 text-[#08070C] hover:bg-[#E4D5FF]/40 active:scale-[0.97] transition-all cursor-pointer"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[#08070C]/45 backdrop-blur-[2px]"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-xs bg-white h-full flex flex-col justify-between p-6 border-l border-[#08070C]/15 overflow-y-auto shadow-2xl"
              aria-label="Mobile menu"
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-[#08070C]/10">
                  <span className="font-display text-sm font-bold tracking-tight">
                    Student Builder Group – UCER
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="w-10 h-10 inline-flex items-center justify-center border border-[#08070C]/15 text-[#08070C] hover:border-[#08070C] transition-colors cursor-pointer"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-5 border-b border-[#08070C]/10">
                  <LogoLockup
                    awsLogoUrl={siteSettings.awsLogoUrl}
                    ucerLogoUrl={siteSettings.ucerLogoUrl}
                    size="sm"
                  />
                </div>

                <nav className="flex flex-col py-6 gap-1.5" aria-label="Mobile navigation">
                  {NAV_LINKS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `py-3 px-3 font-display text-xl font-medium transition-colors ${
                          isActive
                            ? 'bg-[#E4D5FF]/60 text-[#08070C] border-l-2 border-[#FF9900]'
                            : 'text-[#08070C]/75 hover:text-[#08070C] hover:bg-[#FAFAFC]'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="pt-6 border-t border-[#08070C]/10 space-y-3">
                <Link
                  to="/register"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68] transition-colors"
                >
                  <span>Join Our Community</span>
                  <ArrowUpRight className="w-4 h-4 text-[#FF9900]" />
                </Link>
                <Link
                  to="/admin"
                  className="w-full inline-flex items-center justify-center px-5 py-2.5 border border-[#08070C]/20 text-xs font-mono uppercase tracking-wider text-[#243A68] hover:border-[#08070C] transition-colors"
                >
                  Admin Portal
                </Link>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
