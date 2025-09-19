import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DreamService } from '@/services/dreamService';
import { Dream, DreamInterpretation } from '@/types/dream';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function InterpretScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [dreams, setDreams] = useState<Dream[]>([]);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [interpretation, setInterpretation] = useState<DreamInterpretation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDreams();
  }, []);

  const loadDreams = async () => {
    try {
      const dreamList = await DreamService.getAllDreams();
      setDreams(dreamList);
    } catch (error) {
      console.error('Failed to load dreams:', error);
    }
  };

  const handleDreamSelect = (dream: Dream) => {
    setSelectedDream(dream);
    setInterpretation(dream.interpretation || null);
  };

  const handleInterpret = async () => {
    if (!selectedDream) return;

    setIsLoading(true);
    try {
      // AI 해석 생성 (실제로는 외부 AI API를 호출)
      const mockInterpretation = DreamService.generateMockInterpretation(selectedDream.content);

      // 해석 저장
      const savedInterpretation = await DreamService.saveInterpretation({
        ...mockInterpretation,
        dreamId: selectedDream.id,
      });

      setInterpretation(savedInterpretation);

      // 꿈 목록 업데이트
      await loadDreams();

      Alert.alert('해석 완료', '꿈 해석이 완료되었습니다!');
    } catch (error) {
      console.error('Failed to interpret dream:', error);
      Alert.alert('오류', '꿈 해석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive': return colors.positive;
      case 'negative': return colors.negative;
      default: return colors.neutral;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>
          꿈 해석
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
          기록한 꿈을 선택하여 AI 해석을 받아보세요
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {dreams.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="brain" size={48} color={colors.icon} />
            <ThemedText style={[styles.emptyText, { color: colors.icon }]}>
              해석할 꿈이 없습니다
            </ThemedText>
            <ThemedText style={[styles.emptySubtext, { color: colors.icon }]}>
              먼저 꿈을 기록해주세요
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
              <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
                꿈 선택하기
              </ThemedText>
              <ThemedView style={styles.dreamList}>
                {dreams.map((dream) => (
                  <TouchableOpacity
                    key={dream.id}
                    style={[
                      styles.dreamItem,
                      {
                        backgroundColor: selectedDream?.id === dream.id ? colors.secondary : colors.background,
                        borderColor: selectedDream?.id === dream.id ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => handleDreamSelect(dream)}
                  >
                    <ThemedView style={styles.dreamItemHeader}>
                      <ThemedText type="defaultSemiBold" style={[styles.dreamItemTitle, { color: colors.text }]}>
                        {dream.title}
                      </ThemedText>
                      {dream.interpretation && (
                        <IconSymbol name="checkmark.circle.fill" size={16} color={colors.positive} />
                      )}
                    </ThemedView>
                    <ThemedText
                      style={[styles.dreamItemContent, { color: colors.icon }]}
                      numberOfLines={1}
                    >
                      {dream.content}
                    </ThemedText>
                    <ThemedText style={[styles.dreamItemDate, { color: colors.icon }]}>
                      {formatDate(dream.date)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>

            {selectedDream && (
              <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
                <ThemedView style={styles.selectedDreamHeader}>
                  <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
                    선택된 꿈
                  </ThemedText>
                  {!interpretation && (
                    <TouchableOpacity
                      style={[
                        styles.interpretButton,
                        {
                          backgroundColor: colors.accent,
                          opacity: isLoading ? 0.6 : 1,
                        }
                      ]}
                      onPress={handleInterpret}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <IconSymbol name="brain" size={16} color="white" />
                          <ThemedText style={[styles.interpretButtonText, { color: 'white' }]}>
                            해석하기
                          </ThemedText>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </ThemedView>

                <ThemedView style={[styles.dreamDetail, { backgroundColor: colors.background }]}>
                  <ThemedText type="defaultSemiBold" style={[styles.dreamDetailTitle, { color: colors.text }]}>
                    {selectedDream.title}
                  </ThemedText>
                  <ThemedText style={[styles.dreamDetailContent, { color: colors.text }]}>
                    {selectedDream.content}
                  </ThemedText>
                </ThemedView>

                {interpretation && (
                  <ThemedView style={styles.interpretationSection}>
                    <ThemedView style={[styles.interpretationHeader, { backgroundColor: getMoodColor(interpretation.mood) }]}>
                      <IconSymbol name="brain" size={20} color="white" />
                      <ThemedText style={[styles.interpretationTitle, { color: 'white' }]}>
                        AI 해석 결과
                      </ThemedText>
                    </ThemedView>

                    <ThemedView style={[styles.interpretationContent, { backgroundColor: colors.background }]}>
                      <ThemedText style={[styles.interpretationText, { color: colors.text }]}>
                        {interpretation.analysis}
                      </ThemedText>

                      {interpretation.symbols.length > 0 && (
                        <ThemedView style={styles.symbolsSection}>
                          <ThemedText type="defaultSemiBold" style={[styles.symbolsTitle, { color: colors.primary }]}>
                            주요 상징
                          </ThemedText>
                          {interpretation.symbols.map((symbol, index) => (
                            <ThemedView key={index} style={[styles.symbolItem, { borderColor: colors.border }]}>
                              <ThemedText type="defaultSemiBold" style={[styles.symbolName, { color: colors.accent }]}>
                                {symbol.symbol}
                              </ThemedText>
                              <ThemedText style={[styles.symbolMeaning, { color: colors.text }]}>
                                {symbol.meaning}
                              </ThemedText>
                            </ThemedView>
                          ))}
                        </ThemedView>
                      )}

                      {interpretation.themes.length > 0 && (
                        <ThemedView style={styles.themesSection}>
                          <ThemedText type="defaultSemiBold" style={[styles.themesTitle, { color: colors.primary }]}>
                            주요 테마
                          </ThemedText>
                          <ThemedView style={styles.themesContainer}>
                            {interpretation.themes.map((theme, index) => (
                              <ThemedView key={index} style={[styles.themeTag, { backgroundColor: colors.secondary }]}>
                                <ThemedText style={[styles.themeText, { color: colors.primary }]}>
                                  {theme}
                                </ThemedText>
                              </ThemedView>
                            ))}
                          </ThemedView>
                        </ThemedView>
                      )}
                    </ThemedView>
                  </ThemedView>
                )}
              </ThemedView>
            )}
          </>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  dreamList: {
    gap: 12,
  },
  dreamItem: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
  dreamItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dreamItemTitle: {
    fontSize: 16,
    flex: 1,
  },
  dreamItemContent: {
    fontSize: 14,
    marginBottom: 4,
  },
  dreamItemDate: {
    fontSize: 12,
  },
  selectedDreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  interpretButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  interpretButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dreamDetail: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  dreamDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dreamDetailContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  interpretationSection: {
    marginTop: 10,
  },
  interpretationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    gap: 8,
  },
  interpretationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  interpretationContent: {
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  interpretationText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  symbolsSection: {
    marginBottom: 20,
  },
  symbolsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  symbolItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  symbolName: {
    fontSize: 14,
    marginBottom: 4,
  },
  symbolMeaning: {
    fontSize: 13,
  },
  themesSection: {},
  themesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
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