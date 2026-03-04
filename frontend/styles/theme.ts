// Premium Theme constants for TypeScript usage
export const COLORS = {
  // Surfaces
  surface: {
    primary: 'var(--surface-primary)',
    secondary: 'var(--surface-secondary)',
    tertiary: 'var(--surface-tertiary)',
    card: 'var(--surface-card)',
    modal: 'var(--surface-modal)',
  },

  // Borders
  border: {
    primary: 'var(--border-primary)',
    secondary: 'var(--border-secondary)',
    accent: 'var(--border-accent)',
  },

  // Text
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    muted: 'var(--text-muted)',
    accent: 'var(--text-accent)',
  },

  // Interactive
  primary: 'var(--primary)',
  'primary-hover': 'var(--primary-hover)',
  secondary: 'var(--secondary)',
  'secondary-hover': 'var(--secondary-hover)',
  success: 'var(--success)',
  'success-hover': 'var(--success-hover)',
  danger: 'var(--danger)',
  'danger-hover': 'var(--danger-hover)',
  warning: 'var(--warning)',
  'warning-hover': 'var(--warning-hover)',

  // Status
  draft: 'var(--draft)',
  published: 'var(--published)',
  excluded: 'var(--excluded)',

  // Premium Spiritual Colors
  spiritual: {
    blue: 'var(--spiritual-blue)',
    purple: 'var(--spiritual-purple)',
    gold: 'var(--spiritual-gold)',
    silver: 'var(--spiritual-silver)',
  },
} as const;

// Premium Utility classes using theme variables
export const THEME_CLASSES = {
  // Cards
  card: 'bg-[color:var(--surface-card)] border border-[color:var(--border-primary)] rounded-2xl shadow-sm transition-colors duration-200',

  // Buttons
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 shadow-sm',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-600 shadow-sm',
  },

  // Text
  text: {
    primary: 'text-[color:var(--text-primary)]',
    secondary: 'text-[color:var(--text-secondary)]',
    muted: 'text-[color:var(--text-muted)]',
    accent: 'text-[color:var(--text-accent)]',
  },

  // Backgrounds
  bg: {
    primary: 'bg-[color:var(--surface-primary)]',
    secondary: 'bg-[color:var(--surface-secondary)]',
    tertiary: 'bg-[color:var(--surface-tertiary)]',
  },

  // Status badges
  status: {
    draft: 'bg-[color:var(--draft)]/20 text-[color:var(--draft)] border border-[color:var(--draft)]/50 rounded-full',
    published: 'bg-[color:var(--success)]/20 text-[color:var(--success)] border border-[color:var(--success)]/50 rounded-full',
    excluded: 'bg-[color:var(--danger)]/20 text-[color:var(--danger)] border border-[color:var(--danger)]/50 rounded-full',
  },

  // Material Design 3 Typography
  typography: {
    display: {
      large: 'text-[length:var(--text-display-large)] font-bold leading-tight',
      medium: 'text-[length:var(--text-display-medium)] font-bold leading-tight',
      small: 'text-[length:var(--text-display-small)] font-bold leading-tight',
    },
    headline: {
      large: 'text-[length:var(--text-headline-large)] font-semibold leading-tight',
      medium: 'text-[length:var(--text-headline-medium)] font-semibold leading-tight',
      small: 'text-[length:var(--text-headline-small)] font-semibold leading-tight',
    },
    title: {
      large: 'text-[length:var(--text-title-large)] font-medium leading-normal',
      medium: 'text-[length:var(--text-title-medium)] font-medium leading-normal',
      small: 'text-[length:var(--text-title-small)] font-medium leading-normal',
    },
    body: {
      large: 'text-[length:var(--text-body-large)] font-normal leading-relaxed',
      medium: 'text-[length:var(--text-body-medium)] font-normal leading-relaxed',
      small: 'text-[length:var(--text-body-small)] font-normal leading-relaxed',
    },
    label: {
      large: 'text-[length:var(--text-label-large)] font-medium leading-normal uppercase tracking-wide',
      medium: 'text-[length:var(--text-label-medium)] font-medium leading-normal uppercase tracking-wide',
      small: 'text-[length:var(--text-label-small)] font-medium leading-normal uppercase tracking-wide',
    },
  },

  // Material Motion
  motion: {
    easing: {
      standard: 'var(--motion-easing-standard)',
      emphasized: 'var(--motion-easing-emphasized)',
      legacy: 'var(--motion-easing-legacy)',
    },
  },

  // Premium Effects
  premium: {
    glow: 'shadow-[0_0_20px_rgba(79,70,229,0.3)]',
    shimmer: 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
  },
} as const;

// Type helpers
export type ColorKey = keyof typeof COLORS;
export type ThemeClassKey = keyof typeof THEME_CLASSES;
