import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CustomModal } from "@/components/ui/custom-modal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SearchBar } from "@/components/ui/search-bar";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDreams, useSaveInterpretation } from "@/hooks/useDreams";
import { AdMobService } from "@/services/adMobService";
import { DreamService } from "@/services/dreamService";
import { Dream, DreamInterpretation } from "@/types/dream";

export default function InterpretScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const queryClient = useQueryClient();

  const { data: dreams = [], refetch } = useDreams();
  const saveInterpretationMutation = useSaveInterpretation();
  const [filteredDreams, setFilteredDreams] = useState<Dream[]>([]);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [interpretation, setInterpretation] =
    useState<DreamInterpretation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInterpretationModal, setShowInterpretationModal] = useState(false);
  const [showDreamDetailModal, setShowDreamDetailModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlreadyInterpretedModal, setShowAlreadyInterpretedModal] =
    useState(false);
  const [showAdPromptModal, setShowAdPromptModal] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  const filterDreams = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredDreams(dreams);
    } else {
      const filtered = dreams.filter(
        (dream) =>
          dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dream.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDreams(filtered);
    }
  }, [dreams, searchQuery]);

  // Refetch when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    filterDreams();
  }, [dreams, searchQuery, filterDreams]);

  const handleDreamSelect = (dream: Dream) => {
    setSelectedDream(dream);
  };

  const handleInterpret = async () => {
    if (!selectedDream) {
      console.log("No selected dream");
      return;
    }

    // 이미 해석된 꿈인지 체크
    if (selectedDream.interpretation) {
      setShowAlreadyInterpretedModal(true);
      return;
    }

    // 광고 시청 안내 모달 표시
    setShowAdPromptModal(true);
  };

  const handleAdPromptConfirm = async () => {
    setShowAdPromptModal(false);
    setIsLoadingAd(true);

    try {
      console.log('[Interpret] Starting ad flow...');

      // 보상형 광고 로드
      console.log('[Interpret] Loading rewarded ad...');
      await AdMobService.loadRewardedAd();
      console.log('[Interpret] Ad loaded, now showing...');

      // 광고 표시
      const earned = await AdMobService.showRewardedAd();
      console.log('[Interpret] Ad closed, earned:', earned);

      if (earned) {
        // 광고를 끝까지 시청한 경우에만 해석 진행
        console.log('[Interpret] User earned reward, proceeding with interpretation');
        await performInterpretation();
      } else {
        // 광고를 끝까지 보지 않은 경우
        console.log('[Interpret] User did not complete watching the ad');
        setErrorMessage("광고를 끝까지 시청해야 해석을 진행할 수 있습니다.");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('[Interpret] ❌ Failed to show rewarded ad:', error);

      // 에러 메시지 설정
      let message = "광고를 로드하는 중 오류가 발생했습니다.";
      if (error instanceof Error) {
        message = `광고 오류: ${error.message}`;
      }

      setErrorMessage(message);
      setShowErrorModal(true);

      // 광고 로드/표시 실패 시 그냥 해석 진행 (임시 조치)
      console.log('[Interpret] Proceeding with interpretation despite ad failure (temporary measure)');
      await performInterpretation();
    } finally {
      setIsLoadingAd(false);
    }
  };

  const performInterpretation = async () => {
    if (!selectedDream) return;

    console.log("Starting AI interpretation for dream:", selectedDream.title);
    setIsLoading(true);
    try {
      // AI 해석 생성 (Gemini API 호출)
      const aiInterpretation = await DreamService.interpretDreamWithAI(
        selectedDream.title,
        selectedDream.content,
        selectedDream.id
      );
      console.log("Generated AI interpretation:", aiInterpretation);

      // Save interpretation to dream history using mutation
      saveInterpretationMutation.mutate(
        {
          dreamId: selectedDream.id,
          analysis: aiInterpretation.analysis,
          symbols: aiInterpretation.symbols,
          mood: aiInterpretation.mood,
          themes: aiInterpretation.themes,
        },
        {
          onSuccess: (savedInterpretation) => {
            setInterpretation(savedInterpretation);
            console.log("Opening interpretation modal...");
            setShowInterpretationModal(true);
          },
          onError: (error) => {
            console.error("Failed to save interpretation:", error);
            const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
            setErrorMessage(`해석 저장 실패: ${message}`);
            setShowErrorModal(true);
          },
        }
      );
    } catch (error) {
      console.error("Failed to interpret dream:", error);

      // 에러 메시지 설정
      let message = "알 수 없는 오류가 발생했습니다.";
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          message = "AI 서비스 인증에 실패했습니다. 앱을 다시 시작해주세요.";
        } else if (error.message.includes("Network") || error.message.includes("Failed to fetch")) {
          message = "네트워크 연결을 확인해주세요.";
        } else if (error.message.includes("AI service not available")) {
          message = "AI 해석 서비스를 사용할 수 없습니다. 나중에 다시 시도해주세요.";
        } else {
          message = error.message;
        }
      }

      setErrorMessage(message);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseInterpretationModal = () => {
    setShowInterpretationModal(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "positive":
        return colors.positive;
      case "negative":
        return colors.negative;
      default:
        return colors.neutral;
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ThemedView style={styles.header}>
            <ThemedView style={styles.headerLeft}>
              <ThemedText
                type="title"
                style={[styles.headerTitle, { color: colors.primary }]}
              >
                꿈 해석
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.headerRight}>
              <IconSymbol name="lightbulb.fill" size={20} color={colors.icon} />
            </ThemedView>
          </ThemedView>

          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="꿈 제목이나 내용으로 검색하세요"
          />

          {/* Selected Dream Section */}
          {selectedDream && (
            <ThemedView
              style={[
                styles.selectedDreamSection,
                {
                  backgroundColor: colors.primary + "10",
                  shadowColor: colors.cardShadow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 1,
                  shadowRadius: 12,
                  elevation: 8,
                },
              ]}
            >
              <ThemedView style={styles.selectedDreamHeader}>
                <TouchableOpacity
                  style={styles.selectedDreamTitleContainer}
                  onPress={() => {
                    console.log("Dream detail modal opening...");
                    setShowDreamDetailModal(true);
                  }}
                >
                  <ThemedText
                    type="subtitle"
                    style={[
                      styles.selectedDreamTitle,
                      { color: colors.primary },
                    ]}
                  >
                    {selectedDream.title}
                  </ThemedText>
                  <IconSymbol
                    name="chevron.right"
                    size={16}
                    color={colors.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.interpretButton,
                    {
                      backgroundColor: selectedDream?.interpretation
                        ? colors.neutral
                        : colors.primary,
                      opacity: isLoading ? 0.6 : 1,
                      shadowColor: selectedDream?.interpretation
                        ? colors.neutral
                        : colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    },
                  ]}
                  onPress={handleInterpret}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <IconSymbol
                        name={
                          selectedDream?.interpretation
                            ? "checkmark.circle"
                            : "brain"
                        }
                        size={16}
                        color="white"
                      />
                      <ThemedText
                        style={[styles.interpretButtonText, { color: "white" }]}
                      >
                        {selectedDream?.interpretation
                          ? "이미 해석됨"
                          : "해석하기"}
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          )}

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {filteredDreams.length === 0 ? (
              <ThemedView style={styles.emptyState}>
                <IconSymbol name="brain" size={48} color={colors.icon} />
                <ThemedText style={[styles.emptyText, { color: colors.icon }]}>
                  해석할 꿈이 없습니다
                </ThemedText>
                <ThemedText
                  style={[styles.emptySubtext, { color: colors.icon }]}
                >
                  먼저 꿈을 기록해주세요
                </ThemedText>
              </ThemedView>
            ) : (
              <>
                <ThemedView style={styles.section}>
                  <ThemedText
                    type="subtitle"
                    style={[styles.sectionTitle, { color: colors.primary }]}
                  >
                    꿈 선택하기
                  </ThemedText>
                  <ThemedView style={styles.dreamList}>
                    {filteredDreams.map((dream) => (
                      <TouchableOpacity
                        key={dream.id}
                        style={[
                          styles.dreamItem,
                          {
                            backgroundColor:
                              selectedDream?.id === dream.id
                                ? colors.primary + "20"
                                : "transparent",
                            borderColor:
                              selectedDream?.id === dream.id
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() => handleDreamSelect(dream)}
                      >
                        <View style={styles.dreamItemHeader}>
                          <ThemedText
                            type="defaultSemiBold"
                            style={[
                              styles.dreamItemTitle,
                              { color: colors.text },
                            ]}
                          >
                            {dream.title}
                          </ThemedText>
                          {dream.interpretation && (
                            <View
                              style={[
                                styles.interpretedBadge,
                                { backgroundColor: colors.positive },
                              ]}
                            >
                              <ThemedText
                                style={[
                                  styles.interpretedText,
                                  { color: "white" },
                                ]}
                              >
                                해석됨
                              </ThemedText>
                            </View>
                          )}
                        </View>
                        <ThemedText
                          style={[
                            styles.dreamItemContent,
                            { color: colors.icon },
                          ]}
                          numberOfLines={1}
                        >
                          {dream.content}
                        </ThemedText>
                        <ThemedText
                          style={[styles.dreamItemDate, { color: colors.icon }]}
                        >
                          {formatDate(dream.date)}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ThemedView>
                </ThemedView>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Dream Detail Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showDreamDetailModal}
          onRequestClose={() => setShowDreamDetailModal(false)}
        >
          <LinearGradient
            colors={colors.backgroundGradient}
            style={styles.modalOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={[styles.backButton, { backgroundColor: colors.card }]}
                  onPress={() => setShowDreamDetailModal(false)}
                >
                  <IconSymbol
                    name="chevron.left"
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <ThemedText
                  type="title"
                  style={[styles.modalTitle, { color: colors.primary }]}
                >
                  꿈 상세보기
                </ThemedText>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView
                style={styles.modalScrollView}
                showsVerticalScrollIndicator={false}
              >
                {selectedDream && (
                  <View style={styles.dreamDetailModalContent}>
                    <ThemedText
                      type="title"
                      style={[
                        styles.dreamDetailModalTitle,
                        { color: colors.text },
                      ]}
                    >
                      {selectedDream.title}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.dreamDetailModalDate,
                        { color: colors.icon },
                      ]}
                    >
                      {formatDate(selectedDream.date)}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.dreamDetailModalText,
                        { color: colors.text },
                      ]}
                    >
                      {selectedDream.content}
                    </ThemedText>
                  </View>
                )}
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>

        {/* Interpretation Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showInterpretationModal}
          onRequestClose={handleCloseInterpretationModal}
        >
          <LinearGradient
            colors={colors.backgroundGradient}
            style={styles.modalOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={[styles.backButton, { backgroundColor: colors.card }]}
                  onPress={handleCloseInterpretationModal}
                >
                  <IconSymbol
                    name="chevron.left"
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <ThemedText
                  type="title"
                  style={[styles.modalTitle, { color: colors.primary }]}
                >
                  AI 해석 결과
                </ThemedText>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView
                style={styles.modalScrollView}
                showsVerticalScrollIndicator={false}
              >
                {interpretation && (
                  <>
                    <View
                      style={[
                        styles.modalInterpretationHeader,
                        { backgroundColor: getMoodColor(interpretation.mood) },
                      ]}
                    >
                      <IconSymbol name="sparkles" size={20} color="white" />
                      <ThemedText
                        style={[
                          styles.modalInterpretationTitle,
                          { color: "white" },
                        ]}
                      >
                        해석 분석
                      </ThemedText>
                    </View>

                    <View style={styles.modalInterpretationContent}>
                      <ThemedText
                        style={[
                          styles.modalInterpretationText,
                          { color: colors.text },
                        ]}
                      >
                        {interpretation.analysis}
                      </ThemedText>

                      {interpretation.symbols.length > 0 && (
                        <View style={styles.modalSymbolsSection}>
                          <ThemedText
                            type="defaultSemiBold"
                            style={[
                              styles.modalSymbolsTitle,
                              { color: colors.primary },
                            ]}
                          >
                            주요 상징
                          </ThemedText>
                          {interpretation.symbols.map((symbol, index) => (
                            <View
                              key={index}
                              style={[
                                styles.modalSymbolItem,
                                {
                                  backgroundColor: colors.background,
                                  borderColor: colors.border,
                                },
                              ]}
                            >
                              <ThemedText
                                type="defaultSemiBold"
                                style={[
                                  styles.modalSymbolName,
                                  { color: colors.accent },
                                ]}
                              >
                                {symbol.symbol}
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.modalSymbolMeaning,
                                  { color: colors.text },
                                ]}
                              >
                                {symbol.meaning}
                              </ThemedText>
                            </View>
                          ))}
                        </View>
                      )}

                      {interpretation.themes.length > 0 && (
                        <View style={styles.modalThemesSection}>
                          <ThemedText
                            type="defaultSemiBold"
                            style={[
                              styles.modalThemesTitle,
                              { color: colors.primary },
                            ]}
                          >
                            주요 테마
                          </ThemedText>
                          <View style={styles.modalThemesContainer}>
                            {interpretation.themes.map((theme, index) => (
                              <View
                                key={index}
                                style={[
                                  styles.modalThemeTag,
                                  { backgroundColor: colors.secondary },
                                ]}
                              >
                                <ThemedText
                                  style={[
                                    styles.modalThemeText,
                                    { color: colors.primary },
                                  ]}
                                >
                                  {theme}
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  </>
                )}
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>

        {/* Error Modal */}
        <CustomModal
          visible={showErrorModal}
          onClose={() => {
            setShowErrorModal(false);
            setErrorMessage("");
          }}
          title="오류"
          message={errorMessage || "꿈 해석 중 오류가 발생했습니다."}
          type="error"
        />

        {/* Already Interpreted Modal */}
        <CustomModal
          visible={showAlreadyInterpretedModal}
          onClose={() => setShowAlreadyInterpretedModal(false)}
          title="이미 해석된 꿈"
          message="이 꿈은 이미 해석되었습니다. 타임라인에서 해석 결과를 확인하세요."
          type="warning"
        />

        {/* Ad Prompt Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showAdPromptModal}
          onRequestClose={() => setShowAdPromptModal(false)}
        >
          <View style={styles.adPromptOverlay}>
            <View
              style={[
                styles.adPromptContainer,
                { backgroundColor: colors.card },
              ]}
            >
              <IconSymbol
                name="play.circle.fill"
                size={64}
                color={colors.primary}
              />

              <ThemedText
                type="title"
                style={[styles.adPromptTitle, { color: colors.primary }]}
              >
                광고 시청 후 해석
              </ThemedText>

              <ThemedText
                style={[styles.adPromptMessage, { color: colors.text }]}
              >
                꿈 해석을 위해 짧은 광고를 시청해주세요.{"\n"}
                광고를 끝까지 시청하시면 AI 해석 결과를 확인하실 수 있습니다.
              </ThemedText>

              <View style={styles.adPromptButtons}>
                <TouchableOpacity
                  style={[
                    styles.adPromptButton,
                    styles.adPromptCancelButton,
                    { borderColor: colors.border },
                  ]}
                  onPress={() => setShowAdPromptModal(false)}
                >
                  <ThemedText
                    style={[styles.adPromptButtonText, { color: colors.text }]}
                  >
                    취소
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.adPromptButton,
                    styles.adPromptConfirmButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleAdPromptConfirm}
                  disabled={isLoadingAd}
                >
                  {isLoadingAd ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <ThemedText
                      style={[styles.adPromptButtonText, { color: "white" }]}
                    >
                      광고 시청하기
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  selectedDreamSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  selectedDreamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  selectedDreamTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
    paddingVertical: 8,
  },
  selectedDreamTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  dreamDetail: {
    padding: 20,
    paddingTop: 0,
  },
  dreamDetailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  dreamDetailContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  dreamDetailDate: {
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 130, // 광고 배너 + 탭 바 높이
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
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
    fontWeight: "bold",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  interpretedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  interpretedText: {
    fontSize: 10,
    fontWeight: "600",
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
  interpretButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  interpretButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  interpretationSection: {
    marginTop: 10,
  },
  interpretationHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    gap: 8,
  },
  interpretationTitle: {
    fontSize: 16,
    fontWeight: "bold",
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
    fontWeight: "bold",
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
    fontWeight: "bold",
    marginBottom: 12,
  },
  themesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  themeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  themeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  modalInterpretationHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  modalInterpretationTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalInterpretationContent: {
    paddingBottom: 40,
  },
  modalInterpretationText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  modalSymbolsSection: {
    marginBottom: 24,
  },
  modalSymbolsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalSymbolItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalSymbolName: {
    fontSize: 16,
    marginBottom: 6,
  },
  modalSymbolMeaning: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalThemesSection: {
    marginBottom: 20,
  },
  modalThemesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalThemesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  modalThemeTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalThemeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Dream Detail Modal styles
  dreamDetailModalContent: {
    paddingBottom: 40,
  },
  dreamDetailModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  dreamDetailModalDate: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 20,
  },
  dreamDetailModalText: {
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  // Ad Prompt Modal styles
  adPromptOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  adPromptContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  adPromptTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  adPromptMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
  },
  adPromptButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  adPromptButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  adPromptCancelButton: {
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
  },
  adPromptConfirmButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  adPromptButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
