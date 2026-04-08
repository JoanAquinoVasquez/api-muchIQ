import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';

import authService from '@services/authService';
import rewardsService, { Reward } from '@services/rewardsService';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../theme';

const { width } = Dimensions.get('window');

export default function RewardsScreen() {
  const navigation = useNavigation();

  const [user, setUser] = useState<any>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [currentUser, rewardsData, partnersData] = await Promise.all([
        authService.getCurrentUser(),
        rewardsService.getRewards(),
        rewardsService.getPartners(),
      ]);
      setUser(currentUser);
      setRewards(rewardsData);
      setPartners(partnersData);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (!user || user.points < reward.pointsCost) {
      return;
    }

    setRedeeming(true);
    try {
      // Llamada real al backend
      const response = await rewardsService.redeemReward(reward._id);

      setShowQRModal(true);
      setSelectedReward(null);

      // Actualizar puntos del usuario localmente y en el almacenamiento
      const finalPoints = user.points - reward.pointsCost;
      setUser({ ...user, points: finalPoints });
      await authService.updateCurrentUser({ points: finalPoints });

      // Actualizar stock de la recompensa
      setRewards(rewards.map(r =>
        r._id === reward._id ? { ...r, stock: r.stock - 1 } : r
      ));
    } catch (error: any) {
      console.error('Error redeeming reward:', error);
      Alert.alert('Error', error.message || 'No se pudo canjear la recompensa');
    } finally {
      setRedeeming(false);
    }
  };

  const renderRewardCard = (reward: Reward, index: number) => {
    const canAfford = user && user.points >= reward.pointsCost;
    const partner = partners.find(p => p._id === reward.partnerId);

    return (
      <Animatable.View
        key={reward._id}
        animation="fadeInUp"
        delay={index * 100}
        style={styles.rewardCardContainer}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => setSelectedReward(reward)}
          style={[styles.rewardCard, !canAfford && styles.rewardCardDisabled]}
        >
          <Image source={{ uri: reward.imageUrl }} style={styles.rewardImage} />

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.rewardGradient}
          >
            {reward.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{reward.discount} OFF</Text>
              </View>
            )}

            <View style={styles.rewardContent}>
              <View style={styles.rewardHeader}>
                <View style={styles.categoryBadge}>
                  <Ionicons
                    name={getCategoryIcon(partner?.category || 'general')}
                    size={12}
                    color={COLORS.accent}
                  />
                  <Text style={styles.categoryText}>{partner?.category || 'General'}</Text>
                </View>
                <View style={styles.stockBadge}>
                  <Ionicons name="cube-outline" size={10} color={COLORS.textLight} />
                  <Text style={styles.stockText}>{reward.stock} disponibles</Text>
                </View>
              </View>

              <Text style={styles.rewardName} numberOfLines={2}>
                {reward.name}
              </Text>

              <View style={styles.rewardFooter}>
                <View style={styles.pointsContainer}>
                  <Ionicons name="star" size={16} color={COLORS.accent} />
                  <Text style={styles.pointsText}>{reward.pointsCost}</Text>
                  <Text style={styles.pointsLabel}>puntos</Text>
                </View>

                {reward.validUntil && (
                  <View style={styles.validContainer}>
                    <Ionicons name="time-outline" size={12} color={COLORS.textLight} />
                    <Text style={styles.validText}>Válido hasta {reward.validUntil}</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>

          {!canAfford && (
            <View style={styles.lockedOverlay}>
              <BlurView intensity={20} style={styles.lockedBlur}>
                <Ionicons name="lock-closed" size={32} color={COLORS.textWhite} />
                <Text style={styles.lockedText}>
                  Te faltan {reward.pointsCost - (user?.points || 0)} puntos
                </Text>
              </BlurView>
            </View>
          )}
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const getCategoryIcon = (category: string): any => {
    const normalizedCategory = category.toLowerCase();
    const icons: Record<string, any> = {
      'restaurante': 'restaurant',
      'gastronomía': 'restaurant',
      'museo': 'library',
      'cultura': 'library',
      'atractivo turístico': 'map',
      'turismo': 'map',
      'cafeteria': 'cafe',
      'cafe': 'cafe',
      'bar': 'musical-notes',
      'entretenimiento': 'musical-notes',
      'tienda': 'bag-handle',
      'shopping': 'bag-handle',
      'general': 'star',
    };

    for (const [key, icon] of Object.entries(icons)) {
      if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
        return icon;
      }
    }

    return 'gift';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando recompensas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mis Recompensas</Text>
          <Text style={styles.headerSubtitle}>Canjea tus puntos por beneficios</Text>
        </View>

        <View style={styles.headerPoints}>
          <Ionicons name="star" size={20} color={COLORS.accent} />
          <Text style={styles.headerPointsText}>{user?.points || 0}</Text>
        </View>
      </LinearGradient>

      {/* Info Banner */}
      <Animatable.View animation="fadeIn" delay={200}>
        <LinearGradient
          colors={[COLORS.accent + '20', COLORS.accentLight + '10']}
          style={styles.infoBanner}
        >
          <Ionicons name="information-circle" size={24} color={COLORS.accent} />
          <Text style={styles.infoBannerText}>
            ¡Tienes <Text style={styles.infoBannerHighlight}>{user?.points || 0} puntos</Text>!
            Canjéalos por descuentos exclusivos en restaurantes, museos y más.
          </Text>
        </LinearGradient>
      </Animatable.View>

      {/* Rewards Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {rewards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="gift-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No hay recompensas disponibles</Text>
            <Text style={styles.emptySubtext}>Vuelve pronto para nuevas ofertas</Text>
          </View>
        ) : (
          rewards.map((reward, index) => renderRewardCard(reward, index))
        )}
      </ScrollView>

      {/* Reward Detail Modal */}
      <Modal
        visible={selectedReward !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedReward(null)}
      >
        {selectedReward && (
          <BlurView intensity={90} style={styles.modalOverlay}>
            <Animatable.View animation="slideInUp" style={styles.modalContent}>
              <Image
                source={{ uri: selectedReward.imageUrl }}
                style={styles.modalImage}
              />

              <View style={styles.modalBody}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedReward.name}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedReward(null)}
                  >
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDescription}>{selectedReward.description}</Text>

                <View style={styles.modalDetails}>
                  {selectedReward.discount && (
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="pricetag" size={20} color={COLORS.accent} />
                      <Text style={styles.modalDetailText}>
                        Descuento: <Text style={styles.modalDetailBold}>{selectedReward.discount}</Text>
                      </Text>
                    </View>
                  )}
                  {selectedReward.validUntil && (
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="time" size={20} color={COLORS.info} />
                      <Text style={styles.modalDetailText}>
                        Válido hasta: <Text style={styles.modalDetailBold}>{selectedReward.validUntil}</Text>
                      </Text>
                    </View>
                  )}
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="cube" size={20} color={COLORS.success} />
                    <Text style={styles.modalDetailText}>
                      Stock: <Text style={styles.modalDetailBold}>{selectedReward.stock} disponibles</Text>
                    </Text>
                  </View>
                </View>

                {(() => {
                  const partner = partners.find(p => p._id === selectedReward.partnerId);
                  return partner ? (
                    <View style={styles.placesSection}>
                      <Text style={styles.placesSectionTitle}>
                        Válido en:
                      </Text>
                      <View style={styles.placeItem}>
                        <Ionicons name="location" size={16} color={COLORS.primary} />
                        <Text style={styles.placeItemText} numberOfLines={2}>
                          {partner.name} - {partner.address}
                        </Text>
                      </View>
                    </View>
                  ) : null;
                })()}

                <View style={styles.modalActions}>
                  <View style={styles.pointsCostContainer}>
                    <Ionicons name="star" size={24} color={COLORS.accent} />
                    <Text style={styles.pointsCostText}>{selectedReward.pointsCost}</Text>
                    <Text style={styles.pointsCostLabel}>puntos</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.redeemButton,
                      (redeeming || !user || user.points < selectedReward.pointsCost) &&
                      styles.redeemButtonDisabled,
                    ]}
                    onPress={() => handleRedeemReward(selectedReward)}
                    disabled={redeeming || !user || user.points < selectedReward.pointsCost}
                  >
                    <LinearGradient
                      colors={
                        user && user.points >= selectedReward.pointsCost
                          ? [COLORS.primary, COLORS.primaryDark]
                          : [COLORS.textLight, COLORS.textLight]
                      }
                      style={styles.redeemButtonGradient}
                    >
                      {redeeming ? (
                        <ActivityIndicator size="small" color={COLORS.textWhite} />
                      ) : (
                        <>
                          <Ionicons name="ticket" size={20} color={COLORS.textWhite} />
                          <Text style={styles.redeemButtonText}>
                            {user && user.points >= selectedReward.pointsCost
                              ? 'Canjear Ahora'
                              : 'Puntos Insuficientes'}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </Animatable.View>
          </BlurView>
        )}
      </Modal>

      {/* QR Code Modal - SIMULADO */}
      <Modal
        visible={showQRModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowQRModal(false)}
      >
        <BlurView intensity={95} style={styles.qrModalOverlay}>
          <Animatable.View animation="zoomIn" style={styles.qrModalContent}>
            <LinearGradient
              colors={[COLORS.success, COLORS.success + 'DD']}
              style={styles.qrSuccessBanner}
            >
              <Ionicons name="checkmark-circle" size={48} color={COLORS.textWhite} />
              <Text style={styles.qrSuccessText}>¡Recompensa Canjeada!</Text>
            </LinearGradient>

            <View style={styles.qrContainer}>
              <Text style={styles.qrTitle}>Presenta este código QR</Text>
              <View style={styles.qrCodeWrapper}>
                {/* QR SIMULADO - Solo un cuadro con icono */}
                <View style={styles.simulatedQR}>
                  <Ionicons name="qr-code" size={80} color={COLORS.textPrimary} />
                  <Text style={styles.simulatedQRText}></Text>
                </View>
              </View>
              <Text style={styles.qrCode}>CÓDIGO: {Math.random().toString(36).substring(2, 10).toUpperCase()}</Text>
              <Text style={styles.qrInstructions}>
                Muestra este código en el establecimiento para hacer efectivo tu descuento
              </Text>
            </View>

            <TouchableOpacity
              style={styles.qrCloseButton}
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.qrCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </Animatable.View>
        </BlurView>
      </Modal>
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
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.accentLight,
    marginTop: 2,
  },
  headerPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  headerPointsText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  infoBannerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    lineHeight: TYPOGRAPHY.sm * 1.5,
  },
  infoBannerHighlight: {
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.accent,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
  },
  emptyText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  rewardCardContainer: {
    marginBottom: SPACING.md,
  },
  rewardCard: {
    height: 280,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  rewardCardDisabled: {
    opacity: 0.7,
  },
  rewardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  rewardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    ...SHADOWS.md,
  },
  discountText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  rewardContent: {
    gap: SPACING.sm,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textWhite,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textLight,
  },
  rewardName: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    lineHeight: TYPOGRAPHY.xl * 1.3,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pointsText: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.accent,
  },
  pointsLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.accentLight,
  },
  validContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  validText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textLight,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  lockedText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textWhite,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    lineHeight: TYPOGRAPHY['2xl'] * 1.3,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalDescription: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.base * 1.5,
    marginBottom: SPACING.lg,
  },
  modalDetails: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modalDetailText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  modalDetailBold: {
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  placesSection: {
    marginBottom: SPACING.lg,
  },
  placesSectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  placeItemText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  pointsCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pointsCostText: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.accent,
  },
  pointsCostLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  redeemButton: {
    flex: 1,
  },
  redeemButtonDisabled: {
    opacity: 0.5,
  },
  redeemButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  redeemButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  qrModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  qrModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
    ...SHADOWS.xl,
  },
  qrSuccessBanner: {
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  qrSuccessText: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  qrContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  qrTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  qrCodeWrapper: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    ...SHADOWS.md,
  },
  simulatedQR: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  simulatedQRText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.bold,
  },
  qrCode: {
    fontSize: TYPOGRAPHY.sm,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.bold,
  },
  qrInstructions: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sm * 1.5,
  },
  qrCloseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  qrCloseButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textWhite,
  },
});