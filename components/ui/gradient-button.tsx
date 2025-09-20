import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  style?: any;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  style,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return [colors.secondary, colors.secondary + 'CC'];
      case 'accent':
        return [colors.accent, colors.accent + 'CC'];
      case 'neutral':
        return [colors.neutral, colors.neutral + 'CC'];
      default:
        return [colors.primary, colors.primaryLight];
    }
  };

  const getShadowColor = () => {
    switch (variant) {
      case 'secondary':
        return colors.secondary;
      case 'accent':
        return colors.accent;
      case 'neutral':
        return colors.neutral;
      default:
        return colors.primary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 16,
          fontSize: 14,
          iconSize: 16,
        };
      case 'large':
        return {
          paddingHorizontal: 32,
          paddingVertical: 18,
          borderRadius: 24,
          fontSize: 17,
          iconSize: 24,
        };
      default:
        return {
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderRadius: 20,
          fontSize: 16,
          iconSize: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          opacity: disabled || loading ? 0.6 : 1,
          shadowColor: getShadowColor(),
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
          borderRadius: sizeStyles.borderRadius,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <LinearGradient
        colors={getColors()}
        style={[
          styles.gradient,
          {
            paddingHorizontal: sizeStyles.paddingHorizontal,
            paddingVertical: sizeStyles.paddingVertical,
            borderRadius: sizeStyles.borderRadius,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            {icon && (
              <IconSymbol
                name={icon}
                size={sizeStyles.iconSize}
                color="white"
              />
            )}
            <ThemedText
              style={[
                styles.buttonText,
                {
                  color: 'white',
                  fontSize: sizeStyles.fontSize,
                },
              ]}
            >
              {title}
            </ThemedText>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontWeight: '600',
  },
});