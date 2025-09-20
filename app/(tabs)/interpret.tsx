import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SearchBar } from "@/components/ui/search-bar";
import { CustomModal } from "@/components/ui/custom-modal";
import { Colors } from "@/constants/theme";
import { CommonStyles } from "@/constants/common-styles";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDreams, useSaveInterpretation } from "@/hooks/useDreams";
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
  const [showAlreadyInterpretedModal, setShowAlreadyInterpretedModal] = useState(false);

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

    console.log("Starting interpretation for dream:", selectedDream.title);
    setIsLoading(true);
    try {
      // AI 해석 생성 (실제로는 외부 AI API를 호출)
      const mockInterpretation = DreamService.generateMockInterpretation(
        selectedDream.content
      );
      console.log("Generated interpretation:", mockInterpretation);

      // Save interpretation to dream history using mutation
      saveInterpretationMutation.mutate({
        dreamId: selectedDream.id,
        analysis: mockInterpretation.analysis,
        symbols: mockInterpretation.symbols,
        mood: mockInterpretation.mood,
        themes: mockInterpretation.themes,
      }, {
        onSuccess: (savedInterpretation) => {
          setInterpretation(savedInterpretation);
          console.log("Opening interpretation modal...");
          setShowInterpretationModal(true);
        },
        onError: (error) => {
          console.error("Failed to save interpretation:", error);
          setShowErrorModal(true);
        }
      });
    } catch (error) {
      console.error("Failed to interpret dream:", error);
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
                  backgroundColor: colors.primary + '10',
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
                      backgroundColor: selectedDream?.interpretation ? colors.neutral : colors.primary,
                      opacity: isLoading ? 0.6 : 1,
                      shadowColor: selectedDream?.interpretation ? colors.neutral : colors.primary,
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
                        name={selectedDream?.interpretation ? "checkmark.circle" : "brain"}
                        size={16}
                        color="white"
                      />
                      <ThemedText
                        style={[styles.interpretButtonText, { color: "white" }]}
                      >
                        {selectedDream?.interpretation ? "이미 해석됨" : "해석하기"}
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          )}

          <ScrollView
            style={styles.content}
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
                                ? colors.primary + '20'
                                : "transparent",
                            borderColor:
                              selectedDream?.id === dream.id
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() => handleDreamSelect(dream)}
                      >
                        <ThemedView style={styles.dreamItemHeader}>
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
                            <ThemedView
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
                            </ThemedView>
                          )}
                        </ThemedView>
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
          onClose={() => setShowErrorModal(false)}
          title="오류"
          message="꿈 해석 중 오류가 발생했습니다."
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
    paddingHorizontal: 20,
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
    backgroundColor: 'transparent',
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
    paddingTop: 20,
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
});
