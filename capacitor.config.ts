import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.02d1af2662894b7a95e37a6b8697b038',
  appName: 'church-plus-manager',
  webDir: 'dist',
  server: {
    url: "https://02d1af26-6289-4b7a-95e3-7a6b8697b038.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e3a8a",
      showSpinner: true,
      spinnerColor: "#fbbf24"
    }
  }
};

export default config;