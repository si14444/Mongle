import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDream, useDeleteDream } from '@/hooks/useDreams';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ConfirmModal } from '@/components/ui/custom-modal';

export default function DreamDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id, interpretationId } = useLocalSearchParams<{ id: string; interpretationId?: string }>();

  const { data: dream, isLoading, error, refetch } = useDream(id!);
  const deleteDreamMutation = useDeleteDream();
  const [selectedInterpretationId, setSelectedInterpretationId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Refetch when page is focused
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Set selected interpretation from URL parameter
  useEffect(() => {
    if (interpretationId) {
      setSelectedInterpretationId(interpretationId);
    } else if (dream?.interpretation) {
      setSelectedInterpretationId(dream.interpretation.id);
    } else if (dream?.interpretationHistory && dream.interpretationHistory.length > 0) {
      // If no current interpretation but history exists, select the latest one
      setSelectedInterpretationId(dream.interpretationHistory[dream.interpretationHistory.length - 1].id);
    } else {
      setSelectedInterpretationId(null);
    }
  }, [interpretationId, dream?.interpretation, dream?.interpretationHistory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'positive': return colors.positive;
      case 'negative': return colors.negative;
      default: return colors.neutral;
    }
  };

  // Get the currently selected interpretation
  const handleDeleteDream = () => {
    if (!dream) return;

    deleteDreamMutation.mutate(dream.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        router.replace('/(tabs)/timeline');
      },
      onError: (error) => {
        console.error('Failed to delete dream:', error);
        setShowDeleteModal(false);
        // 오류 처리 (추후 토스트나 알림 추가 가능)
      },
    });
  };

  const getCurrentInterpretation = () => {
    if (!dream || !selectedInterpretationId) return null;

    // Check interpretation history first
    if (dream?.interpretationHistory) {
      const foundInterpretation = dream.interpretationHistory.find(
        (interp) => interp.id === selectedInterpretationId
      );
      if (foundInterpretation) return foundInterpretation;
    }

    // Fallback to current interpretation
    if (dream.interpretation && dream.interpretation.id === selectedInterpretationId) {
      return dream.interpretation;
    }

    return null;
  };

  const currentInterpretation = getCurrentInterpretation();

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
        {/* Header with back button and delete button */}
        <ThemedView style={styles.headerBar}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.card }]}
            onPress={() => setShowDeleteModal(true)}
          >
            <IconSymbol name="trash" size={20} color={colors.negative} />
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
                  {dream?.title}
                </ThemedText>
                <ThemedView
                  style={[
                    styles.emotionIndicator,
                    {
                      backgroundColor: getEmotionColor(dream?.emotion),
                      shadowColor: getEmotionColor(dream?.emotion),
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 2,
                    }
                  ]}
                />
              </ThemedView>
              <ThemedText style={[styles.date, { color: colors.icon }]}>
                {dream?.date ? formatDate(dream.date) : ''}
              </ThemedText>
            </ThemedView>

            {/* Content section */}
            <ThemedView style={styles.contentSection}>
              <ThemedText style={[styles.content, { color: colors.text }]}>
                {dream?.content}
              </ThemedText>
            </ThemedView>

            {/* Interpretation section */}
            {(dream?.interpretation || dream?.interpretationHistory) && (
              <ThemedView style={[styles.interpretationSection, { borderTopColor: colors.border }]}>
                <ThemedView style={styles.interpretationHeader}>
                  <ThemedView style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <IconSymbol name="sparkles" size={18} color={colors.primary} />
                  </ThemedView>
                  <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
                    AI 해석
                  </ThemedText>
                </ThemedView>


                {currentInterpretation && (
                  <ThemedView style={[styles.interpretationContent, { backgroundColor: colors.secondary + '20' }]}>
                    <ThemedText style={[styles.interpretation, { color: colors.text }]}>
                      {currentInterpretation.analysis}
                    </ThemedText>

                    {currentInterpretation.symbols && currentInterpretation.symbols.length > 0 && (
                      <ThemedView style={styles.symbolsSection}>
                        <ThemedText style={[styles.symbolsTitle, { color: colors.primary }]}>
                          주요 상징
                        </ThemedText>
                        {currentInterpretation.symbols.map((symbol, index) => (
                          <ThemedView
                            key={index}
                            style={[styles.symbolItem, { borderColor: colors.border }]}
                          >
                            <ThemedText style={[styles.symbolName, { color: colors.accent }]}>
                              {symbol.symbol}
                            </ThemedText>
                            <ThemedText style={[styles.symbolMeaning, { color: colors.text }]}>
                              {symbol.meaning}
                            </ThemedText>
                          </ThemedView>
                        ))}
                      </ThemedView>
                    )}

                    {currentInterpretation.themes && currentInterpretation.themes.length > 0 && (
                      <ThemedView style={styles.themesSection}>
                        <ThemedText style={[styles.themesTitle, { color: colors.primary }]}>
                          주요 테마
                        </ThemedText>
                        <View style={styles.themesContainer}>
                          {currentInterpretation.themes.map((theme, index) => (
                            <View key={index} style={[styles.themeTag, { backgroundColor: colors.secondary }]}>
                              <ThemedText style={[styles.themeText, { color: colors.primary }]}>
                                {theme}
                              </ThemedText>
                            </View>
                          ))}
                        </View>
                      </ThemedView>
                    )}
                  </ThemedView>
                )}
              </ThemedView>
            )}
          </ThemedView>
        </ScrollView>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteDream}
          title="꿈 삭제"
          message="이 꿈을 삭제하시겠습니까? 삭제된 꿈과 해석은 복구할 수 없습니다."
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
  headerBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  deleteButton: {
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    padding: 16,
  },
  interpretation: {
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.2,
    marginBottom: 20,
  },
  symbolsSection: {
    marginBottom: 16,
  },
  symbolsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  symbolItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  symbolName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  symbolMeaning: {
    fontSize: 13,
    lineHeight: 18,
  },
  themesSection: {
    marginBottom: 12,
  },
  themesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  themeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});