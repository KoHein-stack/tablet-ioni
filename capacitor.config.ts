import type { CapacitorConfig } from '@capacitor/cli';
import { provideHttpClient } from '@angular/common/http';

const config: CapacitorConfig = {
  appId: 'com.tkks.gic.tablet',
  appName: 'TKKS',
  webDir: 'www',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  server: {
    url: 'http://192.168.200.117:8070/tkz_gx18u10_wwp1534_newJavaPostgreSQL/com.tkzgx18u10wwp1534new.z101_wp01_login',
    cleartext: true,
    androidScheme: 'http',
    iosScheme: 'http',
    allowNavigation: [
      'http://localhost:*',
      'http://192.168.200.117:8070'
    ]
  },
  // plugins: {
  //   CapacitorHttp: {
  //     enabled: true
  //   }
  // }
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
    // Additional Android config for Genexus
    overrideUserAgent: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
  },
  ios: {
    scheme: 'GenexusApp',
    scrollEnabled: true,
    // Additional iOS config for Genexus
    overrideUserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  }
};

export default config;
