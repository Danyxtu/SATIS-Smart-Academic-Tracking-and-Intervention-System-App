export default {
  expo: {
    name: "satis-app",
    slug: "satis-app",
    scheme: "your-app-scheme",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    plugins: ["expo-secure-store"],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      // Allow overriding via APP_URL env var (useful for CI/dev overrides).
      // If not provided, default to the laptop LAN IP used for device testing.
      API_URL: process.env.APP_URL || "http://10.238.145.104:8000",
    },
  },
};
