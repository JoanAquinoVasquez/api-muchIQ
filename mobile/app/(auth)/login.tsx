import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/design-system/theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    clearError();
    
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      await login({ email, password });
      // El router redirigirá automáticamente por el layout
    } catch (err) {
      Alert.alert('Error', error || 'Credenciales incorrectas');
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary[500], theme.colors.primary[700]]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header con mascota */}
          <View style={styles.header}>
            <Text style={styles.dragonIcon}>🐉</Text>
            <Text style={styles.title}>{t('auth.welcomeBack')}</Text>
            <Text style={styles.subtitle}>
              Tu guía experto te está esperando
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            <Input
              label={t('auth.email')}
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Text>📧</Text>}
            />

            <Input
              label={t('auth.password')}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Text>🔒</Text>}
            />

            <Button
              title={t('auth.login')}
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="large"
            />

            {/* Beneficios rápidos */}
            <View style={styles.benefits}>
              <Text style={styles.benefitsTitle}>✨ Al iniciar sesión:</Text>
              <Text style={styles.benefit}>🗺️ Recomendaciones personalizadas con IA</Text>
              <Text style={styles.benefit}>🎮 Gana puntos por cada lugar que visites</Text>
              <Text style={styles.benefit}>🎁 Canjea descuentos en restaurantes</Text>
            </View>

            {/* Link a registro */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
              <Button
                title={t('auth.createAccount')}
                onPress={() => router.push('/(auth)/register')}
                variant="ghost"
                size="small"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  dragonIcon: {
    fontSize: 80,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.xl,
  },
  benefits: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius.md,
  },
  benefitsTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  benefit: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginVertical: theme.spacing.xs,
  },
  footer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
});
