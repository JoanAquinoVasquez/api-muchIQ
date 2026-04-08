import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import BottomNavigation from '@components/BottomNavigation';
import placesService, { Place, Dish } from '@services/placesService';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ExploreScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [places, setPlaces] = useState<Place[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animación del botón AI
  const aiButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadData();
    startAIButtonAnimation();
  }, [selectedCategory]);

  const startAIButtonAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(aiButtonScale, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(aiButtonScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [placesData, dishesData] = await Promise.all([
        selectedCategory === 'all'
          ? placesService.getPopularPlaces()
          : placesService.getPlacesByCategory(selectedCategory),
        placesService.getPopularDishes(),
      ]);
      setPlaces(placesData);
      setDishes(dishesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const categories = [
    { id: 'all', label: 'Todo', icon: 'grid-outline', color: COLORS.primary },
    { id: 'restaurante', label: 'Restaurantes', icon: 'restaurant-outline', color: COLORS.accent },
    { id: 'museo', label: 'Museos', icon: 'business-outline', color: COLORS.info },
    { id: 'parque', label: 'Parques', icon: 'map-outline', color: COLORS.success },
    { id: 'playa', label: 'Playas', icon: 'water-outline', color: '#00BCD4' },
    { id: 'mercado', label: 'Mercados', icon: 'storefront-outline', color: '#795548' },
    // { id: 'sitio arqueologico', label: 'Sitios Arqueologicos', icon: 'image-outline', color: '#795548' },
    { id: 'reserva natural', label: 'Reservas Naturales', icon: 'leaf-outline', color: '#13868aff' },
    // { id: 'centro recreacional', label: 'Centros Recreacionales', icon: 'people-outline', color: '#438109ff' },
    { id: 'alojamiento', label: 'Alojamientos', icon: 'bed-outline', color: '#795548' },
  ];

  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header con búsqueda */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorar</Text>
        <Text style={styles.headerSubtitle}>Descubre nuevos lugares</Text>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lugares, platillos..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Categorías horizontales */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((cat, index) => (
              <Animatable.View
                key={cat.id}
                animation="fadeInRight"
                delay={index * 50}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={18}
                    color={selectedCategory === cat.id ? COLORS.textWhite : cat.color}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : (
          <>
            {/* Resultados de búsqueda */}
            {searchQuery.length > 0 && (
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsText}>
                  {filteredPlaces.length + filteredDishes.length} resultados para "{searchQuery}"
                </Text>
              </View>
            )}

            {/* Grid de Lugares */}
            {filteredPlaces.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="location" size={24} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Lugares</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{filteredPlaces.length}</Text>
                  </View>
                </View>

                <View style={styles.placesGrid}>
                  {filteredPlaces.map((place, index) => (
                    <Animatable.View
                      key={place._id}
                      animation="zoomIn"
                      delay={index * 50}
                      style={styles.gridItem}
                    >
                      <TouchableOpacity
                        style={styles.placeCard}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('PlaceDetail', { placeId: place._id })}
                      >
                        <Image
                          source={{ uri: place.photos?.[0] || 'https://via.placeholder.com/200' }}
                          style={styles.placeCardImage}
                        />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.85)']}
                          style={styles.placeCardGradient}
                        >
                          <View style={styles.placeCardContent}>
                            <View style={styles.placeCategoryBadge}>
                              <Text style={styles.placeCategoryText}>{place.category}</Text>
                            </View>
                            <Text style={styles.placeCardName} numberOfLines={2}>
                              {place.name}
                            </Text>
                            <View style={styles.placeCardFooter}>
                              <Ionicons name="star" size={12} color={COLORS.accent} />
                              <Text style={styles.placeCardRating}>
                                {place.rating?.toFixed(1) || '4.8'}
                              </Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animatable.View>
                  ))}
                </View>
              </View>
            )}

            {/* Lista de Platillos */}
            {filteredDishes.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="restaurant" size={24} color={COLORS.accent} />
                  <Text style={styles.sectionTitle}>Gastronomía</Text>
                  <View style={[styles.badge, { backgroundColor: COLORS.accent }]}>
                    <Text style={styles.badgeText}>{filteredDishes.length}</Text>
                  </View>
                </View>

                {filteredDishes.map((dish, index) => (
                  <Animatable.View
                    key={dish._id}
                    animation="fadeInLeft"
                    delay={index * 80}
                  >
                    <TouchableOpacity
                      style={styles.dishCard}
                      activeOpacity={0.95}
                      onPress={() => navigation.navigate('DishDetail', { dishId: dish._id })}
                    >
                      <Image
                        source={{ uri: dish.imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' }}
                        style={styles.dishCardImage}
                      />
                      <View style={styles.dishCardContent}>
                        <Text style={styles.dishCardName} numberOfLines={2}>
                          {dish.name}
                        </Text>
                        <Text style={styles.dishCardDescription} numberOfLines={2}>
                          {dish.description || 'Delicioso platillo típico de la región'}
                        </Text>
                        <View style={styles.dishCardFooter}>
                          <View style={styles.dishLikes}>
                            <Ionicons name="heart" size={14} color={COLORS.error} />
                            <Text style={styles.dishLikesText}>{dish.likes || 0}</Text>
                          </View>
                          <TouchableOpacity style={styles.dishActionButton}>
                            <Text style={styles.dishActionText}>Ver más</Text>
                            <Ionicons name="arrow-forward" size={12} color={COLORS.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Animatable.View>
                ))}
              </View>
            )}

            {/* Estado vacío */}
            {filteredPlaces.length === 0 && filteredDishes.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={80} color={COLORS.textLight} />
                <Text style={styles.emptyStateTitle}>No se encontraron resultados</Text>
                <Text style={styles.emptyStateText}>
                  Intenta con otros términos de búsqueda
                </Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón flotante AI - Solo icono */}
      <Animated.View
        style={[
          styles.floatingAI,
          { transform: [{ scale: aiButtonScale }] },
        ]}
      >
        <TouchableOpacity
          style={styles.aiButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AIAssistant')}
        >
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiButtonGradient}
          >
            <Ionicons name="sparkles" size={26} color={COLORS.textWhite} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  categoriesSection: {
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary + '30',
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.primaryDark,
    fontWeight: TYPOGRAPHY.bold,
  },
  loadingContainer: {
    paddingVertical: SPACING['4xl'],
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  resultsHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  resultsText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  badge: {
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  placesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  gridItem: {
    width: '50%',
    padding: SPACING.xs,
  },
  placeCard: {
    height: 200,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  placeCardImage: {
    width: '100%',
    height: '100%',
  },
  placeCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    justifyContent: 'flex-end',
    padding: SPACING.sm,
  },
  placeCardContent: {
    gap: SPACING.xs,
  },
  placeCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '30',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  placeCategoryText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textWhite,
  },
  placeCardName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  placeCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  placeCardRating: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textWhite,
  },
  dishCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  dishCardImage: {
    width: 120,
    height: 120,
  },
  dishCardContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  dishCardName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  dishCardDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  dishCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  dishLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dishLikesText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  dishActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dishActionText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.primary,
  },
  emptyState: {
    paddingVertical: SPACING['4xl'],
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  floatingAI: {
    position: 'absolute',
    bottom: 100,
    right: SPACING.lg,
    zIndex: 999,
  },
  aiButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    ...SHADOWS.xl,
  },
  aiButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});