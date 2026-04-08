import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  FlatList,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';

import VideoBackground from '@components/VideoBackground';
import LanguageToggle from '@components/LanguageToggle';
import Button from '@components/ui/Button';
import Card from '@components/ui/Card';
import { useLanguage } from '@hooks/useLanguage';
import placesService, { Place, Dish } from '@services/placesService';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../theme';
import LoadingOverlay from '@components/LoadingOverlay';
import { Asset } from 'expo-asset';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

// Custom animations
const slideInUpBig = {
  from: {
    opacity: 0,
    translateY: height,
  },
  to: {
    opacity: 1,
    translateY: 0,
  },
};

const zoomInRotate = {
  from: {
    opacity: 0,
    scale: 0.3,
    rotate: '-20deg',
  },
  to: {
    opacity: 1,
    scale: 1,
    rotate: '0deg',
  },
};

const heartBeat: any = {
  0: {
    scale: 1,
  },
  0.25: {
    scale: 1.15,
  },
  0.5: {
    scale: 1,
  },
  0.75: {
    scale: 1.15,
  },
  1: {
    scale: 1,
  },
};

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();

  const [popularPlaces, setPopularPlaces] = useState<Place[]>([]);
  const [popularDishes, setPopularDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [stats, setStats] = useState({ places: 0, dishes: 0, users: 0 });
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  // Refs para auto-scroll
  const placesScrollRef = useRef<FlatList>(null);
  const dishesScrollRef = useRef<FlatList>(null);
  const scrollIntervalRef = useRef<any>(null);

  // Animated values
  const heroOpacity = useRef(new Animated.Value(1)).current;
  const heroScale = useRef(new Animated.Value(1)).current;
  const contentSlide = useRef(new Animated.Value(height)).current;
  const floatingAnim1 = useRef(new Animated.Value(0)).current;
  const floatingAnim2 = useRef(new Animated.Value(0)).current;
  const parallaxScroll = useRef(new Animated.Value(0)).current;

  // Animated value para el botón flotante
  const floatingButtonOpacity = useRef(new Animated.Value(0)).current;
  const floatingButtonScale = useRef(new Animated.Value(0)).current;

  const preloadAssets = async () => {
    await Asset.fromModule(require('../../assets/videos/saludo.gif')).downloadAsync();
  };

  const handleStartAdventure = () => {
    console.log('🚀 Iniciando aventura...');
    setShowLoadingOverlay(true);
  };

  const handleLoadingComplete = () => {
    console.log('✅ Loading completado, navegando a Login...');
    setShowLoadingOverlay(false);
    navigation.replace('Login');
  };

  useEffect(() => {
    preloadAssets();
    loadFeedData();
    startIntroSequence();
    startFloatingAnimations();
  }, []);

  useEffect(() => {
    if (showContent && !loading) {
      startAutoScroll();
      animateStats();
      showFloatingButton();
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [showContent, loading]);

  const showFloatingButton = () => {
    Animated.parallel([
      Animated.spring(floatingButtonScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(floatingButtonOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideFloatingButton = () => {
    Animated.parallel([
      Animated.timing(floatingButtonScale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(floatingButtonOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    // Calcular cuánto falta para llegar al final
    const distanceFromBottom = contentHeight - (scrollY + layoutHeight);

    // Ocultar el botón cuando esté cerca del final (últimos 300px)
    if (distanceFromBottom < 400) {
      hideFloatingButton();
    } else if (scrollY > 100) {
      showFloatingButton();
    }
  };

  const loadFeedData = async () => {
    try {
      const [places, dishes] = await Promise.all([
        placesService.getPopularPlaces(),
        placesService.getPopularDishes(),
      ]);
      setPopularPlaces(places.slice(0, 8));
      setPopularDishes(dishes.slice(0, 8));
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const startIntroSequence = () => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(heroOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(heroScale, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(contentSlide, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowContent(true);
      });
    }, 3000);
  };

  const startFloatingAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim1, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim1, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim2, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim2, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateStats = () => {
    const targetStats = { places: 150, dishes: 89, users: 1200 };
    let currentStats = { places: 0, dishes: 0, users: 0 };

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      currentStats = {
        places: Math.floor(targetStats.places * progress),
        dishes: Math.floor(targetStats.dishes * progress),
        users: Math.floor(targetStats.users * progress),
      };

      setStats(currentStats);

      if (step >= steps) {
        clearInterval(timer);
        setStats(targetStats);
      }
    }, interval);
  };

  const startAutoScroll = () => {
    let index = 0;

    scrollIntervalRef.current = setInterval(() => {
      if (popularPlaces.length > 0 && placesScrollRef.current) {
        index = (index + 1) % popularPlaces.length;
        placesScrollRef.current.scrollToIndex({
          index,
          animated: true,
        });
      }

      setTimeout(() => {
        if (popularDishes.length > 0 && dishesScrollRef.current) {
          const dishIndex = (index + 2) % popularDishes.length;
          dishesScrollRef.current.scrollToIndex({
            index: dishIndex,
            animated: true,
          });
        }
      }, 1000);
    }, 3000);
  };

  const floating1Style = {
    transform: [
      {
        translateY: floatingAnim1.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        }),
      },
    ],
  };

  const floating2Style = {
    transform: [
      {
        translateY: floatingAnim2.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
    ],
  };

  const renderPlaceCard = ({ item: place, index }: { item: Place; index: number }) => (
    <Animatable.View
      animation="zoomIn"
      delay={index * 100}
      style={styles.cardWrapper}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => { }}
      >
        <Animated.View style={[styles.placeCard, floating1Style]}>
          <Image
            source={{ uri: place.photos?.[0] || 'https://images.pexels.com/photos/258159/pexels-photo-258159.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.placeImage}
          />

          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            style={styles.categoryBadge}
          >
            <BlurView intensity={80} tint="dark" style={styles.badgeBlur}>
              <Ionicons name="location" size={14} color={COLORS.accent} />
              <Text style={styles.categoryText}>{place.category}</Text>
            </BlurView>
          </Animatable.View>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.95)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {place.name}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color={COLORS.accent} />
                  <Text style={styles.ratingText}>{place.rating?.toFixed(1) || '4.8'}</Text>
                  <Text style={styles.reviewCount}>({place.numReviews || 150})</Text>
                </View>

                {place.distance && (
                  <View style={styles.distanceContainer}>
                    <Ionicons name="navigate" size={14} color={COLORS.primaryLight} />
                    <Text style={styles.distanceText}>{place.distance.toFixed(1)} km</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderDishCard = ({ item: dish, index }: { item: Dish; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 120}
      style={styles.cardWrapper}
    >
      <TouchableOpacity activeOpacity={0.95}>
        <Animated.View style={[styles.dishCard, floating2Style]}>
          <Image
            source={{ uri: dish.imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.dishImage}
          />

          <Animatable.View
            animation={heartBeat}
            iterationCount="infinite"
            duration={1000}
            style={styles.likesBadge}
          >
            <BlurView intensity={80} tint="dark" style={styles.badgeBlur}>
              <Ionicons name="heart" size={16} color={COLORS.error} />
              <Text style={styles.likesText}>{dish.likes || 0}</Text>
            </BlurView>
          </Animatable.View>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <Text style={styles.dishTitle} numberOfLines={2}>
                {dish.name}
              </Text>
              <Text style={styles.dishDescription} numberOfLines={2}>
                {dish.description}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <VideoBackground opacity={0.5} />

      {/* Hero Inicial (3 segundos) - OCULTAR SI LOADING */}
      {!showContent && !showLoadingOverlay && (
        <Animated.View
          style={[
            styles.heroOverlay,
            {
              opacity: heroOpacity,
              transform: [{ scale: heroScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(26, 155, 142, 0.3)', 'rgba(21, 107, 99, 0.7)', 'rgba(31, 41, 55, 0.9)']}
            style={styles.heroGradient}
          >
            <Animatable.View animation="zoomIn" duration={1500}>
              <Text style={styles.heroTitle}>Descubre{'\n'}Lambayeque</Text>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={800}>
              <Text style={styles.heroSubtitle}>
                ¿Listo para descubrir lo que otros no conocen?
              </Text>
            </Animatable.View>

            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              style={styles.scrollHint}
            >
              <Ionicons name="chevron-down" size={32} color={COLORS.accentLight} />
            </Animatable.View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Contenido Principal - OCULTAR SI LOADING */}
      {!showLoadingOverlay && (
        <Animated.View
          style={[
            styles.contentContainer,
            {
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <Animatable.View animation="fadeInDown" style={styles.header}>
              <Animatable.Text
                animation="pulse"
                iterationCount="infinite"
                style={styles.headerTitle}
              >
                🌟 MuchIQ
              </Animatable.Text>
              <LanguageToggle />
            </Animatable.View>

            <Animated.ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: parallaxScroll } } }],
                {
                  useNativeDriver: true,
                  listener: handleScroll,
                }
              )}
              scrollEventThrottle={16}
            >
              {/* Hero Content */}
              <Animatable.View animation={slideInUpBig} duration={1000} style={styles.hero}>
                <LinearGradient
                  colors={[COLORS.primary + '40', COLORS.primaryDark + '60']}
                  style={styles.heroBanner}
                >
                  <Animatable.Text
                    animation="fadeInUp"
                    delay={200}
                    style={styles.title}
                  >
                    {t.welcome.title}
                  </Animatable.Text>

                  <Animatable.Text
                    animation="fadeInUp"
                    delay={400}
                    style={styles.subtitle}
                  >
                    {t.welcome.subtitle}
                  </Animatable.Text>
                </LinearGradient>
              </Animatable.View>

              {/* Stats Animados */}
              <Animatable.View animation="fadeInUp" delay={600} style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Animatable.Text
                    animation="bounceIn"
                    delay={800}
                    style={styles.statNumber}
                  >
                    {stats.places}+
                  </Animatable.Text>
                  <Text style={styles.statLabel}>Lugares</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statBox}>
                  <Animatable.Text
                    animation="bounceIn"
                    delay={1000}
                    style={styles.statNumber}
                  >
                    {stats.dishes}+
                  </Animatable.Text>
                  <Text style={styles.statLabel}>Platillos</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statBox}>
                  <Animatable.Text
                    animation="bounceIn"
                    delay={1200}
                    style={styles.statNumber}
                  >
                    {stats.users}+
                  </Animatable.Text>
                  <Text style={styles.statLabel}>Exploradores</Text>
                </View>
              </Animatable.View>

              {/* Popular Places */}
              {popularPlaces.length > 0 && (
                <Animatable.View animation="fadeInLeft" delay={800} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Animatable.View animation="rotate" iterationCount="infinite" duration={3000}>
                      <Ionicons name="compass" size={28} color={COLORS.accent} />
                    </Animatable.View>
                    <Text style={styles.sectionTitle}>{t.feed.popularPlaces}</Text>
                  </View>

                  <FlatList
                    ref={placesScrollRef}
                    data={popularPlaces}
                    renderItem={renderPlaceCard}
                    keyExtractor={(item, idx) => `${item._id}-${idx}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CARD_WIDTH + SPACING.md}
                    decelerationRate="fast"
                    contentContainerStyle={styles.carouselContent}
                    onScrollToIndexFailed={() => { }}
                  />
                </Animatable.View>
              )}

              {/* Popular Dishes */}
              {popularDishes.length > 0 && (
                <Animatable.View animation="fadeInRight" delay={1000} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Animatable.View animation="swing" iterationCount="infinite" duration={2000}>
                      <Ionicons name="restaurant" size={28} color={COLORS.accent} />
                    </Animatable.View>
                    <Text style={styles.sectionTitle}>{t.feed.popularDishes}</Text>
                  </View>

                  <FlatList
                    ref={dishesScrollRef}
                    data={popularDishes}
                    renderItem={renderDishCard}
                    keyExtractor={(item, idx) => `${item._id}-${idx}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CARD_WIDTH * 0.85 + SPACING.md}
                    decelerationRate="fast"
                    contentContainerStyle={styles.carouselContent}
                    onScrollToIndexFailed={() => { }}
                  />
                </Animatable.View>
              )}

              {/* Features Grid */}
              <Animatable.View animation="fadeInUp" delay={1200} style={styles.featuresSection}>
                <Text style={styles.sectionTitle}>¿Qué te espera?</Text>

                <View style={styles.featuresGrid}>
                  {[
                    { icon: 'gift', title: 'Recompensas', desc: 'Gana puntos' },
                    { icon: 'sparkles', title: 'IA Personal', desc: 'Rutas únicas' },
                    { icon: 'trophy', title: 'Logros', desc: 'Desbloquea' },
                    { icon: 'people', title: 'Comunidad', desc: '1000+ users' },
                  ].map((feature, index) => (
                    <Animatable.View
                      key={index}
                      animation="zoomIn"
                      delay={1400 + index * 100}
                      style={styles.featureCardContainer}
                    >
                      <BlurView intensity={60} tint="dark" style={styles.featureCard}>
                        <Animatable.View
                          animation="pulse"
                          iterationCount="infinite"
                          duration={2000 + index * 500}
                        >
                          <LinearGradient
                            colors={[COLORS.primary + '30', COLORS.primaryDark + '50']}
                            style={styles.featureIcon}
                          >
                            <Ionicons name={feature.icon as any} size={24} color={COLORS.accent} />
                          </LinearGradient>
                        </Animatable.View>
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        <Text style={styles.featureDesc}>{feature.desc}</Text>
                      </BlurView>
                    </Animatable.View>
                  ))}
                </View>
              </Animatable.View>

              {/* CTA Final */}
              <Animatable.View
                animation="bounceIn"
                delay={1600}
                style={styles.ctaContainer}
              >
                <BlurView intensity={60} tint="dark" style={styles.ctaBlur}>
                  <Animatable.View
                    animation="pulse"
                    iterationCount="infinite"
                    duration={2000}
                  >
                    <Button
                      title={t.welcome.cta}
                      onPress={handleStartAdventure}
                      size="lg"
                      icon={<Ionicons name="rocket" size={22} color={COLORS.textWhite} />}
                    />
                  </Animatable.View>

                  <Animatable.Text
                    animation="flash"
                    iterationCount="infinite"
                    duration={3000}
                    style={styles.ctaSubtext}
                  >
                    ✨ A un click de tu aventura inteligente ✨
                  </Animatable.Text>
                </BlurView>
              </Animatable.View>

              <View style={styles.bottomSpacer} />
            </Animated.ScrollView>
          </SafeAreaView>

          {/* Botón Flotante de Acceso Rápido */}
          {showContent && (
            <Animated.View
              style={[
                styles.floatingButtonContainer,
                {
                  opacity: floatingButtonOpacity,
                  transform: [{ scale: floatingButtonScale }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleStartAdventure}
              >
                <View style={styles.floatingButtonShadow}>
                  <LinearGradient
                    colors={[COLORS.accent, COLORS.accentDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.floatingButton}
                  >
                    <Animatable.View
                      animation="pulse"
                      iterationCount="infinite"
                      duration={2000}
                      style={styles.floatingButtonContent}
                    >
                      <Ionicons name="log-in" size={20} color={COLORS.textWhite} />
                      <Text style={styles.floatingButtonText}>Entrar</Text>
                    </Animatable.View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      )}

      {/* Loading Overlay - AL FINAL */}
      {showLoadingOverlay && (
        <LoadingOverlay
          visible={showLoadingOverlay}
          onComplete={handleLoadingComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceDark,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: TYPOGRAPHY['5xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    letterSpacing: 2,
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.xl,
    color: COLORS.accentLight,
    marginTop: SPACING.lg,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scrollHint: {
    position: 'absolute',
    bottom: SPACING['3xl'],
  },
  contentContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.overlay,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING['4xl'],
  },
  hero: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  heroBanner: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY['4xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.accentLight,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.overlay,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.accent,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textWhite,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.textLight,
    opacity: 0.3,
  },
  section: {
    marginTop: SPACING['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    marginLeft: SPACING.sm,
  },
  carouselContent: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.lg,
  },
  cardWrapper: {
    marginRight: SPACING.md,
  },
  placeCard: {
    width: CARD_WIDTH,
    height: 280,
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
    ...SHADOWS.xl,
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  badgeBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: 4,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  categoryText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textWhite,
    textTransform: 'capitalize',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    marginBottom: SPACING.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textWhite,
    opacity: 0.7,
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '90',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  distanceText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textWhite,
    marginLeft: 4,
  },
  dishCard: {
    width: CARD_WIDTH * 0.85,
    height: 240,
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  dishImage: {
    width: '100%',
    height: '100%',
  },
  likesBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  likesText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textWhite,
  },
  dishTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    marginBottom: SPACING.xs,
  },
  dishDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textWhite,
    opacity: 0.8,
  },
  featuresSection: {
    marginTop: SPACING['2xl'],
    paddingHorizontal: SPACING.lg,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  featureCardContainer: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    ...SHADOWS.md,
  },
  featureCard: {
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textWhite,
    marginBottom: SPACING.xs,
  },
  featureDesc: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textWhite,
    opacity: 0.7,
    textAlign: 'center',
  },
  ctaContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING['2xl'],
    ...SHADOWS.lg,
  },
  ctaBlur: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  ctaSubtext: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.accentLight,
    marginTop: SPACING.md,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.medium,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
  // Estilos del botón flotante
  floatingButtonContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    zIndex: 1000,
  },
  floatingButtonShadow: {
    borderRadius: RADIUS.full,
    ...SHADOWS.xl,
    elevation: 8,
  },
  floatingButton: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  floatingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
  },
  floatingButtonText: {
    color: COLORS.textWhite,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
  },
});