// ─── Smart Parking Mobile Design System ───────────────
// Colors, Typography, Spacing, Shadows, Border Radius

export const Colors = {
  // Primary — Brand blue
  primary: '#1A73E8',
  primaryLight: '#4A9AF5',
  primaryDark: '#0D47A1',
  primaryBg: '#E8F0FE',

  // Secondary — Amber for warnings/actions
  secondary: '#F59E0B',
  secondaryLight: '#FCD34D',
  secondaryDark: '#D97706',

  // Success
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',

  // Danger
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerDark: '#DC2626',

  // Warning
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',

  // Info
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#2563EB',

  // Neutral — Grayscale
  white: '#FFFFFF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  divider: '#F1F5F9',
  disabled: '#CBD5E1',
  placeholder: '#94A3B8',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  black: '#000000',

  // Slot status colors (FR-4: trạng thái slot đỗ xe)
  slotAvailable: '#10B981',
  slotOccupied: '#EF4444',
  slotReserved: '#F59E0B',
  slotMaintenance: '#6B7280',
} as const;

export const Typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },

  // Font sizes
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
  },

  // Line heights
  lineHeight: {
    xs: 16,
    sm: 18,
    base: 22,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 42,
  },

  // Font weights
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
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
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
