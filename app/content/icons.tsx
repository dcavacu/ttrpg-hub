import type { SVGProps } from 'react';

const defaults: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function PersonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.5 3.5-8 8-8s8 3.5 8 8" />
    </svg>
  );
}

export function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M12 6c-1.8-1.3-4-2-6.5-2S2 4.3 2 5v13c0 .5.3.8.8.6C4.5 17.9 6.3 17.5 8 17.5c1.5 0 3 .4 4 1.2" />
      <path d="M12 6c1.8-1.3 4-2 6.5-2S22 4.3 22 5v13c0 .5-.3.8-.8.6c-1.7-.7-3.5-1.1-5.2-1.1c-1.5 0-3 .4-4 1.2" />
      <path d="M12 6v12.7" />
    </svg>
  );
}

export function SwordIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M20 2L8 15L6 17Z" />
      <path d="M5 14l4 4" />
      <path d="M7 16l-2 2" />
      <path d="M4 17l2 2" />
    </svg>
  );
}

export function PotionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M10 2h4" />
      <path d="M11 2v5.5L6.5 15c-1 1.7.2 4 2.2 4h6.6c2 0 3.2-2.3 2.2-4L13 7.5V2" />
      <path d="M8 14h8" />
    </svg>
  );
}

export function WandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M4 20L15 9" />
      <path d="M17 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
      <path d="M19 13l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4L17 15l1.4-.6z" />
    </svg>
  );
}

export function ScrollIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M6 4h11a2 2 0 0 1 2 2v11" />
      <path d="M6 4a2 2 0 0 0-2 2v13a1 1 0 0 0 1.6.8L7 19" />
      <path d="M6 4v14" />
      <path d="M19 17a2 2 0 0 1-2 2H7" />
      <path d="M9 8h6M9 11h6" />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function SealIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M12 6c-1.8-1.3-4-2-6.5-2S2 4.3 2 5v13c0 .5.3.8.8.6C4.5 17.9 6.3 17.5 8 17.5c1.5 0 3 .4 4 1.2" />
      <path d="M12 6c1.8-1.3 4-2 6.5-2S22 4.3 22 5v13c0 .5-.3.8-.8.6c-1.7-.7-3.5-1.1-5.2-1.1c-1.5 0-3 .4-4 1.2" />
      <path d="M12 6v12.7" />
    </svg>
  );
}

export function RangedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M7 3c7 1.5 10 7 10 9s-3 7.5-10 9" />
      <path d="M7 3v18" />
      <path d="M2 12h16" />
      <path d="M6 12l-4-4M6 12l-4 4" />
    </svg>
  );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9c-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 10l3 3 3-3" />
    </svg>
  );
}

export function DropletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M12 3c4 5 6.5 8.5 6.5 12a6.5 6.5 0 0 1-13 0C5.5 11.5 8 8 12 3z" />
    </svg>
  );
}

export function StarIcon({ filled, ...props }: SVGProps<SVGSVGElement> & { filled?: boolean }) {
  return (
    <svg {...defaults} fill={filled ? 'currentColor' : 'none'} {...props}>
      <path d="M12 3l2.6 5.8 6.2.6-4.7 4.2 1.4 6.2L12 16.9 6.5 19.8l1.4-6.2L3.2 9.4l6.2-.6L12 3z" />
    </svg>
  );
}
