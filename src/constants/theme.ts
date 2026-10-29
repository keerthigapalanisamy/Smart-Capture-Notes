export const THEME = {
  colors: {
    // Exact primary blue from reference design
    primary: '#2160E8',
    primaryDark: '#1A4EC2',
    primaryLight: '#F0F5FF',
    primaryBorder: '#D6E4FF',
    primaryMuted: '#93B5FD',

    // App Background & Card surfaces matching reference
    background: '#F7F8FC',
    surface: '#FFFFFF',
    surfaceSubtle: '#F4F6FB',
    surfaceHover: '#EBF0FA',

    // Borders & dividers
    border: '#E8ECF4',
    borderLight: '#F1F4FA',
    borderStrong: '#CBD5E1',
    borderFocus: '#2160E8',

    // Typography
    textPrimary: '#101828', // Dark navy
    textSecondary: '#475569', // Secondary body
    textMuted: '#64748B', // Muted blue-grey
    textPlaceholder: '#94A3B8',
    textInverse: '#FFFFFF',

    // Action buttons matching reference
    editBg: '#EEF4FF',
    editText: '#2160E8',
    deleteBg: '#FFF0F2',
    deleteText: '#EF4444',

    // Status colors
    danger: '#EF4444',
    dangerDark: '#DC2626',
    dangerLight: '#FFF0F2',
    dangerBorder: '#FECACA',

    success: '#10B981',
    successLight: '#ECFDF5',
    successBorder: '#A7F3D0',

    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    warningBorder: '#FDE68A',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  radius: {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    card: 16,
    full: 9999,
  },
  shadows: {
    subtle: {
      shadowColor: '#101828',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 3,
      elevation: 1,
    },
    card: {
      shadowColor: '#101828',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    modal: {
      shadowColor: '#101828',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 8,
    },
    fab: {
      shadowColor: '#2160E8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
  },
};
