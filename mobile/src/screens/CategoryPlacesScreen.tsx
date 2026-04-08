import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import Card from '@components/ui/Card';
import BottomNavigation from '@components/BottomNavigation';
import placesService, { Place } from '@services/placesService';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../theme';
import { RootStackParamList } from '@navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type CategoryPlacesRouteProp = RouteProp<RootStackParamList, 'CategoryPlaces'>;

const CATEGORY_CONFIG: Record<string, { title: string; icon: string; color: string }> = {
  restaurante: { title: 'Gastronomía', icon: 'restaurant', color: COLORS.accent },
  museo: { title: 'Cultura', icon: 'camera', color: COLORS.success },
  evento: { title: 'Eventos', icon: 'calendar', color: COLORS.info },
  'atractivo turístico': { title: 'Atractivos', icon: 'map', color: COLORS.primary },
};

// Eventos hardcodeados
const HARDCODED_EVENTS = [
  {
    _id: 'evento-1',
    name: 'Primera Hackathon Municipal',
    description: 'La Municipalidad de Chiclayo organiza su primera hackathon enfocada en soluciones tecnológicas para la ciudad. Participan equipos multidisciplinarios de toda la región.',
    category: 'evento',
    address: 'Colegio de Ingenieros, Chiclayo',
    photos: [require('../../assets/evento2.jpg')],
    rating: 5.0,
    numReviews: 12,
    status: 'En Curso',
    date: '7, 8 y 9 de Noviembre',
  },
  {
    _id: 'evento-2',
    name: 'Aniversario del Museo Tumbas Reales de Sipán',
    description: 'El museo celebró su 23er aniversario. La agenda principal de actividades (ferias, exposiciones fotográficas y tertulias literarias) se desarrolló durante la semana y culminó el viernes 7 de noviembre.',
    category: 'evento',
    address: 'Museo Tumbas Reales de Sipán, Lambayeque',
    photos: [require('../../assets/evento1.jpg')],
    rating: 4.9,
    numReviews: 45,
    status: 'Culminado',
    date: '7 de Noviembre',
  },

];

