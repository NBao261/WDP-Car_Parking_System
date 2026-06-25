// ─── LYNC PARK Mobile Design System ───────────────────────
// Color palette derived from logo: YellowGreen + Charcoal
// Philosophy: Warm, calm, nature-inspired — smooth & premium

export const Colors = {
  // ── Primary — Logo YellowGreen ──────────────────────────
  primary:      '#7DB83A',   // Main logo green (darker for contrast)
  primaryLight: '#A8D164',   // Lighter logo green
  primaryDark:  '#5E8F25',   // Deep logo green
  primaryBg:    'rgba(125, 184, 58, 0.10)',  // Very soft green tint

  // ── Gradient — Smooth warm greens ───────────────────────
  gradientStart:  '#5E8F25',   // Deep forest green
  gradientMid:    '#7DB83A',   // Logo green
  gradientEnd:    '#A8D164',   // Light logo green
  gradientAccent: '#D6EDA8',   // Pale mint highlight

  // ── Secondary — Warm charcoal (from logo "PARK.") ───────
  secondary:      '#5A5A5A',   // Logo charcoal
  secondaryLight: '#7A7A7A',   // Medium grey
  secondaryDark:  '#3D3D3D',   // Deep charcoal

  // ── Semantic — Success / Danger / Warning / Info ─────────
  success:      '#2E9E6B',   // Teal-green (harmonious with primary)
  successLight: 'rgba(46, 158, 107, 0.12)',
  successDark:  '#1E7A50',

  danger:       '#E05252',   // Warm red (not harsh)
  dangerLight:  'rgba(224, 82, 82, 0.12)',
  dangerDark:   '#C03A3A',

  warning:      '#E8A020',   // Warm amber
  warningLight: 'rgba(232, 160, 32, 0.12)',
  warningDark:  '#C07A10',

  info:         '#3A8EC0',   // Calm slate-blue
  infoLight:    'rgba(58, 142, 192, 0.12)',

  // ── Neutral — Warm, soft whites & greys ─────────────────
  white:           '#FFFFFF',
  background:      '#F5F7F2',   // Warm off-white (slight green tint)
  surface:         '#FFFFFF',
  surfaceElevated: '#EFF2EC',   // Warm light grey
  surfaceDark:     '#1E2318',   // Deep dark for contrast elements

  border:      'rgba(94, 143, 37, 0.12)',   // Subtle green-tinted border
  borderLight: 'rgba(94, 143, 37, 0.06)',   // Very subtle
  divider:     'rgba(0, 0, 0, 0.06)',
  disabled:    '#D5DACD',   // Warm disabled
  placeholder: '#9EA8A0',   // Warm grey

  // ── Typography ──────────────────────────────────────────
  textPrimary:     '#2B2E27',   // Near-black with warm tint
  textSecondary:   '#6B7260',   // Warm grey
  textTertiary:    '#9EA894',   // Muted warm grey
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
    shadowColor: '#3A5A1A',    // Green-tinted shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#3A5A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#3A5A1A',
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
