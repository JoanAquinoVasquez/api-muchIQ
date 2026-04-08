import React, { useState, useRef, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';

import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Card from '@components/ui/Card';
import { useLanguage } from '@hooks/useLanguage';
import authService from '@services/authService';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../theme';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  // Animaciones
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Calcular el top dinámico para iOS considerando Dynamic Island
  const dynamicTop = Platform.OS === 'ios' 
    ? Math.max(insets.top, SPACING.lg)
    : SPACING.md;

  const validate = (): boolean => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Ingresa tu email';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Ingresa tu contraseña';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    try {
      await authService.login({ email, password });
      navigation.replace('Home');
    } catch (error: any) {
      Alert.alert('Error de acceso', error.message || 'Verifica tus credenciales');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    // Credenciales de demo
    const demoEmail = 'jesus@gmail.com';
    const demoPassword = 'hola123';
    
    // Setear en el estado para feedback visual
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    
    // Animación del botón
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    try {
      // Login directo sin validación de UI
      await authService.login({ email: demoEmail, password: demoPassword });
      navigation.replace('Home');
    } catch (error: any) {
      Alert.alert('Error de acceso demo', error.message || 'Error al acceder con credenciales demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark, COLORS.surfaceDark]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { top: dynamicTop }
          ]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero Section - MÁS COMPACTO */}
            <View style={styles.hero}>
              <Animatable.View animation="fadeInUp" delay={300}>
                <Text style={styles.heroTitle}>Bienvenido</Text>
                <Text style={styles.heroSubtitle}>
                  Inicia tu aventura en Lambayeque
                </Text>
              </Animatable.View>
            </View>

            {/* Benefits - MÁS COMPACTOS */}
            <Animatable.View animation="fadeInUp" delay={500} style={styles.benefitsContainer}>
              <BlurView intensity={40} tint="dark" style={styles.benefitsBlur}>
                <View style={styles.benefitsRow}>
                  {[
                    { icon: 'ticket-outline', label: 'Descuentos', color: COLORS.accent },
                    { icon: 'bulb-outline', label: 'IA Personal', color: COLORS.primary },
                    { icon: 'medal-outline', label: 'Puntos', color: COLORS.success },
                  ].map((benefit, index) => (
                    <Animatable.View
                      key={index}
                      animation="zoomIn"
                      delay={700 + index * 100}
                      style={styles.benefitItem}
                    >
                      <View style={[styles.benefitIcon, { backgroundColor: benefit.color + '25' }]}>
                        <Ionicons 
                          name={benefit.icon as any} 
                          size={18} 
                          color={benefit.color} 
                        />
                      </View>
                      <Text style={styles.benefitLabel}>{benefit.label}</Text>
                    </Animatable.View>
                  ))}
                </View>
              </BlurView>
            </Animatable.View>

            {/* Form Card - MÁS COMPACTO */}
            <Animated.View 
              style={[
                styles.formContainer,
                { transform: [{ translateX: shakeAnim }] }
              ]}
            >
              <Animatable.View animation="fadeInUp" delay={900}>
                <Card style={styles.formCard}>
                  <View style={styles.formHeader}>
                    <Ionicons name="lock-closed" size={18} color={COLORS.primary} />
                    <Text style={styles.formTitle}>Acceso seguro</Text>
                  </View>

                  <View style={styles.inputsContainer}>
                    <Input
                      placeholder="tu@email.com"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      icon="mail-outline"
                      error={errors.email}
                    />

                    <Input
                      placeholder="Contraseña"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      isPassword
                      icon="lock-closed-outline"
                      error={errors.password}
                    />
                  </View>

                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </TouchableOpacity>

                  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <Button
                      title={loading ? "Accediendo..." : "Entrar"}
                      onPress={handleLogin}
                      loading={loading}
                      icon={!loading ? (
                        <Ionicons name="log-in-outline" size={20} color={COLORS.textWhite} />
                      ) : undefined}
                    />
                  </Animated.View>
                </Card>
              </Animatable.View>
            </Animated.View>

            {/* Botón Demo para Jurado - SIN SCROLL NECESARIO */}
            <Animatable.View animation="fadeInUp" delay={1100} style={styles.demoContainer}>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.divider} />
              </View>
              
              <TouchableOpacity
                style={styles.demoButton}
                onPress={handleDemoLogin}
                activeOpacity={0.8}
                disabled={loading}
              >
                <LinearGradient
                  colors={[COLORS.accent, COLORS.accentDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.demoGradient}
                >
                  <Ionicons name="play-circle" size={20} color={COLORS.textWhite} />
                  <Text style={styles.demoButtonText}>
                    {loading ? "Accediendo..." : "Probar Demo"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <Text style={styles.demoHint}>
                Acceso rápido para evaluadores
              </Text>
            </Animatable.View>

            {/* Register CTA - MÁS COMPACTO */}
            <Animatable.View animation="fadeInUp" delay={1300} style={styles.registerContainer}>
              <Text style={styles.registerText}>¿Aún no tienes cuenta?</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Register')}
                style={styles.registerButton}
              >
                <Text style={styles.registerLink}>Crear una ahora</Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.accent} />
              </TouchableOpacity>
            </Animatable.View>

            {/* Trust Badge Simple */}
            <Animatable.View animation="fadeIn" delay={1500} style={styles.trustBadge}>
              <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.success} />
              <Text style={styles.trustText}>Conexión segura</Text>
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
  backButton: {
    position: 'absolute',
    left: SPACING.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.lg,
    justifyContent: 'center',
    minHeight: height * 0.95, // Asegurar que ocupe casi toda la pantalla
  },
  hero: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textWhite + 'CC',
    textAlign: 'center',
  },
  benefitsContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  benefitsBlur: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  benefitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  benefitItem: {
    alignItems: 'center',
    flex: 1,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  benefitLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textWhite,
  },
  formContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  formCard: {
    padding: SPACING.lg,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  formTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  inputsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.medium,
  },
  demoContainer: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.textWhite + '20',
  },
  dividerText: {
    color: COLORS.textWhite + '70',
    fontSize: TYPOGRAPHY.sm,
    marginHorizontal: SPACING.sm,
    fontWeight: TYPOGRAPHY.medium,
  },
  demoButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  demoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  demoButtonText: {
    color: COLORS.textWhite,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
  },
  demoHint: {
    textAlign: 'center',
    color: COLORS.textWhite + '60',
    fontSize: TYPOGRAPHY.xs,
    marginTop: SPACING.xs,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  registerText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textWhite + 'CC',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  registerLink: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.bold,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  trustText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textWhite + '80',
  },
});