export default function CategoryPlacesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<CategoryPlacesRouteProp>();
  const { category } = route.params;

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const config = CATEGORY_CONFIG[category] || { 
    title: category, 
    icon: 'location', 
    color: COLORS.primary 
  };

  const isEventCategory = category === 'evento';

  useEffect(() => {
    if (isEventCategory) {
      // Mostrar eventos hardcodeados
      setPlaces(HARDCODED_EVENTS as any);
    } else {
      loadPlaces();
    }
  }, [category]);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const data = await placesService.getPlacesByCategory(category);
      setPlaces(data);
    } catch (error) {
      console.error('Error loading places:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (isEventCategory) {
      setPlaces(HARDCODED_EVENTS as any);
    } else {
      await loadPlaces();
    }
    setRefreshing(false);
  };

  // Texto dinámico según categoría
  const itemLabel = isEventCategory ? 'evento' : 'lugar';
  const itemLabelPlural = isEventCategory ? 'eventos' : 'lugares';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header con color de categoría */}
      <LinearGradient
        colors={[config.color, config.color + 'DD']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Ionicons name={config.icon as any} size={28} color={COLORS.textWhite} />
          <Text style={styles.headerTitle}>{config.title}</Text>
        </View>

        <View style={styles.placeholder} />
      </LinearGradient>

      {loading && places.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={config.color} />
          <Text style={styles.loadingText}>Buscando {itemLabelPlural}...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={config.color}
            />
          }
        >
          {/* Counter */}
          <Animatable.View animation="fadeInDown" delay={200}>
            <Card style={styles.counterCard}>
              <Ionicons name="list" size={20} color={config.color} />
              <Text style={styles.counterText}>
                {places.length} {places.length === 1 ? `${itemLabel} encontrado` : `${itemLabelPlural} encontrados`}
              </Text>
            </Card>
          </Animatable.View>

          {/* Subtitle para eventos */}
          {isEventCategory && (
            <Animatable.View animation="fadeInUp" delay={300}>
              <View style={styles.subtitleContainer}>
                <Ionicons name="calendar-outline" size={18} color={config.color} />
                <Text style={styles.subtitle}>Eventos de este mes</Text>
              </View>
            </Animatable.View>
          )}

          {/* Places/Events List */}
          {places.map((place, index) => {
            const event = isEventCategory ? (place as any) : null;

            return (
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
                      <Image
                        source={
                          typeof place.photos?.[0] === 'number'
                            ? place.photos[0]
                            : { uri: place.photos?.[0] || 'https://images.pexels.com/photos/258159/pexels-photo-258159.jpeg?auto=compress&cs=tinysrgb&w=800' }
                        }
                        style={styles.placeImage}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.placeGradient}
                      >
                        <View style={styles.badgeRow}>
                          <View style={[styles.placeBadge, { backgroundColor: config.color + '90' }]}>
                            <Ionicons name={config.icon as any} size={12} color={COLORS.textWhite} />
                            <Text style={styles.placeBadgeText}>{place.category}</Text>
                          </View>
                          {event && (
                            <View style={[
                              styles.statusBadge,
                              { backgroundColor: event.status === 'En Curso' ? COLORS.success + 'DD' : COLORS.textSecondary + 'DD' }
                            ]}>
                              <Text style={styles.statusText}>{event.status}</Text>
                            </View>
                          )}
                        </View>
                      </LinearGradient>
                    </View>

                    <View style={styles.placeInfo}>
                      <Text style={styles.placeName} numberOfLines={2}>
                        {place.name}
                      </Text>

                      {event && (
                        <View style={styles.dateContainer}>
                          <Ionicons name="time-outline" size={14} color={config.color} />
                          <Text style={[styles.dateText, { color: config.color }]}>
                            {event.date}
                          </Text>
                        </View>
                      )}

                      {place.description && (
                        <Text style={styles.placeDescription} numberOfLines={2}>
                          {place.description}
                        </Text>
                      )}

                      {place.address && (
                        <View style={styles.addressContainer}>
                          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.addressText} numberOfLines={1}>
                            {place.address}
                          </Text>
                        </View>
                      )}

                      <View style={styles.placeFooter}>
                        <View style={styles.rating}>
                          <Ionicons name="star" size={14} color={COLORS.accent} />
                          <Text style={styles.ratingText}>
                            {place.rating?.toFixed(1) || '4.5'}
                          </Text>
                          <Text style={styles.reviewCount}>
                            ({place.numReviews || 0})
                          </Text>
                        </View>
                        {place.distance && (
                          <View style={styles.distanceContainer}>
                            <Ionicons name="navigate" size={12} color={config.color} />
                            <Text style={[styles.distance, { color: config.color }]}>
                              {place.distance.toFixed(1)} km
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              </Animatable.View>
            );
          })}

          {places.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No se encontraron {itemLabelPlural}</Text>
              <Text style={styles.emptyText}>
                Intenta con otra categoría o ubicación
              </Text>
            </View>
          )}
        </ScrollView>
      )}

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    ...SHADOWS.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  counterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  counterText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.semibold,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  placeCard: {
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
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  placeBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textWhite,
    marginLeft: 4,
    fontWeight: TYPOGRAPHY.semibold,
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textWhite,
    fontWeight: TYPOGRAPHY.bold,
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dateText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    marginLeft: 4,
  },
  placeDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.relaxed * TYPOGRAPHY.sm,
    marginBottom: SPACING.xs,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  addressText: {
    flex: 1,
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
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
    backgroundColor: COLORS.overlay,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  distance: {
    fontSize: TYPOGRAPHY.xs,
    marginLeft: 4,
    fontWeight: TYPOGRAPHY.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});