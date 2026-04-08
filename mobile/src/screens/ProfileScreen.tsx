import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import profileService, { UserProfile } from '@services/profileService';
import authService from '@services/authService';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../theme';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getUserProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
          },
        },
      ]
    );
  };

  const getTasteIcon = (taste: string) => {
    const icons: Record<string, any> = {
      playas: 'water',
      arqueologia: 'flask',
      artesania: 'color-palette',
      fotografia: 'camera',
      gastronomia: 'restaurant',
      aventura: 'fitness',
      naturaleza: 'leaf',
      historia: 'book',
    };
    return icons[taste.toLowerCase()] || 'heart';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Ionicons name="sad-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Tarjeta de perfil principal */}
        <Animatable.View animation="fadeInDown" style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[COLORS.accent, COLORS.accentDark]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {profile.username.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>

          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.email}>{profile.email}</Text>

          {profile.isTourist && (
            <View style={styles.touristBadge}>
              <Ionicons name="airplane" size={16} color={COLORS.primary} />
              <Text style={styles.touristText}>Turista</Text>
            </View>
          )}

          {/* Puntos */}
          <LinearGradient
            colors={[COLORS.accent + '20', COLORS.accentLight + '10']}
            style={styles.pointsCard}
          >
            <Ionicons name="star" size={32} color={COLORS.accent} />
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsValue}>{profile.points}</Text>
              <Text style={styles.pointsLabel}>Puntos</Text>
            </View>
          </LinearGradient>
        </Animatable.View>

        {/* Estadía */}
        {profile.isTourist && profile.stayEndDate && (
          <Animatable.View animation="fadeInUp" delay={100} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Estadia</Text>
            </View>
            <View style={styles.stayCard}>
              <Text style={styles.stayLabel}>Hasta el</Text>
              <Text style={styles.stayDate}>
                {new Date(profile.stayEndDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </Animatable.View>
        )}

        {/* Intereses */}
        {profile.tastes && profile.tastes.length > 0 && (
          <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Mis Intereses</Text>
            </View>
            <View style={styles.tastesContainer}>
              {profile.tastes.map((taste, index) => (
                <View key={index} style={styles.tasteChip}>
                  <Ionicons name={getTasteIcon(taste)} size={16} color={COLORS.primary} />
                  <Text style={styles.tasteText}>{taste}</Text>
                </View>
              ))}
            </View>
          </Animatable.View>
        )}

        {/* Lugares visitados */}
        {profile.visitedPlaces && profile.visitedPlaces.length > 0 && (
          <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Lugares Visitados</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{profile.visitedPlaces.length}</Text>
              </View>
            </View>

            {profile.visitedPlaces.map((place, index) => (
              <View key={place._id} style={styles.placeCard}>
                {place.photos && place.photos[0] && (
                  <Image source={{ uri: place.photos[0] }} style={styles.placeImage} />
                )}
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName} numberOfLines={2}>
                    {place.name}
                  </Text>
                  <View style={styles.categoryBadge}>
                    <Ionicons name="pricetag" size={12} color={COLORS.accent} />
                    <Text style={styles.categoryText}>{place.category}</Text>
                  </View>
                </View>
              </View>
            ))}
          </Animatable.View>
        )}

        {/* Botón de editar perfil */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile' as never)}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.editButtonGradient}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.textWhite} />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    ...SHADOWS.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  avatarText: {
    fontSize: TYPOGRAPHY['4xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  username: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  touristBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  touristText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.primary,
  },
  pointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsValue: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.accent,
  },
  pointsLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  badge: {
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  stayCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  stayLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  stayDate: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  tastesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tasteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  tasteText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  placeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  placeImage: {
    width: 80,
    height: 80,
  },
  placeInfo: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  placeName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  editButton: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  editButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
});