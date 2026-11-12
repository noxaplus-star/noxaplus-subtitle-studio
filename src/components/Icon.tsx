import type { ReactNode } from 'react';

export type IconName =
  | 'upload'
  | 'download'
  | 'undo'
  | 'redo'
  | 'wand'
  | 'clock'
  | 'plus'
  | 'help'
  | 'sun'
  | 'moon'
  | 'globe'
  | 'x'
  | 'play'
  | 'pause'
  | 'split'
  | 'merge'
  | 'copy'
  | 'trash'
  | 'seek'
  | 'check'
  | 'alert'
  | 'info'
  | 'film'
  | 'shield'
  | 'install'
  | 'sort'
  | 'external'
  | 'chevron'
  | 'keyboard'
  | 'file'
  | 'paste'
  | 'sparkles'
  | 'waveform'
  | 'github'
  | 'mail'
  | 'lock';

const ICONS: Record<IconName, ReactNode> = {
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="M7.5 8.5 12 4l4.5 4.5" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v12" />
      <path d="M7.5 11.5 12 16l4.5-4.5" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </>
  ),
  undo: (
    <>
      <path d="M9 7 4 12l5 5" />
      <path d="M4 12h9a6 6 0 0 1 6 6" />
    </>
  ),
  redo: (
    <>
      <path d="m15 7 5 5-5 5" />
      <path d="M20 12h-9a6 6 0 0 0-6 6" />
    </>
  ),
  wand: (
    <>
      <path d="m4 20 11-11" />
      <path d="m13 5 1.2 2.8L17 9l-2.8 1.2L13 13l-1.2-2.8L9 9l2.8-1.2Z" />
      <path d="M18.5 14.5 19.3 16l1.7.8-1.7.8-.8 1.6-.8-1.6-1.6-.8 1.6-.8Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.4 9a2.8 2.8 0 1 1 4.6 2.2c-.9.7-2 1.4-2 2.8" />
      <path d="M12 17.4h.01" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a13 13 0 0 1 0 18 13 13 0 0 1 0-18Z" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  play: <path d="M8 5.5v13l10-6.5Z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="7" y="5" width="3.4" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="13.6" y="5" width="3.4" height="14" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  split: (
    <>
      <path d="M12 3v18" strokeDasharray="3 3" />
      <path d="M8 8 4.5 12 8 16" />
      <path d="m16 8 3.5 4-3.5 4" />
    </>
  ),
  merge: (
    <>
      <path d="M4 6h4.5L12 12l3.5-6H20" />
      <path d="M12 12v8" />
      <path d="m9 17 3 3 3-3" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 5H6a2 2 0 0 0-2 2v9" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  seek: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5v7l6-3.5Z" fill="currentColor" stroke="none" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  alert: (
    <>
      <path d="M12 4 2.8 20h18.4Z" />
      <path d="M12 9v5M12 17.5h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5h.01" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4.5 6v6c0 4.4 3.1 7.8 7.5 9 4.4-1.2 7.5-4.6 7.5-9V6Z" />
      <path d="m8.8 12 2.2 2.2 4.4-4.4" />
    </>
  ),
  install: (
    <>
      <rect x="5.5" y="2.5" width="13" height="19" rx="2.5" />
      <path d="M12 7v7" />
      <path d="m9 11 3 3 3-3" />
      <path d="M10 18h4" />
    </>
  ),
  sort: (
    <>
      <path d="M8 5v14M5 16l3 3 3-3" />
      <path d="M16 19V5M13 8l3-3 3 3" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="m20 4-9 9" />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  keyboard: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M8 14h8" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
    </>
  ),
  paste: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5" />
      <path d="M9 10h6M9 14h6M9 18h4" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z" />
    </>
  ),
  waveform: (
    <>
      <path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0" />
    </>
  ),
  github: (
    <path
      d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10" width="15" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 15v2" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}
