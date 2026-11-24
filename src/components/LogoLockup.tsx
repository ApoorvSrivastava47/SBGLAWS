import { useEffect, useState } from 'react';

interface LogoSlotProps {
  awsLogoUrl?: string;
  ucerLogoUrl?: string;
  size?: 'sm' | 'md';
}

function SingleLogoFrame({
  src,
  alt,
  fallbackLabel,
  size,
}: {
  src?: string;
  alt: string;
  fallbackLabel: string;
  size: 'sm' | 'md';
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const heightClass = size === 'sm' ? 'h-7 sm:h-8 min-w-[40px]' : 'h-9 sm:h-10 min-w-[52px]';
  const imgSizingClass =
    size === 'sm'
      ? 'h-7 sm:h-8 w-auto max-w-[175px] xl:max-w-[205px]'
      : 'h-9 sm:h-11 w-auto max-w-[245px]';

  if (src && src.trim() && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${imgSizingClass} object-contain shrink-0 select-none`}
      />
    );
  }

  return (
    <span
      className={`${heightClass} px-2.5 inline-flex items-center justify-center border border-dashed border-[#08070C]/25 bg-[#F7F7FA] font-mono text-[10px] uppercase tracking-wider text-[#243A68] whitespace-nowrap shrink-0`}
      title={`Upload ${fallbackLabel} in Admin Media Library`}
    >
      {fallbackLabel}
    </span>
  );
}

export function LogoLockup({ awsLogoUrl, ucerLogoUrl, size = 'sm' }: LogoSlotProps) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
      <SingleLogoFrame
        src={awsLogoUrl}
        alt="AWS Logo"
        fallbackLabel="AWS Logo"
        size={size}
      />
      <span className="h-5 w-px bg-[#08070C]/20 shrink-0" aria-hidden="true" />
      <SingleLogoFrame
        src={ucerLogoUrl}
        alt="United College of Engineering & Research Logo"
        fallbackLabel="UCER Logo"
        size={size}
      />
    </div>
  );
}
