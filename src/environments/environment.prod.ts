export const environment = {
  production: true,
  // On-device builds do not use Angular dev proxy, so this must be absolute.
  apiUrl: 'http://172.16.205.15:8080/DeploymentUnit2_20260224215411/com.testing.adevice_login',
  // Used only as deployment base for resolving redirectUrl.
  websiteUrl: 'http://172.16.205.15:8080/DeploymentUnit2_20260224215411/',
};
