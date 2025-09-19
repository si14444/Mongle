import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DreamService } from '@/services/dreamService';
import { Dream, DreamStats } from '@/types/dream';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [recentDreams, setRecentDreams] = useState<Dream[]>([]);
  const [stats, setStats] = useState<DreamStats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dreams = await DreamService.getAllDreams();
      setRecentDreams(dreams.slice(0, 3));

      const dreamStats = await DreamService.getDreamStats();
      setStats(dreamStats);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleDreamPress = (dream: Dream) => {
    router.push(`/dream/${dream.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'positive': return colors.positive;
      case 'negative': return colors.negative;
      default: return colors.neutral;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>
            몽글 ✨
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            당신의 꿈을 기록하고 해석해보세요
          </ThemedText>
        </ThemedView>

        {stats && (
          <ThemedView style={[styles.statsContainer, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
              통계
            </ThemedText>
            <ThemedView style={styles.statsGrid}>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold" style={[styles.statNumber, { color: colors.primary }]}>
                  {stats.totalDreams}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.icon }]}>총 꿈</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold" style={[styles.statNumber, { color: colors.primary }]}>
                  {stats.thisWeek}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.icon }]}>이번 주</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold" style={[styles.statNumber, { color: colors.primary }]}>
                  {stats.thisMonth}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.icon }]}>이번 달</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
              최근 꿈
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/timeline')}>
              <ThemedText style={[styles.seeAllText, { color: colors.accent }]}>
                전체보기
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {recentDreams.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <IconSymbol name="moon.stars" size={48} color={colors.icon} />
              <ThemedText style={[styles.emptyText, { color: colors.icon }]}>
                아직 기록된 꿈이 없습니다
              </ThemedText>
              <TouchableOpacity
                style={[styles.recordButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/record')}
              >
                <ThemedText style={[styles.recordButtonText, { color: 'white' }]}>
                  첫 꿈 기록하기
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            recentDreams.map((dream) => (
              <TouchableOpacity
                key={dream.id}
                style={[styles.dreamCard, { borderColor: colors.border }]}
                onPress={() => handleDreamPress(dream)}
              >
                <ThemedView style={styles.dreamHeader}>
                  <ThemedText type="defaultSemiBold" style={[styles.dreamTitle, { color: colors.text }]}>
                    {dream.title}
                  </ThemedText>
                  <ThemedView
                    style={[
                      styles.emotionIndicator,
                      { backgroundColor: getEmotionColor(dream.emotion) }
                    ]}
                  />
                </ThemedView>
                <ThemedText
                  style={[styles.dreamContent, { color: colors.icon }]}
                  numberOfLines={2}
                >
                  {dream.content}
                </ThemedText>
                <ThemedText style={[styles.dreamDate, { color: colors.icon }]}>
                  {formatDate(dream.date)}
                </ThemedText>
              </TouchableOpacity>
            ))
          )}
        </ThemedView>

        <TouchableOpacity
          style={[styles.quickRecordButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/record')}
        >
          <IconSymbol name="plus" size={24} color="white" />
          <ThemedText style={[styles.quickRecordText, { color: 'white' }]}>
            새 꿈 기록하기
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  statsContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 20,
  },
  recordButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dreamCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dreamTitle: {
    fontSize: 16,
    flex: 1,
  },
  emotionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dreamContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  dreamDate: {
    fontSize: 12,
  },
  quickRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  quickRecordText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
