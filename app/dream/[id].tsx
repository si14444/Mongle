import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DreamService } from '@/services/dreamService';
import { Dream } from '@/types/dream';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function DreamDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams<{ id: string }>();

  const [dream, setDream] = useState<Dream | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDream();
  }, []);

  const loadDream = async () => {
    if (!id) return;

    try {
      const dreamData = await DreamService.getDreamById(id);
      setDream(dreamData);
    } catch (error) {
      console.error('Failed to load dream:', error);
      Alert.alert('오류', '꿈을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!dream) {
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
      >
        <ScrollView style={styles.scrollView}>
          <ThemedView style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedView style={styles.header}>
              <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>
                {dream.title}
              </ThemedText>
              <ThemedView
                style={[
                  styles.emotionIndicator,
                  { backgroundColor: getEmotionColor(dream.emotion) }
                ]}
              />
            </ThemedView>

            <ThemedText style={[styles.date, { color: colors.icon }]}>
              {formatDate(dream.date)}
            </ThemedText>

            <ThemedText style={[styles.content, { color: colors.text }]}>
              {dream.content}
            </ThemedText>

            {dream.interpretation && (
              <ThemedView style={styles.interpretationSection}>
                <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
                  AI 해석
                </ThemedText>
                <ThemedText style={[styles.interpretation, { color: colors.text }]}>
                  {dream.interpretation.analysis}
                </ThemedText>
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
  scrollView: {
    flex: 1,
    padding: 20,
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
    borderRadius: 20,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  emotionIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  date: {
    fontSize: 14,
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  interpretationSection: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  interpretation: {
    fontSize: 15,
    lineHeight: 22,
  },
});