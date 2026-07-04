import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    tint: '#2563EB',
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#2563EB',
    primary: '#2563EB',
    primaryLight: '#DBEAFE',
    primaryDark: '#1D4ED8',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    purple: '#7C3AED',
    purpleLight: '#EDE9FE',
    orange: '#F97316',
    orangeLight: '#FED7AA',
    teal: '#14B8A6',
    tealLight: '#CCFBF1',
    white: '#FFFFFF',
    black: '#000000',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textTertiary: '#6B7280',
    background: '#151718',
    surface: '#1F2124',
    border: '#2F3336',
    borderLight: '#272A2D',
    tint: '#60A5FA',
    icon: '#9BA1A6',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#60A5FA',
    primary: '#60A5FA',
    primaryLight: '#1E3A5F',
    primaryDark: '#93C5FD',
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#78350F',
    danger: '#F87171',
    dangerLight: '#7F1D1D',
    purple: '#A78BFA',
    purpleLight: '#4C1D95',
    orange: '#FB923C',
    orangeLight: '#7C2D12',
    teal: '#2DD4BF',
    tealLight: '#134E4A',
    white: '#FFFFFF',
    black: '#000000',
  },
};

export const FontSizes = {
  h1: 28,
  h2: 22,
  h3: 18,
  h4: 16,
  body: 14,
  caption: 12,
  micro: 10,
};

export const FontWeights = {
  bold: '700' as const,
  semibold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
  light: '300' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    default: {
      elevation: 1,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    default: {
      elevation: 3,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    default: {
      elevation: 6,
    },
  }),
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
    },
    default: {
      elevation: 10,
    },
  }),
};

export const Animation = {
  press: {
    scaleIn: 0.97,
    duration: 100,
  },
  spring: {
    damping: 15,
    stiffness: 200,
    mass: 0.5,
  },
  focus: {
    duration: 200,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
