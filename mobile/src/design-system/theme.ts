// Paleta de colores profesional para turismo cultural
export const COLORS = {
  // Primarios - Inspirados en el dragón andino (teal/turquesa)
  primary: '#1A9B8E',      // Teal principal - Color del dragón
  primaryDark: '#156B63',  // Teal oscuro - Profundidad
  primaryLight: '#4ECDC4', // Teal claro - Highlights
  
  // Acentos - Cultura y elegancia (dorados)
  accent: '#D4AF37',       // Dorado - Detalles del dragón, premium
  accentLight: '#F4E4B7',  // Dorado claro - Fondos sutiles
  accentDark: '#B8941F',   // Dorado oscuro - Contraste
  
  // Neutros - Sofisticados y confortables
  background: '#F8F9FA',   // Gris muy claro - Fondo principal
  surface: '#FFFFFF',      // Blanco puro - Cards y containers
  surfaceDark: '#1F2937',  // Gris oscuro - Headers oscuros
  
  // Semánticos - Feedback del sistema
  success: '#10B981',      // Verde - Éxito, gamificación
  warning: '#F59E0B',      // Naranja - Alertas
  error: '#EF4444',        // Rojo - Errores
  info: '#3B82F6',         // Azul - Información
  
  // Texto - Jerarquía clara
  textPrimary: '#1F2937',  // Casi negro - Texto principal
  textSecondary: '#6B7280',// Gris medio - Texto secundario
  textLight: '#9CA3AF',    // Gris claro - Texto deshabilitado
  textWhite: '#FFFFFF',    // Blanco - Texto sobre oscuro
  
  // Overlays - Capas visuales
  overlay: 'rgba(31, 41, 55, 0.75)',        // Oscuro con transparencia
  overlayLight: 'rgba(248, 249, 250, 0.95)',// Claro con transparencia
  
  // Gradientes - Para elementos especiales
  gradientStart: '#1A9B8E',
  gradientEnd: '#156B63',
};

// Sistema tipográfico escalable
export const TYPOGRAPHY = {
  // Font Sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  
  // Font Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  
  // Line Heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

// Sistema de espaciado consistente (múltiplos de 4)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

// Border radius para elementos
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
};

// Sombras para elevación
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Configuración de animaciones
export const ANIMATIONS = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    inOut: [0.42, 0, 0.58, 1] as const,
    spring: [0.68, -0.55, 0.265, 1.55] as const,
  },
};
