import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'TKK',
  webDir: 'www',
  server: {
    url: 'https://developer.android.com/', // Your website URL
    cleartext: true,
    androidScheme: 'https',
    iosScheme: 'https',
    // hostname: 'your-website.com'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
