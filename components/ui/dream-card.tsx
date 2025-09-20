import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Dream } from '@/types/dream';

interface DreamCardProps {
  dream: Dream;
  onPress: (dream: Dream) => void;
  onLongPress?: (dream: Dream) => void;
  showWeekday?: boolean;
  index?: number;
}

export const DreamCard: React.FC<DreamCardProps> = ({
  dream,
  onPress,
  onLongPress,
  showWeekday = false,
  index = 0,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (showWeekday) {
      return {
        month: `${date.getMonth() + 1}월`,
        day: date.getDate(),
        weekday: ['일', '월', '화', '수', '목', '금', '토'][date.getDay()],
      };
    } else {
      return {
        simple: `${date.getMonth() + 1}월 ${date.getDate()}일`,
      };
    }
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'positive':
        return colors.positive;
      case 'negative':
        return colors.negative;
      default:
        return colors.neutral;
    }
  };

  const getEmotionIcon = (emotion?: string) => {
    switch (emotion) {
      case 'positive':
        return 'heart.fill';
      case 'negative':
        return 'cloud.fill';
      default:
        return 'minus';
    }
  };

  const dateInfo = formatDate(dream.date);

  return (
    <TouchableOpacity
      style={[
        styles.dreamCard,
        {
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 2 + index },
          shadowOpacity: 1,
          shadowRadius: 8 + index,
          elevation: 4 + index,
          marginBottom: 16,
        },
      ]}
      onPress={() => onPress(dream)}
      onLongPress={onLongPress ? () => onLongPress(dream) : undefined}
    >
      <LinearGradient
        colors={[
          colors.card,
          getEmotionColor(dream.emotion) + '08',
          'transparent',
        ]}
        style={styles.dreamCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ThemedView style={styles.dreamCardContent}>
          <ThemedView style={styles.dreamHeader}>
            <ThemedView style={styles.dreamTitleSection}>
              <ThemedText
                type="defaultSemiBold"
                style={[styles.dreamTitle, { color: colors.text }]}
              >
                {dream.title}
              </ThemedText>
              <ThemedView style={styles.dreamMeta}>
                <ThemedText style={[styles.dreamDate, { color: colors.icon }]}>
                  {showWeekday && 'month' in dateInfo
                    ? `${dateInfo.month} ${dateInfo.day}일 (${dateInfo.weekday})`
                    : dateInfo.simple}
                </ThemedText>
                <IconSymbol
                  name={getEmotionIcon(dream.emotion)}
                  size={16}
                  color={getEmotionColor(dream.emotion)}
                />
              </ThemedView>
            </ThemedView>
          </ThemedView>
          <ThemedText
            style={[styles.dreamContent, { color: colors.text }]}
            numberOfLines={3}
          >
            {dream.content}
          </ThemedText>
          <ThemedView style={styles.dreamFooter}>
            <ThemedView style={styles.dreamTags}>
              {dream.interpretation && (
                <ThemedView
                  style={[
                    styles.interpretedTag,
                    { borderWidth: 1, borderColor: colors.positive },
                  ]}
                >
                  <IconSymbol name="sparkles" size={12} color={colors.positive} />
                  <ThemedText
                    style={[styles.interpretedTagText, { color: colors.positive }]}
                  >
                    해석됨
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
            <ThemedView
              style={[
                styles.chevronContainer,
                { borderWidth: 1, borderColor: colors.border },
              ]}
            >
              <IconSymbol name="chevron.right" size={16} color={colors.primary} />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dreamCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  dreamCardGradient: {
    borderRadius: 20,
  },
  dreamCardContent: {
    padding: 24,
  },
  dreamHeader: {
    marginBottom: 16,
  },
  dreamTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dreamTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  dreamMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  dreamDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  dreamContent: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
    opacity: 0.9,
  },
  dreamFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dreamTags: {
    flexDirection: 'row',
    gap: 8,
  },
  interpretedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  interpretedTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});