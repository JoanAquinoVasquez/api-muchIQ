import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Card from '@components/ui/Card';
import { useLanguage } from '@hooks/useLanguage';
import authService from '@services/authService';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();

  const [step, setStep] = useState(1); // 1: Datos básicos, 2: Preferencias
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    isTourist: true,
    reasonForVisit: '',
    tastes: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const slideAnim = useRef(new Animated.Value(0)).current;

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const toggleTaste = (taste: string) => {
    setFormData(prev => {
      const tastes = prev.tastes.includes(taste)
        ? prev.tastes.filter(t => t !== taste)
        : [...prev.tastes, taste];
      return { ...prev, tastes };
    });
  };

  const validateStep1 = (): boolean => {
    const newErrors: any = {};
    let valid = true;

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Mínimo 3 caracteres';
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Ingresa tu email';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Ingresa una contraseña';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'No coinciden';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      Animated.timing(slideAnim, {
        toValue: -1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setStep(2));
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        isTourist: formData.isTourist,
        reasonForVisit: formData.reasonForVisit,
        tastes: formData.tastes,
      });
      navigation.replace('Home');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const visitReasons = [
    { id: 'historia', label: 'Historia', icon: 'book-outline' },
    { id: 'aventura', label: 'Aventura', icon: 'navigate-outline' },
    { id: 'gastronomia', label: 'Gastronomía', icon: 'restaurant-outline' },
    { id: 'cultura', label: 'Cultura', icon: 'color-palette-outline' },
    { id: 'familia', label: 'Familia', icon: 'people-outline' },
    { id: 'naturaleza', label: 'Naturaleza', icon: 'leaf-outline' },
  ];

  const interestTags = [
    { id: 'museos', label: 'Museos', icon: 'business-outline' },
    { id: 'playas', label: 'Playas', icon: 'water-outline' },
    { id: 'arqueologia', label: 'Arqueología', icon: 'skull-outline' },
    { id: 'naturaleza', label: 'Naturaleza', icon: 'leaf-outline' },
    { id: 'aventura', label: 'Aventura', icon: 'bicycle-outline' },
    { id: 'fotografia', label: 'Fotografía', icon: 'camera-outline' },
    { id: 'artesania', label: 'Artesanía', icon: 'diamond-outline' },
    { id: 'compras', label: 'Compras', icon: 'bag-handle-outline' },
    { id: 'vida_nocturna', label: 'Vida Nocturna', icon: 'moon-outline' },
    { id: 'relajacion', label: 'Relajación', icon: 'cafe-outline' },
    { id: 'comida_salada', label: 'Comida Criolla', icon: 'restaurant-outline' },
    { id: 'pescados', label: 'Pescados y Mariscos', icon: 'fish-outline' },
    { id: 'carnes', label: 'Carnes y Parrillas', icon: 'bonfire-outline' },
    { id: 'comida_dulce', label: 'Postres/Dulces', icon: 'ice-cream-outline' },
    { id: 'clima_calor', label: 'Clima Cálido', icon: 'sunny-outline' },
    { id: 'clima_frio', label: 'Clima Fresco', icon: 'snow-outline' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark, COLORS.surfaceDark]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
          </View>

          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Step 1: Datos Básicos */}
            {step === 1 && (
              <Animatable.View animation="fadeInRight" duration={400}>
                {/* Hero */}
                <View style={styles.stepHeader}>
                  <Animatable.Text
                    animation="bounceIn"
                    style={styles.stepEmoji}
                  >
                    👋
                  </Animatable.Text>
                  <Text style={styles.stepTitle}>¡Hola, explorador!</Text>
                  <Text style={styles.stepSubtitle}>
                    Cuéntanos un poco sobre ti
                  </Text>
                </View>

                {/* Form Card */}
                <Card style={styles.formCard}>
                  <Input
                    placeholder="¿Cómo te llamas?"
                    value={formData.username}
                    onChangeText={(value) => updateField('username', value)}
                    icon="person-outline"
                    error={errors.username}
                  />

                  <Input
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChangeText={(value) => updateField('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon="mail-outline"
                    error={errors.email}
                  />

                  <Input
                    placeholder="Crea una contraseña"
                    value={formData.password}
                    onChangeText={(value) => updateField('password', value)}
                    isPassword
                    icon="lock-closed-outline"
                    error={errors.password}
                  />

                  <Input
                    placeholder="Confirma tu contraseña"
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateField('confirmPassword', value)}
                    isPassword
                    icon="lock-closed-outline"
                    error={errors.confirmPassword}
                  />

                  <Animatable.View
                    animation="pulse"
                    iterationCount="infinite"
                    duration={2000}
                  >
                    <Button
                      title="Continuar"
                      onPress={handleNextStep}
                      icon={<Ionicons name="arrow-forward" size={20} color={COLORS.textWhite} />}
                    />
                  </Animatable.View>
                </Card>
              </Animatable.View>
            )}

            {/* Step 2: Preferencias Visuales */}
            {step === 2 && (
              <Animatable.View animation="fadeInRight" duration={400}>
                {/* Hero */}
                <View style={styles.stepHeader}>
                  <Animatable.Text
                    animation="bounceIn"
                    style={styles.stepEmoji}
                  >
                    🎯
                  </Animatable.Text>
                  <Text style={styles.stepTitle}>¿Qué te trae a Lambayeque?</Text>
                  <Text style={styles.stepSubtitle}>
                    Selecciona lo que más te interesa
                  </Text>
                </View>

                {/* Visit Reasons - Chips Visuales */}
                <Animatable.View animation="fadeInUp" delay={200}>
                  <Card style={styles.preferencesCard}>
                    <Text style={styles.sectionLabel}>Motivo de tu visita</Text>
                    <View style={styles.chipsContainer}>
                      {visitReasons.map((reason, index) => {
                        const isSelected = formData.reasonForVisit === reason.id;
                        return (
                          <Animatable.View
                            key={reason.id}
                            animation="zoomIn"
                            delay={300 + index * 50}
                          >
                            <TouchableOpacity
                              style={[
                                styles.chip,
                                isSelected && styles.chipSelected,
                              ]}
                              onPress={() => updateField('reasonForVisit', reason.id)}
                              activeOpacity={0.7}
                            >
                              {isSelected ? (
                                <BlurView intensity={60} tint="light" style={styles.chipBlur}>
                                  <Ionicons
                                    name={reason.icon as any}
                                    size={18}
                                    color={COLORS.textWhite}
                                  />
                                  <Text style={styles.chipTextSelected}>{reason.label}</Text>
                                  <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
                                </BlurView>
                              ) : (
                                <>
                                  <Ionicons
                                    name={reason.icon as any}
                                    size={18}
                                    color={COLORS.textSecondary}
                                  />
                                  <Text style={styles.chipText}>{reason.label}</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </Animatable.View>
                        );
                      })}
                    </View>
                  </Card>
                </Animatable.View>

                {/* Interest Tags - Multi-select */}
                <Animatable.View animation="fadeInUp" delay={400}>
                  <Card style={styles.preferencesCard}>
                    <Text style={styles.sectionLabel}>
                      Tus intereses <Text style={styles.optional}>(opcional)</Text>
                    </Text>
                    <Text style={styles.sectionHint}>Selecciona todos los que quieras</Text>
                    <View style={styles.chipsContainer}>
                      {interestTags.map((interest, index) => {
                        const isSelected = formData.tastes.includes(interest.id);
                        return (
                          <Animatable.View
                            key={interest.id}
                            animation="zoomIn"
                            delay={500 + index * 50}
                          >
                            <TouchableOpacity
                              style={[
                                styles.chipSmall,
                                isSelected && styles.chipSmallSelected,
                              ]}
                              onPress={() => toggleTaste(interest.id)}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name={interest.icon as any}
                                size={16}
                                color={isSelected ? COLORS.textWhite : COLORS.textSecondary}
                              />
                              <Text style={[
                                styles.chipTextSmall,
                                isSelected && styles.chipTextSmallSelected
                              ]}>
                                {interest.label}
                              </Text>
                              {isSelected && (
                                <Ionicons name="checkmark" size={14} color={COLORS.accent} />
                              )}
                            </TouchableOpacity>
                          </Animatable.View>
                        );
                      })}
                    </View>
                  </Card>
                </Animatable.View>

                {/* Submit Button */}
                <Animatable.View
                  animation="fadeInUp"
                  delay={600}
                  style={styles.submitContainer}
                >
                  <Animatable.View
                    animation="pulse"
                    iterationCount="infinite"
                    duration={2000}
                  >
                    <Button
                      title={loading ? "Creando cuenta..." : "Comenzar Aventura"}
                      onPress={handleRegister}
                      loading={loading}
                      icon={!loading ? (
                        <Ionicons name="rocket-outline" size={20} color={COLORS.textWhite} />
                      ) : undefined}
                    />
                  </Animatable.View>
                </Animatable.View>
              </Animatable.View>
            )}

            {/* Login CTA */}
            <Animatable.View animation="fadeIn" delay={800} style={styles.loginPrompt}>
              <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}>Inicia sesión</Text>
              </TouchableOpacity>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.overlay,
    borderRadius: RADIUS.full,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textWhite + '30',
  },
  progressDotActive: {
    backgroundColor: COLORS.accent,
    width: 12,
    height: 12,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.textWhite + '30',
    marginHorizontal: SPACING.xs,
  },
  progressLineActive: {
    backgroundColor: COLORS.accent,
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  stepHeader: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  stepEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.accentLight,
    textAlign: 'center',
    opacity: 0.9,
  },
  formCard: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  preferencesCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  optional: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.textSecondary,
  },
  sectionHint: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.textLight + '30',
    gap: SPACING.xs,
    minHeight: 44,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.accent,
  },
  chipBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.medium,
  },
  chipTextSelected: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textWhite,
    fontWeight: TYPOGRAPHY.semibold,
  },
  chipSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.textLight + '40',
    gap: 6,
    minHeight: 36,
  },
  chipSmallSelected: {
    backgroundColor: COLORS.primary + '90',
    borderColor: COLORS.accent,
  },
  chipTextSmall: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.medium,
  },
  chipTextSmallSelected: {
    color: COLORS.textWhite,
    fontWeight: TYPOGRAPHY.semibold,
  },
  submitContainer: {
    marginTop: SPACING.lg,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  loginText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textWhite,
    opacity: 0.7,
    marginRight: SPACING.xs,
  },
  loginLink: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.semibold,
  },
});
