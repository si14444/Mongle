import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState } from '@/components/ui/empty-state';
import { DreamCard } from '@/components/ui/dream-card';
import { ConfirmModal } from '@/components/ui/custom-modal';
import { Colors } from '@/constants/theme';
import { CommonStyles } from '@/constants/common-styles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDreams, useDreamStats, useDeleteDream } from '@/hooks/useDreams';
import { Dream } from '@/types/dream';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: dreams = [] } = useDreams();
  const { data: stats } = useDreamStats();
  const deleteDreamMutation = useDeleteDream();

  const recentDreams = dreams.slice(0, 3);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dreamToDelete, setDreamToDelete] = useState<string | null>(null);

  const handleDreamPress = (dream: Dream) => {
    router.push(`/dream/${dream.id}` as any);
  };

  const handleDeleteDream = (dreamId: string) => {
    setDreamToDelete(dreamId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (dreamToDelete) {
      deleteDreamMutation.mutate(dreamToDelete, {
        onError: (error) => {
          console.error('Failed to delete dream:', error);
        },
      });
    }
    setDreamToDelete(null);
    setShowDeleteModal(false);
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
          <SectionHeader
            title="최근 꿈"
            icon="moon.stars.fill"
            actionText="전체보기"
            onActionPress={() => router.push('/(tabs)/timeline')}
          />

          {recentDreams.length === 0 ? (
            <EmptyState
              icon="moon.stars"
              title="아직 기록된 꿈이 없습니다"
              subtitle="첫 번째 꿈을 기록해보세요"
              actionText="첫 꿈 기록하기"
              onActionPress={() => router.push('/(tabs)/record')}
              actionIcon="plus"
            />
          ) : (
            recentDreams.map((dream, index) => (
              <DreamCard
                key={dream.id}
                dream={dream}
                onPress={handleDreamPress}
                onLongPress={(dream) => handleDeleteDream(dream.id)}
                index={index}
              />
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="꿈 삭제"
        message="이 꿈을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        type="danger"
      />
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
    ...CommonStyles.flexRow,
    ...CommonStyles.gap12,
    ...CommonStyles.marginBottom20,
  },
  iconContainer: {
    ...CommonStyles.iconContainer,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
