// components/modals/AddReviewModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../theme';

interface AddReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  placeName: string;
}

export default function AddReviewModal({
  visible,
  onClose,
  onSubmit,
  placeName,
}: AddReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert('Error', 'El comentario debe tener al menos 10 caracteres');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(rating, comment);
      
      // Resetear formulario
      setRating(0);
      setComment('');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar la reseña');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <Animatable.View
          animation="slideInUp"
          duration={300}
          style={styles.modalContent}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.dragIndicator} />
              <View style={styles.headerContent}>
                <Ionicons name="star" size={24} color={COLORS.accent} />
                <Text style={styles.modalTitle}>Escribe una reseña</Text>
              </View>
              <Text style={styles.placeName}>{placeName}</Text>
            </View>

            {/* Rating Stars */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionLabel}>Tu calificación</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                    activeOpacity={0.7}
                  >
                    <Animatable.View
                      animation={rating >= star ? 'bounceIn' : undefined}
                      duration={300}
                    >
                      <Ionicons
                        name={rating >= star ? 'star' : 'star-outline'}
                        size={40}
                        color={rating >= star ? COLORS.accent : COLORS.textLight}
                      />
                    </Animatable.View>
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Animatable.Text
                  animation="fadeIn"
                  style={styles.ratingText}
                >
                  {getRatingDescription(rating)}
                </Animatable.Text>
              )}
            </View>

            {/* Comment Input */}
            <View style={styles.commentSection}>
              <Text style={styles.sectionLabel}>Tu opinión</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Comparte tu experiencia..."
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={6}
                  maxLength={500}
                  value={comment}
                  onChangeText={setComment}
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>
                  {comment.length}/500
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (rating === 0 || loading) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={rating === 0 || loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textWhite} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.textWhite} />
                    <Text style={styles.submitButtonText}>Publicar reseña</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animatable.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function getRatingDescription(rating: number): string {
  const descriptions: Record<number, string> = {
    1: '😞 Muy malo',
    2: '😕 Malo',
    3: '😐 Regular',
    4: '😊 Bueno',
    5: '🤩 ¡Excelente!',
  };
  return descriptions[rating] || '';
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingBottom: SPACING.xl,
    maxHeight: '90%',
    ...SHADOWS.xl,
  },
  modalHeader: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textLight,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  placeName: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  ratingSection: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  starButton: {
    padding: SPACING.xs,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.accent,
    marginTop: SPACING.sm,
  },
  commentSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  textInput: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    minHeight: 120,
    marginBottom: SPACING.xs,
  },
  characterCount: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    ...SHADOWS.md,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textLight,
    ...SHADOWS.sm,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textWhite,
  },
});