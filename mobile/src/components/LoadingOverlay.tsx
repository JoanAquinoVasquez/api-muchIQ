// src/components/LoadingOverlay.tsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  Image, 
  Text,
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY } from '../theme';

const { width } = Dimensions.get('window');

// Precargar el GIF
const SALUDO_GIF = require('../../assets/videos/saludo.gif');

interface LoadingOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

export default function LoadingOverlay({ visible, onComplete }: LoadingOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [gifLoaded, setGifLoaded] = useState(false);

  useEffect(() => {
    if (visible && gifLoaded) {
      // Solo inicia la animación cuando el GIF está cargado
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2500),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onComplete();
      });
    } else if (visible && !gifLoaded) {
      // Mostrar inmediatamente el overlay mientras carga el GIF
      fadeAnim.setValue(1);
    }
  }, [visible, gifLoaded]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.overlay,
        { opacity: fadeAnim },
      ]}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark, COLORS.surfaceDark]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Animated.View
        style={[
          styles.content,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* GIF */}
        <Image
          source={SALUDO_GIF}
          style={styles.gif}
          resizeMode="contain"
          onLoad={() => setGifLoaded(true)}
          onError={(e) => {
            console.log('❌ Error cargando GIF:', e.nativeEvent.error);
            setGifLoaded(true); // Continuar aunque falle
          }}
        />
        
        {/* Indicador mientras carga */}
        {!gifLoaded && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        )}
        
        {/* Texto */}
        {gifLoaded && (
          <Text style={styles.loadingText}>Hola, bienvenido a MuchIQ</Text>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    elevation: 999,
    backgroundColor: COLORS.surfaceDark,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gif: {
    width: width * 0.95,
    height: width * 0.95,
    marginBottom: 20,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textWhite,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
  },
});