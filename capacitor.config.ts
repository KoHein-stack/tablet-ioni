import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tkks.gic.tablet',
  appName: 'TKKS',
  webDir: 'www',
  server: {
    // url: 'https://developer.android.com/', // Your website URL
    url: "http://192.168.200.147:8080/tkz_gx18u10_wwp15344JavaPostgreSQL/com.tkzgx18u10wwp15344.z101_wp01_login",
    // url: "https://122.103.187.60/tkz_gx18u10_wwp1534JavaPostgreSQL/com.tkzgx18u10wwp1534.z101_wp01_login",
    cleartext: true,
    androidScheme: 'https',
    iosScheme: 'https',
    // hostname: 'your-website.com'
  },
  // plugins: {
  //   CapacitorHttp: {
  //     enabled: true
  //   }
  // }
};

export default config;
