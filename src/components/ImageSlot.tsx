import { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageSlotProps {
  src?: string;
  alt: string;
  slotLabel: string;
  aspectClass?: string;
  fit?: 'cover' | 'contain';
  variant?: 'lavender' | 'pale' | 'neutral';
  className?: string;
  roundedClass?: string;
  priority?: boolean;
  hoverZoom?: boolean;
  imgClassName?: string;
}

export function ImageSlot({
  src,
  alt,
  slotLabel,
  aspectClass = 'aspect-[4/3]',
  fit = 'cover',
  variant = 'lavender',
  className = '',
  roundedClass = 'rounded-2xl',
  priority = false,
  hoverZoom = false,
  imgClassName = '',
}: ImageSlotProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const bgClass =
    variant === 'lavender'
      ? 'bg-[#E4D5FF]/45 border-[#08070C]/10'
      : variant === 'pale'
        ? 'bg-[#DCE4F5]/60 border-[#243A68]/15'
        : 'bg-[#F6F6F9] border-[#08070C]/10';

  const hasValidSrc = Boolean(src && src.trim().length > 0 && !failed);

  return (
    <div
      className={`relative overflow-hidden border ${bgClass} ${aspectClass} ${roundedClass} ${className}`}
    >
      {hasValidSrc ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={`w-full h-full ${
            fit === 'contain' ? 'object-contain p-1' : 'object-cover'
          } ${imgClassName} transition-transform duration-300 ease-out ${
            hoverZoom ? 'group-hover:scale-[1.03]' : ''
          }`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center select-none">
          <div className="w-9 h-9 flex items-center justify-center border border-[#08070C]/15 bg-white/85 mb-2.5">
            <ImageIcon className="w-4 h-4 text-[#243A68]" strokeWidth={1.6} />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#08070C]/70 max-w-[24ch] leading-snug">
            {slotLabel}
          </span>
        </div>
      )}
    </div>
  );
}
