import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SectionHeaderProps {
  title: string;
  icon?: string;
  actionText?: string;
  onActionPress?: () => void;
  showIconContainer?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon,
  actionText,
  onActionPress,
  showIconContainer = true,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.sectionHeader}>
      <ThemedView style={styles.sectionHeaderWithIcon}>
        {icon && showIconContainer && (
          <ThemedView style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <IconSymbol name={icon} size={18} color={colors.primary} />
          </ThemedView>
        )}
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          {title}
        </ThemedText>
      </ThemedView>
      {actionText && onActionPress && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onActionPress}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <ThemedText style={[styles.actionText, { color: 'white' }]}>
              {actionText}
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});