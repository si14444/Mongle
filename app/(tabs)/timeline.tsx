import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDreams, useDeleteDream } from '@/hooks/useDreams';
import { Dream } from '@/types/dream';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TimelineScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: dreams = [], refetch, isRefetching } = useDreams();
  const deleteDreamMutation = useDeleteDream();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { key: 'all', label: '전체', icon: 'calendar' },
    { key: 'positive', label: '긍정적', icon: 'heart.fill' },
    { key: 'neutral', label: '중성적', icon: 'minus' },
    { key: 'negative', label: '부정적', icon: 'cloud' },
  ] as const;

  // Refetch when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Filter dreams based on selected filter and search query
  const filteredDreams = useMemo(() => {
    let filtered = dreams;

    // Filter by emotion
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(dream => dream.emotion === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(dream =>
        dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dream.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [dreams, selectedFilter, searchQuery]);

  const handleRefresh = () => {
    refetch();
  };

  const handleDreamPress = (dream: Dream) => {
    router.push(`/dream/${dream.id}` as any);
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
          onPress: () => {
            deleteDreamMutation.mutate(dreamId, {
              onError: (error) => {
                console.error('Failed to delete dream:', error);
                Alert.alert('오류', '꿈을 삭제하는 중 오류가 발생했습니다.');
              },
            });
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <ThemedView style={styles.header}>
          <ThemedView style={styles.headerLeft}>
            <ThemedText type="title" style={[styles.headerTitle, { color: colors.primary }]}>
              타임라인
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.headerRight}>
            <IconSymbol name="clock.fill" size={20} color={colors.icon} />
          </ThemedView>
        </ThemedView>

        {/* Search Bar */}
        <ThemedView style={[styles.searchContainer, {
          backgroundColor: colors.card,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 4,
        }]}>
          <View style={styles.searchInputContainer}>
            <IconSymbol name="magnifyingglass" size={16} color={colors.icon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="꿈 제목이나 내용으로 검색하세요"
              placeholderTextColor={colors.icon}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol name="xmark.circle.fill" size={16} color={colors.icon} />
              </TouchableOpacity>
            )}
          </View>
        </ThemedView>

      <ThemedView style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollView}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                {
                  backgroundColor: selectedFilter === filter.key ? colors.primary : 'transparent',
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
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
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
                      <View style={styles.dreamHeader}>
                        <View style={styles.dreamTitleContainer}>
                          <ThemedText type="defaultSemiBold" style={[styles.dreamTitle, { color: colors.text }]}>
                            {dream.title}
                          </ThemedText>
                          <IconSymbol
                            name={getEmotionIcon(dream.emotion)}
                            size={16}
                            color={getEmotionColor(dream.emotion)}
                          />
                        </View>
                        {dream.interpretation && (
                          <ThemedView style={[styles.interpretedBadge, { backgroundColor: colors.positive }]}>
                            <ThemedText style={[styles.interpretedText, { color: 'white' }]}>
                              해석됨
                            </ThemedText>
                          </ThemedView>
                        )}
                      </View>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
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