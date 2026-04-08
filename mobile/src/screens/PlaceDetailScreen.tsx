import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FallbackImage from '@components/ui/FallbackImage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import Card from '@components/ui/Card';
import AddReviewModal from '@components/AddReviewModal';
import placesService, { Place } from '@services/placesService';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../theme';
import { RootStackParamList } from '@navigation/AppNavigator';

const { width, height } = Dimensions.get('window');

type PlaceDetailRouteProp = RouteProp<RootStackParamList, 'PlaceDetail'>;

interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function PlaceDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PlaceDetailRouteProp>();
  const { placeId } = route.params;

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  useEffect(() => {
    loadPlaceDetail();
  }, [placeId]);

  const loadPlaceDetail = async () => {
    try {
      const data = await placesService.getPlaceById(placeId);
      setPlace(data);
    } catch (error) {
      console.error('Error loading place:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlaceDetail();
    setRefreshing(false);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    try {
      const result = await placesService.addReview(placeId, rating, comment);

      // Mostrar mensaje de éxito con puntos ganados
      Alert.alert(
        '¡Reseña publicada! 🎉',
        `${result.message}\n\n+${result.newPoints} puntos ganados`,
        [{ text: 'Genial', style: 'default' }]
      );

      // Recargar los detalles del lugar
      await loadPlaceDetail();
    } catch (error: any) {
      throw error;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando lugar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!place) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorText}>No se pudo cargar el lugar</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadPlaceDetail}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const reviews = (place as any).reviews || [];

  return (
    <View style={styles.container}>
      {/* Header Flotante */}
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.headerGradient}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {place.photos && place.photos.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setCurrentImageIndex(index);
                }}
              >
                {place.photos.map((photo, index) => (
                  <FallbackImage
                    key={index}
                    source={{ uri: photo }}
                    style={styles.placeImage}
                  />
                ))}
              </ScrollView>
              {place.photos.length > 1 && (
                <View style={styles.dotsContainer}>
                  {place.photos.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === currentImageIndex && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <FallbackImage
              source={{ uri: 'https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=800' }}
              style={styles.placeImage}
            />
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Rating */}
          <Animatable.View animation="fadeInUp" delay={200}>
            <View style={styles.titleSection}>
              <View style={styles.categoryBadge}>
                <Ionicons
                  name={getCategoryIcon(place.category)}
                  size={14}
                  color={COLORS.primary}
                />
                <Text style={styles.categoryText}>{place.category}</Text>
              </View>
              <Text style={styles.placeName}>{place.name}</Text>
            </View>
          </Animatable.View>

          {/* Stats Row */}
          <Animatable.View animation="fadeInUp" delay={300}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={20} color={COLORS.accent} />
                <Text style={styles.statValue}>{place.rating?.toFixed(1) || '4.5'}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="chatbubbles" size={20} color={COLORS.info} />
                <Text style={styles.statValue}>{place.numReviews || 0}</Text>
                <Text style={styles.statLabel}>Reseñas</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="images" size={20} color={COLORS.success} />
                <Text style={styles.statValue}>{place.photos?.length || 0}</Text>
                <Text style={styles.statLabel}>Fotos</Text>
              </View>
            </View>
          </Animatable.View>

          {/* Description */}
          {place.description && (
            <Animatable.View animation="fadeInUp" delay={400}>
              <Card style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Descripción</Text>
                </View>
                <Text style={styles.description}>{place.description}</Text>
              </Card>
            </Animatable.View>
          )}

          {/* Address */}
          {place.address && (
            <Animatable.View animation="fadeInUp" delay={500}>
              <Card style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="location" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Ubicación</Text>
                </View>
                <Text style={styles.address}>{place.address}</Text>
                <TouchableOpacity style={styles.mapButton}>
                  <Ionicons name="map-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.mapButtonText}>Ver en el mapa</Text>
                </TouchableOpacity>
              </Card>
            </Animatable.View>
          )}

          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <Animatable.View animation="fadeInUp" delay={600}>
              <Card style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="pricetags" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Categorías</Text>
                </View>
                <View style={styles.tagsContainer}>
                  {place.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{formatTag(tag)}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            </Animatable.View>
          )}

          {/* Reviews */}
          <Animatable.View animation="fadeInUp" delay={700}>
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="chatbubbles" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>
                  Reseñas {reviews.length > 0 && `(${reviews.length})`}
                </Text>
              </View>

              {reviews.length > 0 ? (
                reviews.map((review: Review, index: number) => (
                  <View key={review._id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewUser}>
                        <View style={styles.userAvatar}>
                          <Text style={styles.userAvatarText}>
                            {review.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.reviewUserName}>{review.name}</Text>
                          <Text style={styles.reviewDate}>
                            {formatDate(review.createdAt)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.reviewRating}>
                        <Ionicons name="star" size={14} color={COLORS.accent} />
                        <Text style={styles.reviewRatingText}>{review.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                    {index < reviews.length - 1 && <View style={styles.reviewDivider} />}
                  </View>
                ))
              ) : (
                <View style={styles.emptyReviews}>
                  <Ionicons name="chatbubble-outline" size={48} color={COLORS.textSecondary} />
                  <Text style={styles.emptyReviewsTitle}>Sin reseñas aún</Text>
                  <Text style={styles.emptyReviewsText}>
                    Sé el primero en compartir tu experiencia
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.addReviewButton}
                onPress={() => setReviewModalVisible(true)}
              >
                <Ionicons name="add-circle" size={20} color={COLORS.primary} />
                <Text style={styles.addReviewText}>Escribir una reseña</Text>
              </TouchableOpacity>
            </Card>
          </Animatable.View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Modal de Reseña */}
      <AddReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleSubmitReview}
        placeName={place?.name || ''}
      />
    </View>
  );
}

// Helper functions
function getCategoryIcon(category: string): any {
  const icons: Record<string, string> = {
    restaurante: 'restaurant',
    museo: 'camera',
    evento: 'calendar',
    'atractivo turístico': 'map',
  };
  return icons[category] || 'location';
}

function formatTag(tag: string): string {
  return tag.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  retryText: {
    color: COLORS.textWhite,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  placeImage: {
    width: width,
    height: height * 0.4,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textWhite + '50',
  },
  activeDot: {
    backgroundColor: COLORS.textWhite,
    width: 24,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    marginTop: -SPACING.xl,
    paddingTop: SPACING.lg,
  },
  titleSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: TYPOGRAPHY.semibold,
    textTransform: 'capitalize',
  },
  placeName: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.relaxed * TYPOGRAPHY.base,
  },
  address: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.relaxed * TYPOGRAPHY.base,
    marginBottom: SPACING.sm,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  mapButtonText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
    marginLeft: SPACING.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  tagText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primaryDark,
    fontWeight: TYPOGRAPHY.semibold,
  },
  reviewItem: {
    marginBottom: SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  userAvatarText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  reviewUserName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  reviewDate: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  reviewRatingText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.accent,
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.relaxed * TYPOGRAPHY.sm,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: SPACING.md,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyReviewsTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyReviewsText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  addReviewText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
    marginLeft: SPACING.xs,
  },
  bottomSpacer: {
    height: SPACING['2xl'],
  },
});