import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
          <ThemedView style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.label, { color: colors.primary }]}>
              제목 *
            </ThemedText>
            <TextInput
              style={[
                styles.titleInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                }
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="꿈의 제목을 입력하세요"
              placeholderTextColor={colors.icon}
              maxLength={50}
            />
          </ThemedView>

          <ThemedView style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.label, { color: colors.primary }]}>
              기분 *
            </ThemedText>
            <ThemedView style={styles.emotionContainer}>
              {emotions.map((emotion) => (
                <TouchableOpacity
                  key={emotion.key}
                  style={[
                    styles.emotionButton,
                    {
                      backgroundColor:
                        selectedEmotion === emotion.key ? emotion.color : colors.background,
                      borderColor: emotion.color,
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

          <ThemedView style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.label, { color: colors.primary }]}>
              내용 *
            </ThemedText>
            <TextInput
              ref={contentInputRef}
              style={[
                styles.contentInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
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

        <ThemedView style={[styles.footer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: colors.primary,
                opacity: isLoading ? 0.6 : 1,
              }
            ]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ThemedText style={[styles.saveButtonText, { color: 'white' }]}>
                저장 중...
              </ThemedText>
            ) : (
              <>
                <IconSymbol name="checkmark" size={20} color="white" />
                <ThemedText style={[styles.saveButtonText, { color: 'white' }]}>
                  저장하기
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  emotionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  emotionButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  emotionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  emotionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 200,
  },
  footer: {
    padding: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});