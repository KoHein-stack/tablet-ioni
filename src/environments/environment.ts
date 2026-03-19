export const environment = {
  production: false,
  insecureSsl: true, // Set to true to allow self-signed certs on native (Android) builds during development. Not used in web builds.
  // Web dev API: use Angular proxy (/gx -> proxy.conf.json target)
  apiUrl: '/gx/DeploymentUnit1_20260312164752/com.tkzgx18u10wwp1534.adevice_login',
  // Used only as deployment base for resolving redirectUrl.
  websiteUrl: 'http://172.16.205.172:8080/DeploymentUnit1_20260312164752/',
};
