import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDreams, useDreamStats } from '@/hooks/useDreams';
import { Dream } from '@/types/dream';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: dreams = [] } = useDreams();
  const { data: stats } = useDreamStats();

  const recentDreams = dreams.slice(0, 3);

  const handleDreamPress = (dream: Dream) => {
    router.push(`/dream/${dream.id}` as any);
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.headerContainer}>
            <LinearGradient
              colors={[colors.primary + '15', 'transparent']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ThemedView style={styles.header}>
                <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
                  당신의 꿈을 기록하고 해석해보세요
                </ThemedText>
                <ThemedView style={styles.appIconContainer}>
                  <ThemedView style={styles.iconWrapper}>
                    <Image
                      source={require('@/assets/images/icon.png')}
                      style={styles.appIcon}
                    />
                    <ThemedView style={styles.iconGlow} />
                  </ThemedView>
                </ThemedView>
              </ThemedView>
            </LinearGradient>
          </ThemedView>

        {stats && (
          <ThemedView style={[styles.statsContainer, {
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.cardShadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 1,
            shadowRadius: 20,
            elevation: 12,
          }]}>
            <LinearGradient
              colors={[colors.card, colors.background]}
              style={styles.statsCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <ThemedView style={styles.sectionHeaderWithIcon}>
                <ThemedView style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <IconSymbol name="chart.bar.fill" size={18} color={colors.primary} />
                </ThemedView>
                <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
                  통계
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statsGrid}>
                <LinearGradient
                  colors={[colors.positive + '20', colors.positive + '05']}
                  style={[styles.statItem, styles.statItemGradient]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText type="defaultSemiBold" style={[styles.statNumber, { color: colors.primary }]}>
                    {stats.totalDreams}
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.icon }]}>총 꿈</ThemedText>
                </LinearGradient>

                <LinearGradient
                  colors={[colors.accent + '20', colors.accent + '05']}
                  style={[styles.statItem, styles.statItemGradient]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText type="defaultSemiBold" style={[styles.statNumber, { color: colors.primary }]}>
                    {stats.thisWeek}
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.icon }]}>이번 주</ThemedText>
                </LinearGradient>

                <LinearGradient
                  colors={[colors.secondary + '60', colors.secondary + '20']}
                  style={[styles.statItem, styles.statItemGradient]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText type="defaultSemiBold" style={[styles.statNumber, { color: colors.primary }]}>
                    {stats.thisMonth}
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.icon }]}>이번 달</ThemedText>
                </LinearGradient>
              </ThemedView>
            </LinearGradient>
          </ThemedView>
        )}

        <ThemedView style={[styles.section, {
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 12,
          elevation: 8,
        }]}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedView style={styles.sectionHeaderWithIcon}>
              <ThemedView style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <IconSymbol name="moon.stars.fill" size={18} color={colors.primary} />
              </ThemedView>
              <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
                최근 꿈
              </ThemedText>
            </ThemedView>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push('/(tabs)/timeline')}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.seeAllGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <ThemedText style={[styles.seeAllText, { color: 'white' }]}>
                  전체보기
                </ThemedText>
                <IconSymbol name="chevron.right" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </ThemedView>

          {recentDreams.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedView style={[styles.emptyIconContainer, { backgroundColor: colors.secondary + '30' }]}>
                <IconSymbol name="moon.stars" size={48} color={colors.primary} />
              </ThemedView>
              <ThemedText style={[styles.emptyText, { color: colors.text }]}>
                아직 기록된 꿈이 없습니다
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: colors.icon }]}>
                첫 번째 꿈을 기록해보세요
              </ThemedText>
              <TouchableOpacity
                style={[styles.recordButton, {
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }]}
                onPress={() => router.push('/(tabs)/record')}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryLight]}
                  style={styles.recordButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <IconSymbol name="plus" size={20} color="white" />
                  <ThemedText style={[styles.recordButtonText, { color: 'white' }]}>
                    첫 꿈 기록하기
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            recentDreams.map((dream, index) => (
              <TouchableOpacity
                key={dream.id}
                style={[styles.dreamCard, {
                  borderWidth: 1,
                  borderColor: colors.border,
                  shadowColor: colors.cardShadow,
                  shadowOffset: { width: 0, height: 4 + index * 2 },
                  shadowOpacity: 1,
                  shadowRadius: 12 + index * 2,
                  elevation: 6 + index,
                  marginBottom: 20,
                  transform: [{ scale: 1 }]
                }]}
                onPress={() => handleDreamPress(dream)}
              >
                <LinearGradient
                  colors={[
                    colors.card,
                    getEmotionColor(dream.emotion) + '08',
                    'transparent'
                  ]}
                  style={styles.dreamCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedView style={styles.dreamCardContent}>
                    <ThemedView style={styles.dreamHeader}>
                      <ThemedView style={styles.dreamTitleSection}>
                        <ThemedText type="defaultSemiBold" style={[styles.dreamTitle, { color: colors.text }]}>
                          {dream.title}
                        </ThemedText>
                        <ThemedView style={styles.dreamMeta}>
                          <ThemedText style={[styles.dreamDate, { color: colors.icon }]}>
                            {formatDate(dream.date)}
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
                          <ThemedView style={[styles.interpretedTag, { borderWidth: 1, borderColor: colors.positive }]}>
                            <IconSymbol name="sparkles" size={12} color={colors.positive} />
                            <ThemedText style={[styles.interpretedTagText, { color: colors.positive }]}>
                              해석됨
                            </ThemedText>
                          </ThemedView>
                        )}
                      </ThemedView>
                      <ThemedView style={[styles.chevronContainer, { borderWidth: 1, borderColor: colors.border }]}>
                        <IconSymbol name="chevron.right" size={16} color={colors.primary} />
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </ThemedView>

        <TouchableOpacity
          style={[styles.quickRecordButton, {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }]}
          onPress={() => router.push('/(tabs)/record')}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.quickRecordGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <IconSymbol name="plus.circle.fill" size={24} color="white" />
            <ThemedText style={[styles.quickRecordText, { color: 'white' }]}>
              새 꿈 기록하기
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 20,
    marginTop: 20,
  },
  headerGradient: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleEmoji: {
    fontSize: 36,
    marginHorizontal: 12,
  },
  titleTextContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: -2,
  },
  titleSubtext: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 2,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    fontWeight: '500',
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  floatingDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: '20%',
    right: '15%',
  },
  floatingDot2: {
    width: 12,
    height: 12,
    borderRadius: 6,
    top: '70%',
    left: '10%',
  },
  floatingDot3: {
    width: 6,
    height: 6,
    borderRadius: 3,
    top: '40%',
    left: '80%',
  },
  statsContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 28,
  },
  statsCardGradient: {
    padding: 28,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  statItemGradient: {
    overflow: 'hidden',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statEmoji: {
    fontSize: 18,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  seeAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
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
  recordButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  recordButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
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
  emotionIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
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
  quickRecordButton: {
    borderRadius: 20,
    marginBottom: 40,
    overflow: 'hidden',
  },
  quickRecordGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  quickRecordText: {
    fontSize: 17,
    fontWeight: '600',
  },
  appIconContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  iconGlow: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 21,
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    zIndex: -1,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 5,
  },
});
