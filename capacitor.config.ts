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
    // url: 'https://developer.android.com/', // Your website URL
    url: 'http://192.168.105.186:8080/tkz_gx18u10_wwp1534JavaPostgreSQL/com.tkzgx18u10wwp1534.z101_wp01_login',
    //  'http://172.16.205.23:8080/tkz_gx18u10_wwp1534JavaPostgreSQL/com.tkzgx18u10wwp1534.z101_wp01_login',
    // 'http://192.168.200.134:8080/tkz_gx18u10_wwp1534JavaPostgreSQL/com.tkzgx18u10wwp1534.z101_wp01_login',
    //  "http://192.168.200.147:8080/tkz_gx18u10_wwp15344JavaPostgreSQL/com.tkzgx18u10wwp15344.z101_wp01_login",
    // url: "https://122.103.187.60/tkz_gx18u10_wwp1534JavaPostgreSQL/com.tkzgx18u10wwp1534.z101_wp01_login",
    cleartext: true,
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: [
      'http://localhost:*',
      'http://192.168.*.*:*'
    ]
    // hostname: 'your-website.com'
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
