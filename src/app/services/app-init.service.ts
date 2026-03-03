import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { DeviceService } from './device';
import { DeviceLoginResponse, GenexusService } from './genexus';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  private readonly websiteUrl = environment.websiteUrl;
  private readonly deploymentBaseUrl = this.websiteUrl.substring(0, this.websiteUrl.lastIndexOf('/'));
  private deviceId = 'unknown-device';
  private manufacturer = 'Unknown';

  constructor(
    private readonly platform: Platform,
    private readonly alertCtrl: AlertController,
    private readonly deviceService: DeviceService,
    private readonly genexusService: GenexusService
  ) {
    console.log('Deployment Base URL:', this.deploymentBaseUrl);

  }

  async initialize(options?: { openWebsite?: boolean }): Promise<void> {
    const shouldOpenWebsite = options?.openWebsite ?? true;
    await this.platform.ready();
    this.registerOfflineHandler();
    const targetUrl = await this.sendDeviceMetadata();
    console.log('Target URL to open:', targetUrl);
    if (shouldOpenWebsite) {
      await this.openWebsite(targetUrl);
    }
  }

  async reloadWebsite(): Promise<void> {
    await this.openWebsite(this.websiteUrl);
  }

  private registerOfflineHandler(): void {
    if (!navigator.onLine) {
      void this.presentOfflineAlert();
    }

    window.addEventListener('offline', () => {
      void this.presentOfflineAlert();
    });
  }

  private async sendDeviceMetadata(): Promise<string> {
    try {
      try {
        this.deviceId = await this.deviceService.getDeviceId();
      } catch (e: any) {
        console.warn('Device ID read failed, using fallback value', e);
      }

      try {
        const deviceInfo = await this.deviceService.getDeviceInfo();
        console.log('AppInitService: Device Info:', deviceInfo);
        this.manufacturer = deviceInfo.manufacturer ?? 'Unknown';
      } catch (e: any) {
        console.warn('Device info read failed, using fallback manufacturer', e);
      }

      const res: DeviceLoginResponse = await firstValueFrom(
        this.genexusService.sendData(this.deviceId, this.manufacturer)
      );
      // console.log('sendData SUCCESS:', res);

      // const res = await firstValueFrom(this.genexusService.sendData(deviceId, manufacturer));
      // console.log('Success', res);


      if (res?.isAllowed && res.redirectUrl) {
        const normalizedRedirect = res.redirectUrl.replace(/^\/+/, '');
        const redirectUrl = `${this.deploymentBaseUrl}/${normalizedRedirect}`;
        const trackedUrl = this.withDeviceParams(redirectUrl);
        console.log('Resolved redirect URL:', trackedUrl);
        return trackedUrl;
      }

      // No hardcoded backend route: show local 404 page inside the app.
      return '/not-found';
    } catch (error) {
      console.error('Error getting device info or sending data', error);
    }

    return '/not-found';
  }

  private async presentOfflineAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'No Internet Connection',
      message: 'Please check your internet connection and try again.',
      buttons: ['OK'],
    });
    await alert.present();
  }


  private async openWebsite(url: string): Promise<void> {
    // If it's an in-app route, use the SPA router (no external navigation).
    if (url.startsWith('/')) {
      console.log('Opening in-app route:', url);
      window.location.hash = `#${url}`;
      return;
    }

    const trackedUrl = this.withDeviceParams(url);

    if (this.platform.is('hybrid')) {
      const w: any = window as any;
      const iab = w?.cordova?.InAppBrowser;
      if (iab?.open) {
        // Cordova InAppBrowser: stays inside the app (no Chrome UI).
        iab.open(trackedUrl, '_blank', 'location=no,toolbar=no,hideurlbar=yes,zoom=no');
        return;
      }
    }

    console.log('Opening URL in app webview:', trackedUrl);
    window.location.assign(trackedUrl);
  }

  private withDeviceParams(url: string): string {
    if (!url.startsWith(this.deploymentBaseUrl)) {
      return url;
    }

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}deviceId=${encodeURIComponent(this.deviceId)}&manufacturer=${encodeURIComponent(this.manufacturer)}`;
  }
}
