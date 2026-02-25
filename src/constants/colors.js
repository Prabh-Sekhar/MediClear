// MediClear Color Palette — Clean Light Medical Theme (Mediva-inspired)
export const Colors = {
  // Primary — Medical Green
  primary: '#2AAA8A',
  primaryDark: '#1E8C6E',
  primaryLight: '#5CC4A8',
  primaryGlow: 'rgba(42, 170, 138, 0.12)',
  primaryMuted: 'rgba(42, 170, 138, 0.06)',
  primarySoft: '#E8F8F3',

  // Background — Clean whites and light grays
  background: '#F5F7FA',
  backgroundLight: '#FFFFFF',
  backgroundCard: '#FFFFFF',
  backgroundCardLight: '#FAFBFC',

  // Surface
  surface: 'rgba(0, 0, 0, 0.02)',
  surfaceHover: 'rgba(0, 0, 0, 0.04)',
  surfaceBorder: 'rgba(0, 0, 0, 0.06)',

  // Shadows
  shadowColor: 'rgba(0, 0, 0, 0.06)',
  shadowMedium: 'rgba(0, 0, 0, 0.1)',

  // Text — Dark on light
  textPrimary: '#1A1D21',
  textSecondary: '#5F6B7A',
  textMuted: '#9CA3AF',

  // Status — Traffic Light
  statusGreen: '#2AAA8A',
  statusGreenBg: 'rgba(42, 170, 138, 0.08)',
  statusGreenText: '#1E8C6E',
  statusYellow: '#E5A100',
  statusYellowBg: 'rgba(229, 161, 0, 0.08)',
  statusOrange: '#E67E22',
  statusOrangeBg: 'rgba(230, 126, 34, 0.08)',
  statusRed: '#E74C3C',
  statusRedBg: 'rgba(231, 76, 60, 0.06)',

  // Accent
  accent: '#3B82F6',
  accentGlow: 'rgba(59, 130, 246, 0.1)',

  // Disclaimer
  disclaimerBg: 'rgba(231, 76, 60, 0.04)',
  disclaimerBorder: 'rgba(231, 76, 60, 0.15)',
  disclaimerText: '#C0392B',

  // Base
  white: '#FFFFFF',
  black: '#1A1D21',
};

export const Gradients = {
  primary: ['#2AAA8A', '#1E8C6E'],
  accent: ['#5CC4A8', '#2AAA8A'],
  hero: ['#F5F7FA', '#FFFFFF'],
  green: ['#2AAA8A', '#1E8C6E'],
  red: ['#E74C3C', '#C0392B'],
};

// Shadow presets for cards
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
  },
};
