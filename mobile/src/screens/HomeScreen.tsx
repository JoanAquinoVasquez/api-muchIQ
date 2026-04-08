import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import FallbackImage from '@components/ui/FallbackImage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import Card from '@components/ui/Card';
import AppHeader from '@components/AppHeader';
import BottomNavigation from '@components/BottomNavigation';
import { useLanguage } from '@hooks/useLanguage';
import placesService, { Place, Dish } from '@services/placesService';
import authService from '@services/authService';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../theme';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();

  const [user, setUser] = useState<any>(null);
  const [feedPlaces, setFeedPlaces] = useState<Place[]>([]);
  const [feedDishes, setFeedDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animaciones
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
    loadFeedData();
    startPulseAnimation();
    startGlowAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startGlowAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadUserData = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const loadFeedData = async () => {
    setLoading(true);
    try {
      const [places, dishes] = await Promise.all([
        placesService.getPopularPlaces(),
        placesService.getPopularDishes(),
      ]);
      setFeedPlaces(places.slice(0, 10));
      setFeedDishes(dishes.slice(0, 5));
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeedData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.replace('Welcome');
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const categories = [
    {
      icon: 'map',
      label: 'Cerca de ti',
      color: COLORS.primary,
      onPress: () => navigation.navigate('Nearby')
    },
    {
      icon: 'restaurant',
      label: 'Gastronomía',
      color: COLORS.accent,
      onPress: () => navigation.navigate('CategoryPlaces', { category: 'restaurante' })
    },
    {
      icon: 'camera',
      label: 'Cultura',
      color: COLORS.success,
      onPress: () => navigation.navigate('CategoryPlaces', { category: 'museo' })
    },
    {
      icon: 'calendar',
      label: 'Eventos',
      color: COLORS.info,
      onPress: () => navigation.navigate('CategoryPlaces', { category: 'evento' })
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Reutilizable */}
      <AppHeader
        user={user}
        showRewards={true}
        showLogout={true}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
          />
        }
      >
        {/* Quick Categories - SIEMPRE VISIBLES */}
        <View style={styles.categoriesSection}>
          <View style={styles.categoriesGrid}>
            {categories.map((item, index) => (
              <Animatable.View
                key={index}
                animation="zoomIn"
                delay={200 + index * 100}
                style={styles.categoryItem}
              >
                <TouchableOpacity
                  style={styles.categoryCard}
                  activeOpacity={0.8}
                  onPress={item.onPress}
                >
                  <LinearGradient
                    colors={[item.color + '30', item.color + '15']}
                    style={styles.categoryGradient}
                  >
                    <View style={[styles.categoryIconContainer, { backgroundColor: item.color + '40' }]}>
                      <Ionicons name={item.icon as any} size={24} color={item.color} />
                    </View>
                    <Text style={[styles.categoryLabel, { color: item.color }]}>
                      {item.label}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </View>

        {/* Feed de Lugares */}
        {feedPlaces.length > 0 && (
          <View style={styles.feedSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Descubre Lambayeque</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Ver todo</Text>
              </TouchableOpacity>
            </View>

            {feedPlaces.map((place, index) => (
              <Animatable.View
                key={place._id}
                animation="fadeInUp"
                delay={index * 50}
              >
                <TouchableOpacity
                  onPress={() => navigation.navigate('PlaceDetail', { placeId: place._id })}
                  activeOpacity={0.95}
                >
                  <Card style={styles.placeCard}>
                    <View style={styles.placeImageContainer}>
                      <FallbackImage
                        source={{
                          uri: place.photos?.[0] || 'https://images.pexels.com/photos/258159/pexels-photo-258159.jpeg?auto=compress&cs=tinysrgb&w=800'
                        }}
                        style={styles.placeImage}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.placeGradient}
                      >
                        <View style={styles.placeBadge}>
                          <Ionicons name="location" size={12} color={COLORS.accent} />
                          <Text style={styles.placeBadgeText}>{place.category}</Text>
                        </View>
                      </LinearGradient>
                    </View>

                    <View style={styles.placeInfo}>
                      <Text style={styles.placeName} numberOfLines={1}>
                        {place.name}
                      </Text>
                      <Text style={styles.placeDescription} numberOfLines={2}>
                        {place.description || 'Descubre este increíble lugar'}
                      </Text>
                      <View style={styles.placeFooter}>
                        <View style={styles.rating}>
                          <Ionicons name="star" size={14} color={COLORS.accent} />
                          <Text style={styles.ratingText}>
                            {place.rating?.toFixed(1) || '4.8'}
                          </Text>
                          <Text style={styles.reviewCount}>
                            ({place.numReviews || 150})
                          </Text>
                        </View>
                        {place.distance && (
                          <View style={styles.distanceContainer}>
                            <Ionicons name="navigate" size={12} color={COLORS.primary} />
                            <Text style={styles.distance}>
                              {place.distance.toFixed(1)} km
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        )}

        {/* Feed de Gastronomía */}
        {feedDishes.length > 0 && (
          <View style={styles.feedSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sabores del Norte</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Ver todo</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dishesScroll}
            >
              {feedDishes.map((dish, index) => (
                <Animatable.View
                  key={dish._id}
                  animation="fadeInRight"
                  delay={index * 100}
                >
                  <TouchableOpacity
                    style={styles.dishCard}
                    activeOpacity={0.95}
                  >
                    <FallbackImage
                      source={{
                        uri: dish.imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'
                      }}
                      style={styles.dishImage}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.9)']}
                      style={styles.dishGradient}
                    >
                      <Text style={styles.dishName} numberOfLines={2}>
                        {dish.name}
                      </Text>
                      <View style={styles.dishFooter}>
                        <Ionicons name="heart" size={14} color={COLORS.error} />
                        <Text style={styles.dishLikes}>{dish.likes || 0}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating AI Button */}
      <Animated.View
        style={[
          styles.floatingAI,
          {
            transform: [{ scale: pulseAnim }],
            opacity: glowOpacity,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.aiButtonContainer}
          activeOpacity={0.9}
          onPress={() => {
            navigation.navigate('AIAssistant'); // ← CAMBIO AQUÍ
          }}
        >
          <LinearGradient
            colors={[COLORS.accent, COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiButtonGradient}
          >
            <Ionicons name="sparkles" size={28} color={COLORS.textWhite} />
            <Text style={styles.aiButtonText}>Pregúntame</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Navigation Reutilizable */}
      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  categoriesSection: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  categoryItem: {
    width: '50%',
    padding: SPACING.xs,
  },
  categoryCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  categoryGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    textAlign: 'center',
  },
  feedSection: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
  },
  placeCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: 0,
    overflow: 'hidden',
  },
  placeImageContainer: {
    height: 200,
    position: 'relative',
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  placeGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: SPACING.sm,
  },
  placeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  placeBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textWhite,
    marginLeft: 4,
    fontWeight: TYPOGRAPHY.semibold,
    textTransform: 'capitalize',
  },
  placeInfo: {
    padding: SPACING.md,
  },
  placeName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  placeDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.relaxed * TYPOGRAPHY.sm,
    marginBottom: SPACING.sm,
  },
  placeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  distance: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: TYPOGRAPHY.semibold,
  },
  dishesScroll: {
    paddingHorizontal: SPACING.lg,
  },
  dishCard: {
    width: 180,
    height: 240,
    borderRadius: RADIUS.xl,
    marginRight: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  dishImage: {
    width: '100%',
    height: '100%',
  },
  dishGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  dishName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    marginBottom: SPACING.xs,
  },
  dishFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dishLikes: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textWhite,
    marginLeft: 4,
    fontWeight: TYPOGRAPHY.semibold,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
  floatingAI: {
    position: 'absolute',
    bottom: 90,
    right: SPACING.md,
    zIndex: 100,
  },
  aiButtonContainer: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.xl,
  },
  aiButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  aiButtonText: {
    color: COLORS.textWhite,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
  },
});