// Android-specific implementation using Material Icons

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mappings for Android.
 * - Material Icons: https://icons.expo.fyi
 * - SF Symbols: https://developer.apple.com/sf-symbols/
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'pencil': 'edit',
  'lightbulb': 'lightbulb-outline',
  'clock': 'schedule',
  'chevron.left': 'chevron-left',
  'plus': 'add',
  'plus.circle': 'add-circle',
  'plus.circle.fill': 'add-circle',
  'minus': 'remove',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'trash': 'delete',
  'moon.stars': 'bedtime',
  'moon.stars.fill': 'bedtime',
  'brain': 'psychology',
  'heart.fill': 'favorite',
  'textformat': 'format-size',
  'doc.text': 'description',
  'chart.bar.fill': 'bar-chart',
  'list.bullet': 'list',
  'calendar': 'event',
  'calendar.circle.fill': 'event',
  'sparkles': 'star',
  'magnifyingglass': 'search',
  'eye': 'visibility',
  'minus.circle.fill': 'remove-circle',
  'cloud.fill': 'cloud',
  'clock.fill': 'schedule',
  'play.circle.fill': 'play-circle-filled',
  'lightbulb.fill': 'lightbulb',
} as IconMapping;

/**
 * Icon component for Android using Material Icons.
 * Automatically maps SF Symbol names to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
