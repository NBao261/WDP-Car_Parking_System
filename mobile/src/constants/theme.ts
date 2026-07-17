// ─── SMART PARKING Mobile Design System ───────────────────────
// Color palette: Dark (#14161C) + Lime (#A4FF07) + Gray (#ECEEF0) on White
// Philosophy: Clean, modern, premium — inspired by smart-parking reference

export const Colors = {
  // ── Brand — Core identity colors ──────────────────────────
  brandDark:    '#14161C',   // Primary dark (backgrounds, text)
  brandLime:    '#A4FF07',   // Primary accent (CTAs, active states)
  brandGray:    '#ECEEF0',   // Input backgrounds, soft surfaces
  brandGrayText:'#9AA0A6',   // Placeholder, muted text

  // ── Primary — Lime accent mapped ─────────────────────────
  primary:      '#A4FF07',   // Main accent (lime green)
  primaryLight: '#C4FF5A',   // Lighter lime
  primaryDark:  '#8AD606',   // Deeper lime
  primaryBg:    'rgba(164, 255, 7, 0.10)',  // Very soft lime tint

  // ── Gradient — Dark-based gradient ──────────────────────
  gradientStart:  '#14161C',   // Dark
  gradientMid:    '#1E2128',   // Slightly lighter dark
  gradientEnd:    '#2A2D35',   // Medium dark
  gradientAccent: '#A4FF07',   // Lime highlight

  // ── Secondary — Warm charcoal ───────────────────────────
  secondary:      '#5A5A5A',   // Charcoal
  secondaryLight: '#7A7A7A',   // Medium grey
  secondaryDark:  '#3D3D3D',   // Deep charcoal

  // ── Semantic — Success / Danger / Warning / Info ─────────
  success:      '#2E9E6B',   // Teal-green
  successLight: 'rgba(46, 158, 107, 0.12)',
  successDark:  '#1E7A50',

  danger:       '#E05252',   // Warm red
  dangerLight:  'rgba(224, 82, 82, 0.12)',
  dangerDark:   '#C03A3A',

  warning:      '#E8A020',   // Warm amber
  warningLight: 'rgba(232, 160, 32, 0.12)',
  warningDark:  '#C07A10',

  info:         '#3A8EC0',   // Calm slate-blue
  infoLight:    'rgba(58, 142, 192, 0.12)',

  // ── Neutral — Clean whites & greys ─────────────────────
  white:           '#FFFFFF',
  background:      '#FFFFFF',   // Pure white background
  surface:         '#FFFFFF',
  surfaceElevated: '#ECEEF0',   // brand-gray
  surfaceDark:     '#14161C',   // brand-dark

  border:      'rgba(0, 0, 0, 0.08)',
  borderLight: 'rgba(0, 0, 0, 0.04)',
  divider:     'rgba(0, 0, 0, 0.06)',
  disabled:    '#D5DACD',
  placeholder: '#9AA0A6',   // brand-gray-text

  // ── Typography ──────────────────────────────────────────
  textPrimary:     '#14161C',   // brand-dark
  textSecondary:   '#6B7260',   // Medium grey
  textTertiary:    '#9AA0A6',   // brand-gray-text
  textOnDark:      '#FFFFFF',
  textOnDarkMuted: 'rgba(255,255,255,0.70)',
  black: '#000000',

  // ── Parking Slot status ──────────────────────────────────
  slotAvailable:   '#2E9E6B',
  slotOccupied:    '#E05252',
  slotReserved:    '#E8A020',
  slotMaintenance: '#9EA894',
} as const;

export const Typography = {
  fontFamily: {
    regular:  'SpaceGrotesk_400Regular',
    medium:   'SpaceGrotesk_500Medium',
    semiBold: 'SpaceGrotesk_600SemiBold',
    bold:     'SpaceGrotesk_700Bold',
  },
  fontSize: {
    xs:   12,
    sm:   14,
    base: 16,
    md:   18,
    lg:   24,
    xl:   32,
    '2xl': 48,
    '3xl': 64,
  },
  lineHeight: {
    xs:   16,
    sm:   20,
    base: 24,
    md:   28,
    lg:   32,
    xl:   40,
    '2xl': 56,
    '3xl': 72,
  },
  fontWeight: {
    regular:  '400' as const,
    medium:   '500' as const,
    semiBold: '600' as const,
    bold:     '700' as const,
  },
} as const;

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  base: 24,
  lg:   32,
  xl:   48,
  '2xl': 64,
  '3xl': 96,
  '4xl': 128,
} as const;

export const BorderRadius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   20,
  xl:   24,
  '2xl': 32,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#14161C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#14161C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#14161C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 32,
    elevation: 8,
  },
} as const;

export const Theme = {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} as const;

export default Theme;
