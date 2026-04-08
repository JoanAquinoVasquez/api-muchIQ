import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import * as Location from 'expo-location';

import Card from '@components/ui/Card';
import BottomNavigation from '@components/BottomNavigation';
import placesService, { Place } from '@services/placesService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/AppNavigator';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../theme';

const USER_LOCATION = { lat: -6.814744198519895, lng: -79.90752985381165 };

export default function NearbyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(USER_LOCATION);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Usar ubicación por defecto si deniega
        loadNearbyPlaces(USER_LOCATION.lat, USER_LOCATION.lng);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newLoc = { lat: location.coords.latitude, lng: location.coords.longitude };
      setUserLocation(newLoc);
      loadNearbyPlaces(newLoc.lat, newLoc.lng);
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback
      loadNearbyPlaces(USER_LOCATION.lat, USER_LOCATION.lng);
    }
  };

  const loadNearbyPlaces = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const data = await placesService.getNearbyPlaces(lat, lng, 5);
      setPlaces(data);
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNearbyPlaces(userLocation.lat, userLocation.lng);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary + 'DD']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Ionicons name="map" size={28} color={COLORS.textWhite} />
          <Text style={styles.headerTitle}>Cerca de ti</Text>
        </View>

        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Info Card */}
        <Animatable.View animation="fadeInDown" delay={200}>
          <Card style={styles.infoCard}>
            <Ionicons name="location" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Mostrando lugares dentro de 5 km de tu ubicación
            </Text>
          </Card>
        </Animatable.View>

        {/* Places List */}
        {places.map((place, index) => (
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
                    source={{ uri: place.photos?.[0] }}
                    style={styles.placeImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gradient}
                  />
                </View>

                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <Text style={styles.placeCategory}>{place.category}</Text>

                  <View style={styles.placeFooter}>
                    <View style={styles.rating}>
                      <Ionicons name="star" size={14} color={COLORS.accent} />
                      <Text style={styles.ratingText}>
                        {place.rating?.toFixed(1) || '4.5'}
                      </Text>
                    </View>
                    <View style={styles.distance}>
                      <Ionicons name="navigate" size={12} color={COLORS.primary} />
                      <Text style={styles.distanceText}>
                        {(place.distance || 0).toFixed(1)} km
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </ScrollView>

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Agregar nuevo estilo
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  infoText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  placeCard: {
    marginBottom: SPACING.md,
    padding: 0,
    overflow: 'hidden',
  },
  placeImageContainer: {
    height: 180,
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
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
  placeCategory: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    marginBottom: SPACING.sm,
  },
  placeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  distance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  distanceText: {
    marginLeft: 4,
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
  },
});