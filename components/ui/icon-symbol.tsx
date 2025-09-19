// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
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
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
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
