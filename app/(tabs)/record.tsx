import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DreamService } from '@/services/dreamService';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function RecordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<'positive' | 'negative' | 'neutral'>('neutral');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const contentInputRef = useRef<TextInput>(null);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emotions = [
    { key: 'positive', label: '긍정적', icon: '😊', color: colors.positive },
    { key: 'neutral', label: '중성적', icon: '😐', color: colors.neutral },
    { key: 'negative', label: '부정적', icon: '😔', color: colors.negative },
  ] as const;

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
  }, [title, content, selectedEmotion]);

  const autoSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (title.trim() || content.trim()) {
        setIsSaving(true);
        try {
          // 여기서는 임시 저장 로직을 구현할 수 있습니다
          // 현재는 간단히 상태만 업데이트
          console.log('Auto-saving draft...');
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 2000);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('제목 입력', '꿈의 제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('내용 입력', '꿈의 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const dreamData = {
        title: title.trim(),
        content: content.trim(),
        date: new Date().toISOString().split('T')[0],
        emotion: selectedEmotion,
      };

      await DreamService.saveDream(dreamData);

      Alert.alert(
        '저장 완료',
        '꿈이 성공적으로 저장되었습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              setTitle('');
              setContent('');
              setSelectedEmotion('neutral');
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to save dream:', error);
      Alert.alert('오류', '꿈을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      '내용 지우기',
      '작성 중인 내용을 모두 지우시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '지우기',
          style: 'destructive',
          onPress: () => {
            setTitle('');
            setContent('');
            setSelectedEmotion('neutral');
          },
        },
      ]
    );
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
        <ThemedView style={styles.header}>
          <ThemedView style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <ThemedText type="title" style={[styles.headerTitle, { color: colors.primary }]}>
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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedView style={[styles.inputContainer, {
            backgroundColor: colors.card,
            shadowColor: colors.cardShadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 4,
          }]}>
            <View style={styles.labelContainer}>
              <IconSymbol name="textformat" size={16} color={colors.primary} />
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
                }
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="꿈의 제목을 입력하세요"
              placeholderTextColor={colors.icon}
              maxLength={50}
            />
          </ThemedView>

          <ThemedView style={[styles.inputContainer, {
            backgroundColor: colors.card,
            shadowColor: colors.cardShadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 4,
          }]}>
            <View style={styles.labelContainer}>
              <IconSymbol name="heart.fill" size={16} color={colors.primary} />
              <ThemedText style={[styles.label, { color: colors.primary }]}>
                기분 *
              </ThemedText>
            </View>
            <ThemedView style={styles.emotionContainer}>
              {emotions.map((emotion) => (
                <TouchableOpacity
                  key={emotion.key}
                  style={[
                    styles.emotionButton,
                    {
                      backgroundColor:
                        selectedEmotion === emotion.key ? emotion.color : colors.background,
                      borderColor: selectedEmotion === emotion.key ? emotion.color : colors.borderLight,
                      shadowColor: selectedEmotion === emotion.key ? emotion.color : 'transparent',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: selectedEmotion === emotion.key ? 0.3 : 0,
                      shadowRadius: 4,
                      elevation: selectedEmotion === emotion.key ? 4 : 0,
                    },
                  ]}
                  onPress={() => setSelectedEmotion(emotion.key)}
                >
                  <ThemedText style={styles.emotionIcon}>{emotion.icon}</ThemedText>
                  <ThemedText
                    style={[
                      styles.emotionLabel,
                      {
                        color:
                          selectedEmotion === emotion.key ? 'white' : colors.text,
                      },
                    ]}
                  >
                    {emotion.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>

          <ThemedView style={[styles.inputContainer, {
            backgroundColor: colors.card,
            shadowColor: colors.cardShadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 4,
          }]}>
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
                }
              ]}
              value={content}
              onChangeText={setContent}
              placeholder="꿈의 내용을 자세히 기록해보세요..."
              placeholderTextColor={colors.icon}
              multiline
              textAlignVertical="top"
            />
          </ThemedView>
        </ScrollView>

        <ThemedView style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                opacity: isLoading ? 0.6 : 1,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }
            ]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryLight]}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ThemedText style={[styles.saveButtonText, { color: 'white' }]}>
                  저장 중...
                </ThemedText>
              ) : (
                <>
                  <IconSymbol name="checkmark.circle.fill" size={24} color="white" />
                  <ThemedText style={[styles.saveButtonText, { color: 'white' }]}>
                    저장하기
                  </ThemedText>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ThemedView>
        </KeyboardAvoidingView>
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
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  savingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  emotionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  emotionButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  emotionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emotionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    minHeight: 200,
    lineHeight: 24,
  },
  footer: {
    padding: 20,
  },
  saveButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});