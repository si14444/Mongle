/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const primaryColor = '#1E3A8A';
const primaryLight = '#3B82F6';
const secondaryColor = '#FFFACD';
const accentColor = '#60A5FA';

export const Colors = {
  light: {
    text: '#1E293B',
    background: '#F8FAFC',
    backgroundGradient: ['#F8FAFC', '#F1F5F9'] as const,
    card: '#FFFFFF',
    cardShadow: 'rgba(15, 23, 42, 0.08)',
    primary: primaryColor,
    primaryLight: primaryLight,
    secondary: secondaryColor,
    accent: accentColor,
    tint: primaryColor,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: primaryColor,
    positive: '#10B981',
    positiveLight: '#D1FAE5',
    negative: '#94A3B8',
    negativeLight: '#F3F4F6',
    neutral: '#E2E8F0',
    neutralLight: '#F8FAFC',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    overlay: 'rgba(15, 23, 42, 0.05)',
  },
  dark: {
    text: '#F1F5F9',
    background: '#0F172A',
    backgroundGradient: ['#0F172A', '#1E293B'] as const,
    card: '#1E293B',
    cardShadow: 'rgba(0, 0, 0, 0.25)',
    primary: primaryLight,
    primaryLight: '#60A5FA',
    secondary: '#FEF3C7',
    accent: '#60A5FA',
    tint: primaryLight,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: primaryLight,
    positive: '#10B981',
    positiveLight: '#064E3B',
    negative: '#6B7280',
    negativeLight: '#374151',
    neutral: '#374151',
    neutralLight: '#1E293B',
    border: '#374151',
    borderLight: '#475569',
    overlay: 'rgba(0, 0, 0, 0.3)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
