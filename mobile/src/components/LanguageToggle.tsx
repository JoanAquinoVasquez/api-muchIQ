import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../design-system/theme';
import * as Animatable from 'react-native-animatable';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Animatable.View animation="fadeInDown" duration={800} delay={300}>
      <TouchableOpacity
        style={styles.container}
        onPress={toggleLanguage}
        activeOpacity={0.8}
      >
        <View style={[styles.option, language === 'es' && styles.activeOption]}>
          <Text style={[styles.text, language === 'es' && styles.activeText]}>
            ES
          </Text>
        </View>
        <View style={[styles.option, language === 'en' && styles.activeOption]}>
          <Text style={[styles.text, language === 'en' && styles.activeText]}>
            EN
          </Text>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.overlayLight,
    borderRadius: RADIUS.full,
    padding: 4,
    ...SHADOWS.sm,
  },
  option: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    minWidth: 50,
    alignItems: 'center',
    overflow: 'hidden',
  },
  activeOption: {
    backgroundColor: COLORS.primary,
  },
  text: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
  },
  activeText: {
    color: COLORS.textWhite,
  },
});