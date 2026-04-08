import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    StatusBar
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../theme';
import placesService, { Dish, Place } from '../services/placesService';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'DishDetail'>;

export default function DishDetailScreen({ route, navigation }: Props) {
    const { dishId } = route.params;
    const [dish, setDish] = useState<Dish | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDishDetails();
    }, [dishId]);

    const fetchDishDetails = async () => {
        try {
            const data = await placesService.getDishById(dishId);

            // WORKAROUND: La API en Render aún no envía photos ni category en 'recommendedPlaces'.
            // Vamos a forzar la descarga de la info de cada lugar manualmente por ahora.
            if (data && data.recommendedPlaces) {
                const fullPlaces = await Promise.all(
                    data.recommendedPlaces.map(async (p: any) => {
                        try {
                            // Extraemos el ID del lugar. Si viene como string, usamos eso. Si viene como objeto, usamos p._id
                            const placeId = typeof p === 'string' ? p : p._id;
                            const fullPlace = await placesService.getPlaceById(placeId);
                            // Retornamos el lugar completo, o el parcial si falla
                            return fullPlace || p;
                        } catch (e) {
                            return p;
                        }
                    })
                );
                data.recommendedPlaces = fullPlaces;
            }

            setDish(data);
        } catch (error) {
            console.error('Error fetching dish details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!dish) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Plato no encontrado</Text>
                <TouchableOpacity style={styles.backButtonInline} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Header Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: dish.imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' }}
                        style={styles.image}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.gradient}
                    />

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>{dish.name}</Text>
                    </View>
                </View>

                <View style={styles.contentContainer}>

                    <Text style={styles.sectionTitle}>Sobre el plato</Text>
                    <Text style={styles.description}>{dish.description}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>¿Dónde comerlo?</Text>
                    <Text style={styles.subtitle}>Lugares recomendados para disfrutar {dish.name.toLowerCase()}</Text>

                    {dish.recommendedPlaces && dish.recommendedPlaces.length > 0 ? (
                        <View style={styles.placesContainer}>
                            {dish.recommendedPlaces.map((place: any, index: number) => (
                                <TouchableOpacity
                                    key={place._id || index}
                                    style={styles.placeCard}
                                    onPress={() => navigation.navigate('PlaceDetail', { placeId: place._id })}
                                >
                                    <Image
                                        source={{ uri: (place.photos && place.photos[0]) || 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=800' }}
                                        style={styles.placeImage}
                                    />
                                    <View style={styles.placeInfo}>
                                        <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                                        <Text style={styles.placeCategory}>{place.category || 'Restaurante'}</Text>

                                        <View style={styles.ratingContainer}>
                                            <Ionicons name="star" size={14} color={COLORS.accent} />
                                            <Text style={styles.ratingText}>{place.rating?.toFixed(1) || '4.5'}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="restaurant-outline" size={40} color={COLORS.textSecondary} />
                            <Text style={styles.emptyText}>No hay lugares recomendados registrados por el momento.</Text>
                        </View>
                    )}

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: SPACING['4xl'],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginBottom: SPACING.md,
    },
    backButtonInline: {
        padding: SPACING.md,
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
    },
    backButtonText: {
        color: COLORS.textWhite,
        fontWeight: TYPOGRAPHY.bold,
    },
    imageContainer: {
        height: 300,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        left: SPACING.md,
        zIndex: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        position: 'absolute',
        bottom: SPACING.xl,
        left: SPACING.xl,
        right: SPACING.xl,
    },
    title: {
        fontSize: TYPOGRAPHY['3xl'],
        fontWeight: TYPOGRAPHY.bold,
        color: COLORS.textWhite,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    contentContainer: {
        padding: SPACING.xl,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: RADIUS['2xl'],
        borderTopRightRadius: RADIUS['2xl'],
        marginTop: -20,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.xl,
        fontWeight: TYPOGRAPHY.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.lg,
    },
    description: {
        fontSize: TYPOGRAPHY.md,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.xl,
    },
    placesContainer: {
        gap: SPACING.md,
    },
    placeCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        ...SHADOWS.md,
        elevation: 2,
    },
    placeImage: {
        width: 100,
        height: 100,
    },
    placeInfo: {
        flex: 1,
        padding: SPACING.md,
        justifyContent: 'center',
    },
    placeName: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: TYPOGRAPHY.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    placeCategory: {
        fontSize: TYPOGRAPHY.xs,
        color: COLORS.textSecondary,
        textTransform: 'capitalize',
        marginBottom: SPACING.xs,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: TYPOGRAPHY.bold,
        color: COLORS.textPrimary,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
    },
    emptyText: {
        marginTop: SPACING.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
    }
});
