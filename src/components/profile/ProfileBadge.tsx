import { useId } from 'react';
import { BadgeCheck } from 'lucide-react';

export type ProfileBadgeKind = 'NONE' | 'FOUNDER' | 'PARTNER' | 'CREATOR';

export function resolveProfileBadge(badge: ProfileBadgeKind | null | undefined, officialAdmin: boolean): ProfileBadgeKind {
  if (badge && badge !== 'NONE') return badge;
  return officialAdmin ? 'FOUNDER' : 'NONE';
}

const badgeDetails = {
  FOUNDER: { label: 'Fundador ou integrante do Soul', color: 'text-[#B88CFF]' },
  PARTNER: { label: 'Parceiro do Soul', color: 'text-sky-400' },
  CREATOR: { label: 'Criador no Soul', color: 'text-white' },
} as const;

export function profileNameColor(badge?: ProfileBadgeKind | null) {
  return badge === 'FOUNDER' ? 'founder-name-gradient' : 'text-textPrimary';
}

export function ProfileBadge({ badge, className = 'h-5 w-5' }: { badge?: ProfileBadgeKind | null; className?: string }) {
  const gradientId = useId().replace(/:/g, '');
  if (!badge || badge === 'NONE') return null;
  const detail = badgeDetails[badge];
  if (badge === 'FOUNDER') {
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return <span role="img" title={detail.label} aria-label={detail.label} className="inline-flex shrink-0 items-center">
      <BadgeCheck aria-hidden="true" className={className} strokeWidth={2.4} style={{ stroke: `url(#${gradientId})` }}>
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="-12" y1="0" x2="12" y2="0" spreadMethod="reflect">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="45%" stopColor="#E9D5FF" />
            <stop offset="100%" stopColor="#9333EA" />
            {!reduceMotion && <>
              <animate attributeName="x1" values="-12;12;-12" dur="5s" repeatCount="indefinite" />
              <animate attributeName="x2" values="12;36;12" dur="5s" repeatCount="indefinite" />
            </>}
          </linearGradient>
        </defs>
      </BadgeCheck>
    </span>;
  }
  return <span role="img" title={detail.label} aria-label={detail.label} className="inline-flex shrink-0 items-center"><BadgeCheck aria-hidden="true" className={`${className} ${detail.color}`} strokeWidth={2.4} /></span>;
}
