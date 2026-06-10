// ─── Smart Parking Mobile Design System ───────────────
// High-End Visual Design: Soft Structuralism (Light Mode)

export const Colors = {
  // Primary — Electric Blue Accent
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryBg: 'rgba(37, 99, 235, 0.08)', // Subtle blue glow

  // Secondary
  secondary: '#7C3AED',
  secondaryLight: '#8B5CF6',
  secondaryDark: '#6D28D9',

  // Success
  success: '#059669',
  successLight: 'rgba(5, 150, 105, 0.1)',
  successDark: '#047857',

  // Danger
  danger: '#DC2626',
  dangerLight: 'rgba(220, 38, 38, 0.1)',
  dangerDark: '#B91C1C',

  // Warning
  warning: '#D97706',
  warningLight: 'rgba(217, 119, 6, 0.1)',
  warningDark: '#B45309',

  // Neutral — Soft Structuralism
  white: '#FFFFFF',
  background: '#FDFBF7', // Editorial warm cream
  surface: '#FFFFFF', // Pure white cards
  surfaceElevated: '#F9F8F6', // Slightly off-white for contrast
  border: 'rgba(0, 0, 0, 0.1)', // Subtle dark hairlines
  borderLight: 'rgba(0, 0, 0, 0.04)', // Very subtle outer borders
  divider: 'rgba(0, 0, 0, 0.06)',
  disabled: '#E5E5E5',
  placeholder: '#A3A3A3',
  textPrimary: '#111111', // Deep black for massive typography
  textSecondary: '#666666', // Muted text
  textTertiary: '#999999',
  black: '#000000',

  // Slot status colors
  slotAvailable: '#059669',
  slotOccupied: '#DC2626',
  slotReserved: '#D97706',
  slotMaintenance: '#999999',
} as const;

export const Typography = {
  fontFamily: {
    regular: 'SpaceGrotesk_400Regular',
    medium: 'SpaceGrotesk_500Medium',
    semiBold: 'SpaceGrotesk_600SemiBold',
    bold: 'SpaceGrotesk_700Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64, // Massive typography
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    md: 28,
    lg: 32,
    xl: 40,
    '2xl': 56,
    '3xl': 72,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  base: 24,
  lg: 32,
  xl: 48,
  '2xl': 64,
  '3xl': 96, // Massive whitespace gaps
  '4xl': 128,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 48, // Extremely soft diffused shadow
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
