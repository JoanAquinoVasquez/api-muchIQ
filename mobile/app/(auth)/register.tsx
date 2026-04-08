import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/design-system/theme';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isTourist, setIsTourist] = useState(true);

  const handleRegister = async () => {
    clearError();
    
    if (!username || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      await register({
        username,
        email,
        password,
        isTourist,
        tastes: ['historia', 'aventura', 'comida'], // Default
      });
      // El router redirigirá automáticamente
    } catch (err) {
      Alert.alert('Error', error || 'Error al crear cuenta');
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
          <View style={styles.header}>
            <Text style={styles.dragonIcon}>🐉</Text>
            <Text style={styles.title}>{t('auth.joinUs')}</Text>
            <Text style={styles.subtitle}>
              Comienza tu aventura en Lambayeque
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label={t('auth.username')}
              placeholder="Tu nombre"
              value={username}
              onChangeText={setUsername}
              leftIcon={<Text>👤</Text>}
            />

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
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Text>🔒</Text>}
            />

            <View style={styles.switchContainer}>
              <View>
                <Text style={styles.switchLabel}>{t('auth.isTourist')}</Text>
                <Text style={styles.switchSubtext}>
                  {isTourist ? 'Estoy visitando' : 'Soy de aquí'}
                </Text>
              </View>
              <Switch
                value={isTourist}
                onValueChange={setIsTourist}
                trackColor={{
                  false: theme.colors.neutral[300],
                  true: theme.colors.primary[500],
                }}
              />
            </View>

            <Button
              title={t('auth.createAccount')}
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              size="large"
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('auth.haveAccount')}</Text>
              <Button
                title={t('auth.login')}
                onPress={() => router.back()}
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  switchLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
  switchSubtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
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