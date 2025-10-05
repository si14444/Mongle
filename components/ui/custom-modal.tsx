import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  children?: React.ReactNode;
  showCloseButton?: boolean;
}

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  children,
  showCloseButton = true,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getIconForType = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark.circle.fill', color: colors.positive };
      case 'error':
        return { name: 'xmark.circle.fill', color: colors.negative };
      case 'warning':
        return { name: 'exclamationmark.triangle.fill', color: '#FF9500' };
      default:
        return { name: 'info.circle.fill', color: colors.primary };
    }
  };

  const icon = getIconForType();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <ThemedView style={[styles.modalContainer, {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.cardShadow,
            }]}>
              <LinearGradient
                colors={[colors.card, colors.background]}
                style={styles.modalGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                {showCloseButton && (
                  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <IconSymbol name={"xmark" as any} size={16} color={colors.icon} />
                  </TouchableOpacity>
                )}

                <ThemedView style={styles.iconContainer}>
                  <IconSymbol name={icon.name as any} size={48} color={icon.color} />
                </ThemedView>

                <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
                  {title}
                </ThemedText>

                {message && (
                  <ThemedText style={[styles.message, { color: colors.icon }]}>
                    {message}
                  </ThemedText>
                )}

                {children}

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={onClose}
                >
                  <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                    확인
                  </ThemedText>
                </TouchableOpacity>
              </LinearGradient>
            </ThemedView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  type = 'warning',
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getIconForType = () => {
    switch (type) {
      case 'danger':
        return { name: 'trash.fill', color: colors.negative };
      case 'warning':
        return { name: 'exclamationmark.triangle.fill', color: '#FF9500' };
      default:
        return { name: 'questionmark.circle.fill', color: colors.primary };
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'danger':
        return colors.negative;
      default:
        return colors.primary;
    }
  };

  const icon = getIconForType();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <ThemedView style={[styles.modalContainer, {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.cardShadow,
            }]}>
              <LinearGradient
                colors={[colors.card, colors.background]}
                style={styles.modalGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <ThemedView style={styles.iconContainer}>
                  <IconSymbol name={icon.name as any} size={48} color={icon.color} />
                </ThemedView>

                <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
                  {title}
                </ThemedText>

                <ThemedText style={[styles.message, { color: colors.icon }]}>
                  {message}
                </ThemedText>

                <ThemedView style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: colors.border }]}
                    onPress={onClose}
                  >
                    <ThemedText style={[styles.cancelButtonText, { color: colors.text }]}>
                      {cancelText}
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.confirmButton, { backgroundColor: getConfirmButtonColor() }]}
                    onPress={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                      {confirmText}
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </LinearGradient>
            </ThemedView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    borderRadius: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 12,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  iconContainer: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.8,
  },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 110,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export { CustomModal, ConfirmModal };