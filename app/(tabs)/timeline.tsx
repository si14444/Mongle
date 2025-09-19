import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DreamService } from '@/services/dreamService';
import { Dream } from '@/types/dream';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TimelineScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [dreams, setDreams] = useState<Dream[]>([]);
  const [filteredDreams, setFilteredDreams] = useState<Dream[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filters = [
    { key: 'all', label: '전체', icon: 'calendar' },
    { key: 'positive', label: '긍정적', icon: 'heart.fill' },
    { key: 'neutral', label: '중성적', icon: 'minus' },
    { key: 'negative', label: '부정적', icon: 'cloud' },
  ] as const;

  useEffect(() => {
    loadDreams();
  }, []);

  useEffect(() => {
    filterDreams();
  }, [dreams, selectedFilter]);

  const loadDreams = async () => {
    try {
      const dreamList = await DreamService.getAllDreams();
      setDreams(dreamList);
    } catch (error) {
      console.error('Failed to load dreams:', error);
    }
  };

  const filterDreams = () => {
    if (selectedFilter === 'all') {
      setFilteredDreams(dreams);
    } else {
      setFilteredDreams(dreams.filter(dream => dream.emotion === selectedFilter));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDreams();
    setIsRefreshing(false);
  };

  const handleDreamPress = (dream: Dream) => {
    router.push(`/dream/${dream.id}`);
  };

  const handleDeleteDream = (dreamId: string) => {
    Alert.alert(
      '꿈 삭제',
      '이 꿈을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await DreamService.deleteDream(dreamId);
              await loadDreams();
            } catch (error) {
              console.error('Failed to delete dream:', error);
              Alert.alert('오류', '꿈을 삭제하는 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: `${date.getMonth() + 1}월`,
      day: date.getDate(),
      weekday: ['일', '월', '화', '수', '목', '금', '토'][date.getDay()],
    };
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'positive': return colors.positive;
      case 'negative': return colors.negative;
      default: return colors.neutral;
    }
  };

  const getEmotionIcon = (emotion?: string) => {
    switch (emotion) {
      case 'positive': return 'heart.fill';
      case 'negative': return 'cloud.fill';
      default: return 'minus.circle.fill';
    }
  };

  const groupDreamsByMonth = (dreams: Dream[]) => {
    const grouped: { [key: string]: Dream[] } = {};

    dreams.forEach(dream => {
      const date = new Date(dream.date);
      const monthKey = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(dream);
    });

    return grouped;
  };

  const groupedDreams = groupDreamsByMonth(filteredDreams);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>
          타임라인
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
          기록된 꿈들을 시간순으로 확인해보세요
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.filterContainer, { backgroundColor: colors.card }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollView}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                {
                  backgroundColor: selectedFilter === filter.key ? colors.primary : colors.background,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <IconSymbol
                name={filter.icon}
                size={16}
                color={selectedFilter === filter.key ? 'white' : colors.icon}
              />
              <ThemedText
                style={[
                  styles.filterText,
                  {
                    color: selectedFilter === filter.key ? 'white' : colors.text,
                  }
                ]}
              >
                {filter.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredDreams.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="calendar" size={48} color={colors.icon} />
            <ThemedText style={[styles.emptyText, { color: colors.icon }]}>
              {selectedFilter === 'all' ? '기록된 꿈이 없습니다' : '해당하는 꿈이 없습니다'}
            </ThemedText>
            <TouchableOpacity
              style={[styles.recordButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/record')}
            >
              <ThemedText style={[styles.recordButtonText, { color: 'white' }]}>
                꿈 기록하기
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          Object.entries(groupedDreams).map(([monthKey, monthDreams]) => (
            <ThemedView key={monthKey} style={styles.monthSection}>
              <ThemedText type="subtitle" style={[styles.monthTitle, { color: colors.primary }]}>
                {monthKey}
              </ThemedText>

              {monthDreams.map((dream, index) => {
                const dateInfo = formatDate(dream.date);
                return (
                  <ThemedView key={dream.id} style={styles.timelineItem}>
                    <ThemedView style={styles.dateContainer}>
                      <ThemedView style={[styles.dateCircle, { backgroundColor: colors.primary }]}>
                        <ThemedText style={[styles.dateDay, { color: 'white' }]}>
                          {dateInfo.day}
                        </ThemedText>
                      </ThemedView>
                      <ThemedText style={[styles.dateWeekday, { color: colors.icon }]}>
                        {dateInfo.weekday}
                      </ThemedText>
                      {index < monthDreams.length - 1 && (
                        <ThemedView style={[styles.timeline, { backgroundColor: colors.border }]} />
                      )}
                    </ThemedView>

                    <TouchableOpacity
                      style={[styles.dreamCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                      onPress={() => handleDreamPress(dream)}
                      onLongPress={() => handleDeleteDream(dream.id)}
                    >
                      <ThemedView style={styles.dreamHeader}>
                        <ThemedView style={styles.dreamTitleContainer}>
                          <ThemedText type="defaultSemiBold" style={[styles.dreamTitle, { color: colors.text }]}>
                            {dream.title}
                          </ThemedText>
                          <IconSymbol
                            name={getEmotionIcon(dream.emotion)}
                            size={16}
                            color={getEmotionColor(dream.emotion)}
                          />
                        </ThemedView>
                        {dream.interpretation && (
                          <ThemedView style={[styles.interpretedBadge, { backgroundColor: colors.positive }]}>
                            <ThemedText style={[styles.interpretedText, { color: 'white' }]}>
                              해석됨
                            </ThemedText>
                          </ThemedView>
                        )}
                      </ThemedView>

                      <ThemedText
                        style={[styles.dreamContent, { color: colors.icon }]}
                        numberOfLines={3}
                      >
                        {dream.content}
                      </ThemedText>

                      {dream.tags && dream.tags.length > 0 && (
                        <ThemedView style={styles.tagsContainer}>
                          {dream.tags.slice(0, 3).map((tag, tagIndex) => (
                            <ThemedView key={tagIndex} style={[styles.tag, { backgroundColor: colors.secondary }]}>
                              <ThemedText style={[styles.tagText, { color: colors.primary }]}>
                                {tag}
                              </ThemedText>
                            </ThemedView>
                          ))}
                        </ThemedView>
                      )}
                    </TouchableOpacity>
                  </ThemedView>
                );
              })}
            </ThemedView>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  filterContainer: {
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
  },
  filterScrollView: {
    paddingHorizontal: 15,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 30,
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
  monthSection: {
    marginBottom: 30,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dateContainer: {
    alignItems: 'center',
    width: 60,
    marginRight: 15,
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dateDay: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateWeekday: {
    fontSize: 12,
  },
  timeline: {
    width: 2,
    flex: 1,
    marginTop: 10,
  },
  dreamCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  dreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dreamTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dreamTitle: {
    fontSize: 16,
    flex: 1,
  },
  interpretedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interpretedText: {
    fontSize: 10,
    fontWeight: '600',
  },
  dreamContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
});