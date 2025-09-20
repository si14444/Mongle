import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder,
  onClear,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <ThemedView
      style={[
        styles.searchContainer,
        {
          backgroundColor: colors.card,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 4,
        },
      ]}
    >
      <View style={styles.searchInputContainer}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.icon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.icon}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <IconSymbol
              name="xmark.circle.fill"
              size={16}
              color={colors.icon}
            />
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
});