import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDream } from '@/hooks/useDreams';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function DreamDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: dream, isLoading, error } = useDream(id!);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'positive': return colors.positive;
      case 'negative': return colors.negative;
      default: return colors.neutral;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={colors.backgroundGradient}
          style={styles.gradientBackground}
        >
          <ThemedView style={styles.loadingContainer}>
            <ThemedText>로딩 중...</ThemedText>
          </ThemedView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error || (!isLoading && !dream)) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={colors.backgroundGradient}
          style={styles.gradientBackground}
        >
          <ThemedView style={styles.errorContainer}>
            <ThemedText>꿈을 찾을 수 없습니다.</ThemedText>
          </ThemedView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Header with back button */}
        <ThemedView style={styles.headerBar}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
        </ThemedView>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ThemedView style={[styles.card, {
            backgroundColor: colors.card,
            shadowColor: colors.cardShadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 1,
            shadowRadius: 20,
            elevation: 12,
          }]}>
            {/* Title section without background */}
            <ThemedView style={styles.titleSection}>
              <ThemedView style={styles.titleContainer}>
                <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
                  {dream.title}
                </ThemedText>
                <ThemedView
                  style={[
                    styles.emotionIndicator,
                    {
                      backgroundColor: getEmotionColor(dream.emotion),
                      shadowColor: getEmotionColor(dream.emotion),
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 2,
                    }
                  ]}
                />
              </ThemedView>
              <ThemedText style={[styles.date, { color: colors.icon }]}>
                {formatDate(dream.date)}
              </ThemedText>
            </ThemedView>

            {/* Content section */}
            <ThemedView style={styles.contentSection}>
              <ThemedText style={[styles.content, { color: colors.text }]}>
                {dream.content}
              </ThemedText>
            </ThemedView>

            {/* Interpretation section */}
            {dream.interpretation && (
              <ThemedView style={[styles.interpretationSection, { borderTopColor: colors.border }]}>
                <ThemedView style={styles.interpretationHeader}>
                  <ThemedView style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <IconSymbol name="sparkles" size={18} color={colors.primary} />
                  </ThemedView>
                  <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
                    AI 해석
                  </ThemedText>
                </ThemedView>
                <ThemedView style={[styles.interpretationContent, { backgroundColor: colors.secondary + '20' }]}>
                  <ThemedText style={[styles.interpretation, { color: colors.text }]}>
                    {dream.interpretation.analysis}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}
          </ThemedView>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 0,
    marginBottom: 40,
    overflow: 'hidden',
  },
  titleSection: {
    padding: 28,
    paddingBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
    lineHeight: 36,
  },
  emotionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginTop: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  contentSection: {
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  content: {
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  interpretationSection: {
    borderTopWidth: 1,
    paddingTop: 24,
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  interpretationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  interpretationContent: {
    borderRadius: 16,
    padding: 20,
  },
  interpretation: {
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
});