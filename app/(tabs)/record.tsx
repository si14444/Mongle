import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ConfirmModal, CustomModal } from "@/components/ui/custom-modal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSaveDream } from "@/hooks/useDreams";

export default function RecordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState<
    "positive" | "negative" | "neutral"
  >("neutral");
  const [isSaving, setIsSaving] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const saveDreamMutation = useSaveDream();

  const contentInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emotions = [
    {
      key: "positive",
      label: "긍정적",
      icon: "sparkles",
      color: colors.positive,
    },
    { key: "neutral", label: "중성적", icon: "minus", color: colors.neutral },
    {
      key: "negative",
      label: "부정적",
      icon: "cloud.fill",
      color: colors.negative,
    },
  ] as const;

  const autoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (title.trim() || content.trim()) {
        setIsSaving(true);
        try {
          // 여기서는 임시 저장 로직을 구현할 수 있습니다
          // 현재는 간단히 상태만 업데이트
          console.log("Auto-saving draft...");
        } catch (error) {
          console.error("Auto-save failed:", error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 2000);
  }, [title, content]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (title || content) {
      autoSave();
    }
  }, [title, content, selectedEmotion, autoSave]);

  const handleSave = () => {
    if (!title.trim()) {
      setShowTitleModal(true);
      return;
    }

    if (!content.trim()) {
      setShowContentModal(true);
      return;
    }

    const dreamData = {
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString().split("T")[0],
      emotion: selectedEmotion,
    };

    saveDreamMutation.mutate(dreamData, {
      onSuccess: () => {
        setShowSaveModal(true);
      },
      onError: (error) => {
        console.error("Failed to save dream:", error);
        setShowErrorModal(true);
      },
    });
  };

  const handleSaveModalClose = () => {
    setShowSaveModal(false);
    setTitle("");
    setContent("");
    setSelectedEmotion("neutral");
    router.back();
  };

  const handleClear = () => {
    setShowClearModal(true);
  };

  const handleClearConfirm = () => {
    setTitle("");
    setContent("");
    setSelectedEmotion("neutral");
  };

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
            <ThemedText
              type="title"
              style={[styles.headerTitle, { color: colors.primary }]}
            >
              꿈 기록하기
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.headerRight}>
            {isSaving && (
              <ThemedText style={[styles.savingText, { color: colors.accent }]}>
                저장 중...
              </ThemedText>
            )}
            <TouchableOpacity onPress={handleClear}>
              <IconSymbol name="trash" size={20} color={colors.icon} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ThemedView
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.cardShadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 8,
                  elevation: 4,
                },
              ]}
            >
              <View style={styles.labelContainer}>
                <IconSymbol
                  name="textformat"
                  size={16}
                  color={colors.primary}
                />
                <ThemedText style={[styles.label, { color: colors.primary }]}>
                  제목 *
                </ThemedText>
              </View>
              <TextInput
                style={[
                  styles.titleInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: colors.borderLight,
                  },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="꿈의 제목을 입력하세요"
                placeholderTextColor={colors.icon}
                maxLength={50}
              />
            </ThemedView>

            <ThemedView
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.cardShadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 8,
                  elevation: 4,
                },
              ]}
            >
              <View style={styles.labelContainer}>
                <IconSymbol
                  name="heart.fill"
                  size={16}
                  color={colors.primary}
                />
                <ThemedText style={[styles.label, { color: colors.primary }]}>
                  기분 *
                </ThemedText>
              </View>
              <View style={styles.emotionContainer}>
                {emotions.map((emotion) => (
                  <TouchableOpacity
                    key={emotion.key}
                    style={[
                      styles.emotionButton,
                      {
                        backgroundColor:
                          selectedEmotion === emotion.key
                            ? emotion.color
                            : "#FFFFFF",
                        borderColor:
                          selectedEmotion === emotion.key
                            ? emotion.color
                            : colors.borderLight,
                        shadowColor:
                          selectedEmotion === emotion.key
                            ? emotion.color
                            : "transparent",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity:
                          selectedEmotion === emotion.key ? 0.3 : 0,
                        shadowRadius: 4,
                        elevation: selectedEmotion === emotion.key ? 4 : 0,
                      },
                    ]}
                    onPress={() => setSelectedEmotion(emotion.key)}
                  >
                    <IconSymbol
                      name={emotion.icon}
                      size={32}
                      color={
                        selectedEmotion === emotion.key ? "white" : colors.text
                      }
                      style={styles.emotionIcon}
                    />
                    <ThemedText
                      style={[
                        styles.emotionLabel,
                        {
                          color:
                            selectedEmotion === emotion.key
                              ? "white"
                              : colors.text,
                        },
                      ]}
                    >
                      {emotion.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ThemedView>

            <ThemedView
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.cardShadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 8,
                  elevation: 4,
                },
              ]}
            >
              <View style={styles.labelContainer}>
                <IconSymbol name="doc.text" size={16} color={colors.primary} />
                <ThemedText style={[styles.label, { color: colors.primary }]}>
                  내용 *
                </ThemedText>
              </View>
              <TextInput
                ref={contentInputRef}
                style={[
                  styles.contentInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: colors.borderLight,
                  },
                ]}
                value={content}
                onChangeText={setContent}
                placeholder="꿈의 내용을 자세히 기록해보세요..."
                placeholderTextColor={colors.icon}
                multiline
                textAlignVertical="top"
                onFocus={() => {
                  // 키보드가 나타날 때 스크롤을 하단으로 이동
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }}
              />
            </ThemedView>

            {/* Save Button */}
            <ThemedView style={styles.saveButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    opacity: saveDreamMutation.isPending ? 0.6 : 1,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 8,
                  },
                ]}
                onPress={handleSave}
                disabled={saveDreamMutation.isPending}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryLight]}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {saveDreamMutation.isPending ? (
                    <ThemedText
                      style={[styles.saveButtonText, { color: "white" }]}
                    >
                      저장 중...
                    </ThemedText>
                  ) : (
                    <>
                      <IconSymbol
                        name="checkmark.circle.fill"
                        size={24}
                        color="white"
                      />
                      <ThemedText
                        style={[styles.saveButtonText, { color: "white" }]}
                      >
                        저장하기
                      </ThemedText>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* Modals */}
      <CustomModal
        visible={showTitleModal}
        onClose={() => setShowTitleModal(false)}
        title="제목 입력"
        message="꿈의 제목을 입력해주세요."
        type="warning"
      />

      <CustomModal
        visible={showContentModal}
        onClose={() => setShowContentModal(false)}
        title="내용 입력"
        message="꿈의 내용을 입력해주세요."
        type="warning"
      />

      <CustomModal
        visible={showSaveModal}
        onClose={handleSaveModalClose}
        title="저장 완료"
        message="꿈이 성공적으로 저장되었습니다."
        type="success"
      />

      <CustomModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="오류"
        message="꿈을 저장하는 중 오류가 발생했습니다."
        type="error"
      />

      <ConfirmModal
        visible={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearConfirm}
        title="내용 지우기"
        message="작성 중인 내용을 모두 지우시겠습니까?"
        confirmText="지우기"
        cancelText="취소"
        type="danger"
      />
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
  savingText: {
    fontSize: 12,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 130,
    flexGrow: 1,
  },
  inputContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  emotionContainer: {
    flexDirection: "row",
    gap: 12,
    minHeight: 80,
    alignItems: "stretch",
  },
  emotionButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 70,
  },
  emotionIcon: {
    marginBottom: 8,
  },
  emotionLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    minHeight: 200,
    lineHeight: 24,
  },
  saveButtonContainer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "transparent",
  },
  saveButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
