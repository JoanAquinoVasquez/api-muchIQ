export default {
  expo: {
    name: "MuchIQ",
    slug: "muchiq",
    version: "1.0.0",
    runtimeVersion: {
      policy: "appVersion"
    },
    updates: {
      url: "https://u.expo.dev/54cece9e-99fd-4eea-96ad-1e50af354d23"
    },
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#1A9B8E"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.muchiq",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Permite encontrar lugares turísticos cercanos a ti.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Permite encontrar lugares turísticos cercanos a ti.",
        NSMicrophoneUsageDescription: "Permite usar el asistente de voz para recomendaciones personalizadas."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1A9B8E"
      },
      package: "com.muchiq",
      versionCode: 1,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ],
      // Configuración importante para desarrollo
      useNextNotificationsApi: true,
      softwareKeyboardLayoutMode: "pan"
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
      name: "MuchIQ",
      shortName: "MuchIQ",
      themeColor: "#1A9B8E",
      backgroundColor: "#1A9B8E",
      display: "standalone",
      orientation: "portrait",
      dir: "auto",
      lang: "es-PE"
    },
    plugins: [
      [
        "expo-av",
        {
          microphonePermission: "Permite usar el asistente de voz para recomendaciones personalizadas."
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Permite encontrar lugares turísticos cercanos a ti.",
          locationWhenInUsePermission: "Permite encontrar lugares turísticos cercanos a ti."
        }
      ]
    ],
    // Configuración extra importante
    extra: {
      eas: {
        projectId: "54cece9e-99fd-4eea-96ad-1e50af354d23"
      }
    }
  }
};