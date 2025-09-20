import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  actionIcon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionText,
  onActionPress,
  actionIcon = 'plus',
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.emptyState}>
      <ThemedView style={[styles.emptyIconContainer, { backgroundColor: colors.secondary + '30' }]}>
        <IconSymbol name={icon} size={48} color={colors.primary} />
      </ThemedView>
      <ThemedText style={[styles.emptyText, { color: colors.text }]}>
        {title}
      </ThemedText>
      {subtitle && (
        <ThemedText style={[styles.emptySubtext, { color: colors.icon }]}>
          {subtitle}
        </ThemedText>
      )}
      {actionText && onActionPress && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            },
          ]}
          onPress={onActionPress}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <IconSymbol name={actionIcon} size={20} color="white" />
            <ThemedText style={[styles.actionButtonText, { color: 'white' }]}>
              {actionText}
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginBottom: 32,
    textAlign: 'center',
  },
  actionButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});