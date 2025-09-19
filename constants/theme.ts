/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const primaryColor = '#1E3A8A';
const secondaryColor = '#FFFACD';
const accentColor = '#60A5FA';

export const Colors = {
  light: {
    text: '#1E3A8A',
    background: '#FAFAFA',
    card: '#FFFFFF',
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    tint: primaryColor,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: primaryColor,
    positive: '#4ADE80',
    negative: '#9CA3AF',
    neutral: '#E2E8F0',
    border: '#E2E8F0',
  },
  dark: {
    text: '#F1F5F9',
    background: '#0F172A',
    card: '#1E293B',
    primary: '#3B82F6',
    secondary: '#FEF3C7',
    accent: '#60A5FA',
    tint: '#3B82F6',
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#3B82F6',
    positive: '#4ADE80',
    negative: '#6B7280',
    neutral: '#374151',
    border: '#374151',
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
