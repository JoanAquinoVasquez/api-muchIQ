export const translations = {
  es: {
    // Welcome Screen
    welcome: {
      title: 'Descubre Lambayeque',
      subtitle: 'Tu guía personal al alma de la región',
      cta: 'Comenzar Aventura',
      tagline: 'Más que turismo, una experiencia única',
    },
    
    // Login/Register
    auth: {
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      username: 'Nombre de Usuario',
      isTourist: '¿Eres turista?',
      reasonForVisit: '¿Qué te trae a Lambayeque?',
      tastes: 'Tus intereses',
      benefits: {
        title: '¿Por qué unirte?',
        rewards: 'Gana puntos y canjea descuentos reales',
        ai: 'Recomendaciones personalizadas con IA',
        gamification: 'Explora y desbloquea logros',
        local: 'Descubre lugares secretos de locales',
      },
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes cuenta?',
      hasAccount: '¿Ya tienes cuenta?',
    },
    
    // Feed
    feed: {
      popularPlaces: 'Lugares Populares',
      popularDishes: 'Platillos Típicos',
      nearYou: 'Cerca de Ti',
      explore: 'Explorar',
      points: 'puntos',
      km: 'km',
    },
    
    // Common
    common: {
      loading: 'Cargando...',
      error: 'Ocurrió un error',
      retry: 'Reintentar',
      close: 'Cerrar',
      save: 'Guardar',
      cancel: 'Cancelar',
      continue: 'Continuar',
    },
  },
  
  en: {
    // Welcome Screen
    welcome: {
      title: 'Discover Lambayeque',
      subtitle: 'Your personal guide to the soul of the region',
      cta: 'Start Adventure',
      tagline: 'More than tourism, a unique experience',
    },
    
    // Login/Register
    auth: {
      login: 'Sign In',
      register: 'Sign Up',
      email: 'Email',
      password: 'Password',
      username: 'Username',
      isTourist: 'Are you a tourist?',
      reasonForVisit: 'What brings you to Lambayeque?',
      tastes: 'Your interests',
      benefits: {
        title: 'Why join?',
        rewards: 'Earn points and redeem real discounts',
        ai: 'Personalized AI recommendations',
        gamification: 'Explore and unlock achievements',
        local: 'Discover secret local spots',
      },
      forgotPassword: 'Forgot your password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
    },
    
    // Feed
    feed: {
      popularPlaces: 'Popular Places',
      popularDishes: 'Typical Dishes',
      nearYou: 'Near You',
      explore: 'Explore',
      points: 'points',
      km: 'km',
    },
    
    // Common
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      close: 'Close',
      save: 'Save',
      cancel: 'Cancel',
      continue: 'Continue',
    },
  },
};

export type Language = 'es' | 'en';
export type TranslationKeys = typeof translations.es;