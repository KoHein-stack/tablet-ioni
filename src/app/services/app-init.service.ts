import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { App as CapacitorApp } from '@capacitor/app';
import { Router } from '@angular/router';
import { DeviceService } from './device';
import { DeviceLoginResponse, GenexusService } from './genexus';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  private readonly apiUrl = environment.apiUrl;
  private readonly websiteUrl = this.normalizeBaseUrl(environment.websiteUrl);
  private readonly deploymentBaseUrl = this.websiteUrl.substring(0, this.websiteUrl.lastIndexOf('/'));
  private deviceId = 'unknown-device';
  private manufacturer = 'Unknown';
  private iabRef: any;

  constructor(
    private readonly platform: Platform,
    private readonly alertCtrl: AlertController,
    private readonly router: Router,
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
    if (this.iabRef?.close) {
      try {
        this.iabRef.close();
      } catch (e) {
        console.warn('Failed to close existing in-app browser', e);
      }
    }
    // await this.openWebsite(this.websiteUrl);
    await this.initialize({ openWebsite: true });
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
      const alert = await this.alertCtrl.create({
        header: 'Server Response',
        message: `res?.isAllowed: ${res?.isAllowed}, res?.redirectUrl: ${res?.redirectUrl}  `,
        buttons: ['OK'],
      });
      await alert.present();
      // console.log('sendData SUCCESS:', res);

      // const res = await firstValueFrom(this.genexusService.sendData(deviceId, manufacturer));
      // console.log('Success', res);


      if (res?.isAllowed && res.redirectUrl) {
        const redirectUrl = this.resolveServerRedirect(res.redirectUrl);
        const trackedUrl = this.withDeviceParams(redirectUrl);
        console.log('Resolved redirect URL:', trackedUrl);
        return trackedUrl;
      }

      // await alert.present();
      // No hardcoded backend route: show local 404 page inside the app.
      return '/not-found';
      // return this.apiUrl; // For testing, open API URL directly to see response.
    } catch (error) {
      console.error('Error getting device info or sending data', error);
    }

    return '/not-found';
    // return this.apiUrl;
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
    console.log('Attempting to open URL:', url);
    // If it's an in-app route, use the SPA router (no external navigation).
    if (url.startsWith('/')) {
      console.log('Opening in-app route:', url);
      await this.router.navigateByUrl(url, { replaceUrl: true });
      return;
    }

    const trackedUrl = this.withDeviceParams(url);

    if (this.platform.is('hybrid')) {
      const w: any = window as any;
      const iab = w?.cordova?.InAppBrowser;
      if (iab?.open) {
        this.iabRef = iab.open(
          trackedUrl,
          '_blank',
          'location=no,toolbar=no,hideurlbar=yes,zoom=no,hardwareback=yes'
        );

        // If user swipes/back-closes the website view, exit app to avoid white startup page.
        if (this.iabRef?.addEventListener) {
          this.iabRef.addEventListener('exit', () => {
            void CapacitorApp.exitApp();
          });
        }
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

  private normalizeBaseUrl(url: string): string {
    const trimmed = (url ?? '').trim();
    if (!trimmed) {
      return '';
    }

    const absolute = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^\/+/, '')}`;
    const parsed = new URL(absolute);
    if (!parsed.pathname.endsWith('/')) {
      parsed.pathname = `${parsed.pathname}/`;
    }
    return parsed.toString();
  }

  private resolveServerRedirect(redirectUrl: string): string {
    const raw = (redirectUrl ?? '').trim();
    if (!raw) {
      return '/not-found';
    }

    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }

    if (/^\/\//.test(raw)) {
      return `https:${raw}`;
    }

    if (/^[a-z0-9.-]+:\d{1,5}\//i.test(raw)) {
      return `https://${raw.replace(/^\/+/, '')}`;
    }

    const base = new URL(this.websiteUrl);
    const basePath = base.pathname.replace(/\/+$/, '');
    const basePathNoLead = basePath.replace(/^\/+/, '');
    const normalized = raw.replace(/^\/+/, '');
    if (basePathNoLead && normalized.toLowerCase().startsWith(`${basePathNoLead.toLowerCase()}/`)) {
      return `${base.origin}/${normalized}`;
    }

    return new URL(normalized, `${base.origin}${basePath}/`).toString();
  }
}
