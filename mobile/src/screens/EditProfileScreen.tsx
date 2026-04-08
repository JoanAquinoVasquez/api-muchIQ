import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';

import profileService, { UserProfile } from '@services/profileService';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../theme';

export default function EditProfileScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Form states
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [isTourist, setIsTourist] = useState(false);
    const [tastes, setTastes] = useState<string[]>([]);

    const interestTags = [
        { id: 'museos', label: 'Museos', icon: 'business-outline' },
        { id: 'playas', label: 'Playas', icon: 'water-outline' },
        { id: 'arqueologia', label: 'Arqueología', icon: 'skull-outline' },
        { id: 'naturaleza', label: 'Naturaleza', icon: 'leaf-outline' },
        { id: 'aventura', label: 'Aventura', icon: 'bicycle-outline' },
        { id: 'fotografia', label: 'Fotografía', icon: 'camera-outline' },
        { id: 'artesania', label: 'Artesanía', icon: 'diamond-outline' },
        { id: 'compras', label: 'Compras', icon: 'bag-handle-outline' },
        { id: 'vida_nocturna', label: 'Vida Nocturna', icon: 'moon-outline' },
        { id: 'relajacion', label: 'Relajación', icon: 'cafe-outline' },
        { id: 'comida_salada', label: 'Comida Criolla', icon: 'restaurant-outline' },
        { id: 'pescados', label: 'Pescados y Mariscos', icon: 'fish-outline' },
        { id: 'carnes', label: 'Carnes y Parrillas', icon: 'bonfire-outline' },
        { id: 'comida_dulce', label: 'Postres/Dulces', icon: 'ice-cream-outline' },
        { id: 'clima_calor', label: 'Clima Cálido', icon: 'sunny-outline' },
        { id: 'clima_frio', label: 'Clima Fresco', icon: 'snow-outline' },
    ];

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await profileService.getUserProfile();
            setProfile(data);
            setUsername(data.username);
            setEmail(data.email);
            setIsTourist(data.isTourist);
            setTastes(data.tastes || []);
        } catch (error) {
            console.error('Error loading profile:', error);
            Alert.alert('Error', 'No se pudo cargar el perfil');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const toggleTaste = (taste: string) => {
        if (tastes.includes(taste)) {
            setTastes(tastes.filter(t => t !== taste));
        } else {
            setTastes([...tastes, taste]);
        }
    };

    const handleSave = async () => {
        if (!username.trim()) {
            Alert.alert('Error', 'El nombre de usuario no puede estar vacío');
            return;
        }

        try {
            setSaving(true);
            await profileService.updateProfile({
                username,
                isTourist,
                tastes
            });

            // Mostramos la animación de éxito propia de la app
            setShowSuccess(true);

            // Y luego de 2 segundos regresamos a la pantalla de perfil
            setTimeout(() => {
                setShowSuccess(false);
                navigation.goBack();
            }, 2000);

        } catch (error: any) {
            console.error('Error updating profile:', error);
            // Si hay error mostramos alerta
            Alert.alert('Error', 'La funcionalidad de actualización podría no estar activa. ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Cargando perfil...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
                <View style={{ width: 40 }} /> {/* Placeholder */}
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.formContainer}>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre de Usuario</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Tu nombre de usuario"
                                    placeholderTextColor={COLORS.textLight}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Correo Electrónico (No modificable)</Text>
                            <View style={[styles.inputWrapper, styles.disabledInput]}>
                                <Ionicons name="mail-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: COLORS.textLight }]}
                                    value={email}
                                    editable={false}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.touristToggle}
                            activeOpacity={0.7}
                            onPress={() => setIsTourist(!isTourist)}
                        >
                            <View style={styles.touristToggleInfo}>
                                <Ionicons name="airplane-outline" size={24} color={isTourist ? COLORS.primary : COLORS.textSecondary} />
                                <View style={{ marginLeft: SPACING.md }}>
                                    <Text style={[styles.touristToggleTitle, isTourist && { color: COLORS.primary }]}>
                                        Modo Turista
                                    </Text>
                                    <Text style={styles.touristToggleDesc}>
                                        {isTourist ? 'Activado. Te daremos recomendaciones para viajes.' : 'Desactivado. Eres local.'}
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.checkbox, isTourist && styles.checkboxActive]}>
                                {isTourist && <Ionicons name="checkmark" size={16} color={COLORS.textWhite} />}
                            </View>
                        </TouchableOpacity>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tus intereses</Text>
                            <View style={styles.tastesContainer}>
                                {interestTags.map((interest) => {
                                    const isSelected = tastes.includes(interest.id);
                                    return (
                                        <TouchableOpacity
                                            key={interest.id}
                                            style={[styles.tasteChip, isSelected && styles.tasteChipSelected]}
                                            onPress={() => toggleTaste(interest.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons
                                                name={interest.icon as any}
                                                size={16}
                                                color={isSelected ? COLORS.primary : COLORS.textSecondary}
                                                style={{ marginRight: 6 }}
                                            />
                                            <Text style={[styles.tasteChipText, isSelected && styles.tasteChipTextSelected]}>
                                                {interest.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <LinearGradient
                                colors={saving ? [COLORS.textLight, COLORS.textSecondary] : [COLORS.primary, COLORS.primaryDark]}
                                style={styles.saveButtonGradient}
                            >
                                {saving ? (
                                    <ActivityIndicator color={COLORS.textWhite} />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={20} color={COLORS.textWhite} />
                                        <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Custom Success Overlay (Look Native) */}
            {showSuccess && (
                <View style={[StyleSheet.absoluteFill, { zIndex: 9999, justifyContent: 'center', alignItems: 'center' }]}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    <Animatable.View
                        animation="zoomIn"
                        duration={300}
                        style={{
                            backgroundColor: COLORS.surface,
                            padding: SPACING.xl,
                            borderRadius: RADIUS.lg,
                            alignItems: 'center',
                            width: '80%',
                            maxWidth: 320,
                            ...SHADOWS.lg
                        }}
                    >
                        <Ionicons name="checkmark-circle" size={80} color={COLORS.primary} style={{ marginBottom: SPACING.md }} />
                        <Text style={{ fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary }}>
                            ¡Todo Listo!
                        </Text>
                        <Text style={{ fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary, marginTop: SPACING.xs, textAlign: 'center' }}>
                            Tu perfil ha sido actualizado exitosamente.
                        </Text>
                    </Animatable.View>
                </View>
            )}

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
        gap: SPACING.md,
    },
    loadingText: {
        fontSize: TYPOGRAPHY.base,
        color: COLORS.textSecondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    headerTitle: {
        fontSize: TYPOGRAPHY.xl,
        fontWeight: TYPOGRAPHY.bold,
        color: COLORS.textWhite,
    },
    content: {
        flex: 1,
    },
    formContainer: {
        padding: SPACING.xl,
        gap: SPACING.lg,
    },
    inputGroup: {
        gap: SPACING.xs,
    },
    label: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: TYPOGRAPHY.semibold,
        color: COLORS.textPrimary,
        marginLeft: SPACING.xs,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        height: 50,
    },
    disabledInput: {
        backgroundColor: COLORS.background,
        borderColor: 'transparent',
    },
    inputIcon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        fontSize: TYPOGRAPHY.base,
        color: COLORS.textPrimary,
    },
    touristToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginTop: SPACING.sm,
    },
    touristToggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    touristToggleTitle: {
        fontSize: TYPOGRAPHY.base,
        fontWeight: TYPOGRAPHY.semibold,
        color: COLORS.textPrimary,
    },
    touristToggleDesc: {
        fontSize: TYPOGRAPHY.xs,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.textLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    tastesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginTop: SPACING.xs,
    },
    tasteChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tasteChipSelected: {
        backgroundColor: COLORS.primary + '15',
        borderColor: COLORS.primary,
    },
    tasteChipText: {
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.textSecondary,
    },
    tasteChipTextSelected: {
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.medium,
    },
    saveButton: {
        marginTop: SPACING.xl,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        ...SHADOWS.md,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
    },
    saveButtonText: {
        fontSize: TYPOGRAPHY.base,
        fontWeight: TYPOGRAPHY.bold,
        color: COLORS.textWhite,
    },
});
