import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../src/components/ui/Card';
import { placesService, dishesService } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/design-system/theme';
import type { Place, Dish } from '../../src/types';

export default function FeedScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  
  const [popularPlaces, setPopularPlaces] = useState<Place[]>([]);
  const [popularDishes, setPopularDishes] = useState<Dish[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeedData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar lugares populares
      const places = await placesService.getPopularPlaces();
      setPopularPlaces(places.slice(0, 5));
      
      // Cargar platos populares
      const dishes = await dishesService.getPopularDishes();
      setPopularDishes(dishes.slice(0, 5));
      
    } catch (error) {
      console.error('Error loading feed:', error);
      // Datos de ejemplo para desarrollo
      setPopularPlaces([
        {
          _id: '1',
          name: 'Museo Tumbas Reales de Sipán',
          description: 'Descubre la historia del Señor de Sipán',
          category: 'museo',
          address: 'Av. Juan Pablo Vizcardo y Guzmán 895',
          longitude: -79.8404,
          latitude: -6.7717,
          tags: ['historia', 'cultura'],
          photos: [],
          rating: 4.8,
          distance: 2.3,
        },
      ]);
      
      setPopularDishes([
        {
          _id: '1',
          name: 'Arroz con Pato',
          description: 'Plato bandera de Lambayeque',
          imageUrl: '',
          recommendedPlaces: [],
          likes: 120,
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeedData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadFeedData();
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={[theme.colors.primary[500], theme.colors.primary[600]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              {user?.isTourist ? '¡Bienvenido!' : '¡Hola de nuevo!'}
            </Text>
            <Text style={styles.username}>{user?.username || 'Explorador'}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={toggleLanguage}
            >
              <Text style={styles.languageText}>
                {i18n.language === 'es' ? '🇺🇸 EN' : '🇵🇪 ES'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsIcon}>⭐</Text>
              <Text style={styles.pointsText}>{user?.points || 0}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.headerSubtitle}>
          {t('feed.title')}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
      >
        {/* Sección de Lugares Populares */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              🔥 {t('feed.popularPlaces')}
            </Text>
          </View>

          {isLoading ? (
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          ) : (
            popularPlaces.map((place) => (
              <Card
                key={place._id}
                title={place.name}
                description={place.description}
                category={place.category}
                distance={place.distance}
                rating={place.rating}
                onPress={() => console.log('Navegar a lugar:', place._id)}
              />
            ))
          )}
        </View>

        {/* Sección de Platos Típicos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              🍽️ {t('feed.popularDishes')}
            </Text>
          </View>

          {isLoading ? (
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          ) : (
            popularDishes.map((dish) => (
              <Card
                key={dish._id}
                title={dish.name}
                description={dish.description}
                imageUrl={dish.imageUrl}
                onPress={() => console.log('Ver plato:', dish._id)}
              />
            ))
          )}
        </View>

        {/* CTA motivacional */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaIcon}>🐉</Text>
          <Text style={styles.ctaText}>
            ¡Explora Lambayeque y gana puntos por cada lugar que visites!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  greeting: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },
  username: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  languageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  languageText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semiBold,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary[500],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  pointsIcon: {
    fontSize: 16,
  },
  pointsText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weights.medium,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  loadingText: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    padding: theme.spacing.xl,
  },
  ctaContainer: {
    backgroundColor: theme.colors.accent[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  ctaIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  ctaText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
  },
});