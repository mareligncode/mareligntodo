export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;

  secondary: string;
  accent: string;

  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;

  priority: {
    urgent: string;
    high: string;
    medium: string;
    low: string;
    none: string;
  };

  background: string;
  surface: string;
  card: string;
  cardBorder: string;

  text: string;
  textSecondary: string;
  textMuted: string;

  inputBackground: string;
  inputBorder: string;

  tabBar: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
}

export const ACCENT_PRESETS = [
  { name: 'Indigo', color: '#4F46E5' },
  { name: 'Emerald', color: '#10B981' },
  { name: 'Violet', color: '#8B5CF6' },
  { name: 'Rose', color: '#F43F5E' },
  { name: 'Amber', color: '#F59E0B' },
  { name: 'Sky', color: '#0284C7' },
];

export const getThemeColors = (isDark: boolean, customAccent?: string): ThemeColors => {
  const accentColor = customAccent || '#4F46E5';

  if (isDark) {
    return {
      primary: accentColor,
      primaryLight: `${accentColor}25`,
      primaryDark: accentColor,

      secondary: '#22D3EE',
      accent: '#A78BFA',

      success: '#34D399',
      successLight: '#064E3B33',
      warning: '#FBBF24',
      warningLight: '#78350F33',
      danger: '#F87171',
      dangerLight: '#7F1D1D33',

      priority: {
        urgent: '#EF4444',
        high: '#F97316',
        medium: '#FBBF24',
        low: '#60A5FA',
        none: '#94A3B8',
      },

      background: '#0B0F19',
      surface: '#151D2F',
      card: '#161F32',
      cardBorder: '#23304A',

      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',

      inputBackground: '#101726',
      inputBorder: '#283652',

      tabBar: '#121A2A',
      tabBarBorder: '#202B41',
      tabActive: accentColor,
      tabInactive: '#64748B',
    };
  }

  // Light theme
  return {
    primary: accentColor,
    primaryLight: `${accentColor}18`,
    primaryDark: '#312E81',

    secondary: '#06B6D4',
    accent: '#8B5CF6',

    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',

    priority: {
      urgent: '#DC2626',
      high: '#EA580C',
      medium: '#D97706',
      low: '#2563EB',
      none: '#64748B',
    },

    background: '#F8FAFC',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',

    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',

    inputBackground: '#F1F5F9',
    inputBorder: '#CBD5E1',

    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    tabActive: accentColor,
    tabInactive: '#94A3B8',
  };
};

export const Colors = getThemeColors(false);
export default Colors;
