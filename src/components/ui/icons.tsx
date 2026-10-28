import React from 'react';

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

const iconBase: React.SVGProps<SVGSVGElement> = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const X: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const MousePointer: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <path d="M21 12.42v3.37a2 2 0 0 1-.23.97l-2.28 3.6a.55.55 0 0 1-.82.18l-1.5-.8a2 2 0 0 0-1-.58l-1.42-.28a.55.55 0 0 0-.4.13l-2.4 2.8a.55.55 0 0 1-.83.07l-2.5-2.2a2 2 0 0 1-.48-.82l-.3-1.1a.55.55 0 0 1 .2-5.4l.9.22a2 2 0 0 0 1.8-.38l1.3-1.3a2 2 0 0 1 1.2-.5l.8-.2a.55.55 0 0 1 .55.5v5.5a.55.55 0 0 0 1 0L17 13a2 2 0 0 0 .42-.18z" />
  </svg>
);

export const Smartphone: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="5" y1="22" x2="19" y2="22" />
    <line x1="12" y1="18" x2="12" y2="18.01" />
  </svg>
);

export const Eye: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const Sparkles: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <path d="M12 2l3.09 6.91A3 3 0 0 1 18 12a3 3 0 0 1-2.91 3.09L12 18l-3.09-.91A3 3 0 0 1 6 12a3 3 0 0 1 2.91-3.09L12 2z" />
    <path d="M19 12h-2l-2 4-2-4H7l2-4 2 4 2-4z" />
  </svg>
);

export const ShoppingBag: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <path d="M16 17v2a2 2 0 0 0 2 2h2" />
    <path d="M2 2h16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <path d="M9 7V4a3 3 0 0 1 6 0v3" />
    <path d="M8 7h8" />
    <path d="M12 7v10" />
  </svg>
);

export const Sliders: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="19 7 19 17 12 12 19 7" />
  </svg>
);

export const Store: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 18V5l2 2 2-2v13" />
  </svg>
);

export const ChevronLeft: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const ChevronRight: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const Check: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <polyline points="20 6 9 15 4 10" />
  </svg>
);

export const AlertCircle: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const Info: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const Compass: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.51 11 12.76 11 7.51 16.24 7.51z" />
    <line x1="12" y1="15" x2="12" y2="15" />
  </svg>
);

export const Shirt: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <path d="M20.35 7.49L12.74 2.15a1 1 0 0 0-.94 0L4.65 7.49a1 1 0 0 0 .5 1.74l7.59 2.53a1 1 0 0 0 .76 0l7.59-2.53a1 1 0 0 0 .35-1.74z" />
    <path d="M12 11.222V17" />
    <path d="M7.5 14.4v6.6a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-6.6" />
    <path d="M5.5 12l5.5-8 5.5 8" />
  </svg>
);

export const Footprints: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <path d="M2 12a5 5 0 0 1 5-5 2 2 0 0 1 2 2 3 3 0 0 0 3 3 3 3 0 0 0 3-3 2 2 0 0 1 2-2 5 5 0 0 1 5 5c0 2.5-2.5 3-2.5 4.5 0 1 .5 1.5 1.5 1.5h.5a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2 2 0 0 1 2-2h.5c1 0 1.5-.5 1.5-1.5C7.5 15 5 14.5 5 12z" />
    <path d="M6.5 16c.5 1 2 1.5 2 2.5h7c0-1 .5-1.5 2-2.5" />
    <path d="M9 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <path d="M15 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
  </svg>
);

export const Briefcase: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <rect x="3" y="7" width="18" height="14" rx="2" />
    <path d="M16 3H8v4h8V3z" />
    <line x1="8" y1="11" x2="8.01" y2="11" />
    <line x1="16" y1="11" x2="16.01" y2="11" />
  </svg>
);

export const GraduationCap: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <path d="M22 10L12 5 2 10l10 5 10-5z" />
    <path d="M6 12v6a6 6 0 0 0 12 0V12" />
    <path d="M9 12V7a3 3 0 0 1 6 0v5" />
  </svg>
);

export const Trash2: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export const Plus: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const Minus: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const ArrowRight: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 19 19 12 12 5" />
  </svg>
);

export const CheckCircle: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="16 10 12 14 8 10" />
  </svg>
);

export const ShieldCheck: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const CreditCard: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="7" y1="16" x2="7.01" y2="16" />
    <line x1="11" y1="16" x2="11.01" y2="16" />
  </svg>
);

export const Truck: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <path d="M1 3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3z" />
    <path d="M15 8h.01M9 8h.01" />
    <path d="M18 12H6v6h12v-6z" />
    <circle cx="8" cy="16" r="2" />
    <circle cx="16" cy="16" r="2" />
  </svg>
);

export const Edit2: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

export const Palette: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <path d="M19.4 15a3.5 3.5 0 0 0 0-6.5 3.5 3.5 0 0 0 0 6.5z" />
    <path d="M6.6 15a3.5 3.5 0 0 1 0-6.5 3.5 3.5 0 0 1 0 6.5z" />
    <path d="M12 11.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
    <path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9c0 2.06.71 3.96 1.93 5.41l-1.47 1.47A9.03 9.03 0 0 0 3 13a9 9 0 1 1 9 9z" />
  </svg>
);

export const Tag: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <path d="M12 2H2v10h4v8l6-4 6 4v-8h4V2z" />
    <path d="M8 12h8" />
  </svg>
);

export const RotateCcw: React.FC<IconProps> = ({ className, style }) => (
  <svg {...iconBase} className={className} style={style}>
    <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9z" />
    <path d="M1 12h4" />
    <path d="m5 9 3 3-3 3" />
  </svg>
);
