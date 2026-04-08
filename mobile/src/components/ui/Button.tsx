import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../design-system/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const buttonContent = (
    <TouchableOpacity
      style={[
        styles.base,
        styles[size],
        isSecondary && styles.secondary,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
        !isPrimary && style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary || isSecondary ? COLORS.textWhite : COLORS.primary}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
              isOutline && styles.outlineText,
              isGhost && styles.ghostText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );

  if (isPrimary) {
    return (
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, style]}
      >
        {buttonContent}
      </LinearGradient>
    );
  }

  return buttonContent;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  gradient: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  sm: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  md: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  lg: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  secondary: {
    backgroundColor: COLORS.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textWhite,
    marginLeft: SPACING.sm,
  },
  textSm: {
    fontSize: TYPOGRAPHY.sm,
  },
  textMd: {
    fontSize: TYPOGRAPHY.base,
  },
  textLg: {
    fontSize: TYPOGRAPHY.lg,
  },
  outlineText: {
    color: COLORS.primary,
  },
  ghostText: {
    color: COLORS.primary,
  },
});