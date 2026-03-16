import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import {
  InAppBrowser,
  ToolBarType,
} from '@capgo/inappbrowser';
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
  private listenersReady = false;
  private loadTimeoutId: number | null = null;
  private openingWebView = false;


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
    // For client demos, configure the URL via `src/environments/environment*.ts`
    // (or use the hidden Admin Settings screen if you added runtime switching).
    const targetUrl = await this.sendDeviceMetadata();
    // environment.loginUrl ?? this.websiteUrl; // or: (await this.sendDeviceMetadata()) || (environment.loginUrl ?? this.websiteUrl)
    // await this.sendDeviceMetadata();
    console.log('Target URL to open:', targetUrl);
    if (shouldOpenWebsite) {
      await this.openWebsite(targetUrl);
    }
  }

  async reloadWebsite(): Promise<void> {
    if (this.platform.is('hybrid')) {
      try {
        await InAppBrowser.close();
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
      let deviceId = 'Error: could not get ID';
      try {
        deviceId = await this.deviceService.getDeviceId();
      } catch (e: any) {
        deviceId = `ID Error: ${e.message || JSON.stringify(e)}`;
      }

      let manufacturer = 'Unknown';
      try {
        const deviceInfo = await this.deviceService.getDeviceInfo();
        console.log('AppInitService: Device Info:', deviceInfo);
        manufacturer = deviceInfo.manufacturer ?? 'Unknown';
      } catch (e: any) {
        manufacturer = `Info Error: ${e.message || JSON.stringify(e)}`;
      }

      // DIAGNOSTIC ALERT: Keep this to show EXACTLY what is happening
      const diagAlert = await this.alertCtrl.create({
        header: 'Diagnostic Info',
        message: `ID: ${deviceId}\nManufacturer: ${manufacturer}`,
        buttons: ['OK']
      });
      await diagAlert.present();

      const res: DeviceLoginResponse = await firstValueFrom(
        this.genexusService.sendData(deviceId, manufacturer)
      );
      console.log('sendData SUCCESS:', res);

      if (res?.isAllowed) {
        console.log('Redirecting to:', res.redirectUrl);
        if (res.redirectUrl) {
          const normalizedRedirect = res.redirectUrl.replace(/^\/+/, '');
          let redirectUrl = `${this.deploymentBaseUrl}/${normalizedRedirect}`;
          console.log('Constructed redirect URL:', redirectUrl);

          // Append device info to redirect URL as query params for the backend
          const connector = redirectUrl.includes('?') ? '&' : '?';
          redirectUrl += `${connector}P_deviceId=${encodeURIComponent(deviceId)}&P_manufacturer=${encodeURIComponent(manufacturer)}`;

          console.log('Resolved redirect URL with params:', redirectUrl);
          return redirectUrl;
        }
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
    // Original code kept for reference:
    // console.log('Opening URL in external browser:', url);
    // if (this.platform.is('hybrid')) {
    //   try {
    //     await InAppBrowser.openInExternalBrowser({ url });
    //     return;
    //   } catch (error) {
    //     console.warn('InAppBrowser external open failed, falling back to window.open', error);
    //   }
    // }
    // window.open(url, '_blank', 'noopener,noreferrer');

    const isHybrid = this.platform.is('hybrid');
    console.log('Opening URL in in-app webview:', {
      url,
      isHybrid,
      platforms: this.platform.platforms(),
    });

    if (isHybrid) {
      try {
        if (this.openingWebView) {
          console.warn('WebView open already in progress; skipping duplicate open.', url);
          return;
        }
        this.openingWebView = true;

        if (await this.handleHttpsIpCertificateMismatch(url)) {
          return;
        }

        if (!this.listenersReady) {
          this.listenersReady = true;
          await InAppBrowser.addListener('browserPageLoaded', () => this.clearLoadTimeout());
          await InAppBrowser.addListener('urlChangeEvent', (data: any) => {
            console.log('WebView URL changed:', data?.url);
          });
          await InAppBrowser.addListener('pageLoadError', () => {
            this.clearLoadTimeout();
            void this.presentLoadErrorAlert(url);
          });
          await InAppBrowser.addListener('closeEvent', () => this.clearLoadTimeout());
        }

        this.startLoadTimeout(url);

        const cookieHeader = this.genexusService.getLastNativeCookieHeader();
        if (cookieHeader) {
          console.log('Passing native cookie header into WebView:', cookieHeader);
        }

        try {
          await InAppBrowser.close();
        } catch {}

        await InAppBrowser.openWebView({
          url,
          headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
          ignoreUntrustedSSLError: environment.insecureSsl === true,
          toolbarType: ToolBarType.COMPACT,
          visibleTitle: false,
          showReloadButton: true,
          isInspectable: environment.production !== true,
          activeNativeNavigationForWebview: true,

        });
        console.log('InAppBrowser.openWebView success');
        return;
      } catch (error) {
        this.clearLoadTimeout();
        console.warn('InAppBrowser open failed, falling back to window.open', error);
        void this.presentLoadErrorAlert(url);
      } finally {
        this.openingWebView = false;
      }
    }

    // In browser/dev-server runs, window.open can be blocked as popup.
    // Use same-tab navigation so URL always opens during web testing.
    window.location.assign(url);
  }

  private async handleHttpsIpCertificateMismatch(url: string): Promise<boolean> {
    try {
      if (environment.insecureSsl === true) {
        return false;
      }

      const parsed = new URL(url);
      const isHttps = parsed.protocol === 'https:';
      const isIPv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname);
      if (!isHttps || !isIPv4) return false;

      // HTTPS on a raw IP commonly fails on Android WebView due to CERT_COMMON_NAME_INVALID (CN/SAN mismatch).
      // Capacitor InAppBrowser WebView can't "continue anyway", so it looks like infinite loading.
      const alert = await this.alertCtrl.create({
        header: 'Certificate issue',
        message:
          'This URL uses HTTPS with an IP address. Android WebView will usually block it because the SSL certificate does not match the IP.\n\nUse a domain name with a valid certificate, or use HTTP for testing.',
        buttons: [
          {
            text: 'Open System Browser',
            handler: () => {
              void InAppBrowser.open({ url });
            },
          },
          { text: 'Cancel', role: 'cancel' },
        ],
      });
      await alert.present();
      return true;
    } catch {
      return false;
    }
  }

  private startLoadTimeout(url: string): void {
    this.clearLoadTimeout();
    this.loadTimeoutId = window.setTimeout(() => {
      void this.presentLoadStuckAlert(url);
    }, 10000);
  }

  private clearLoadTimeout(): void {
    if (this.loadTimeoutId !== null) {
      window.clearTimeout(this.loadTimeoutId);
      this.loadTimeoutId = null;
    }
  }

  private async presentLoadStuckAlert(url: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Still loading',
      message:
        'The page did not finish loading.\n\nCommon causes:\n- Invalid HTTPS certificate (e.g. https://IP address)\n- Server blocked / timeout\n- No internet connection',
      buttons: [
        {
          text: 'Open System Browser',
          handler: () => {
            void InAppBrowser.open({ url });
            return false;
          },
        },
        {
          text: 'Retry',
          handler: () => {
            this.clearLoadTimeout();
            void this.openWebsite(url);
          },
        },
      ],
    });
    await alert.present();
  }

  private async presentLoadErrorAlert(url: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Webpage not available',
      message: 'The page failed to load. This is often caused by an invalid HTTPS certificate (e.g. https://IP address).',
      buttons: [
        {
          text: 'Open System Browser',
          handler: () => {
            void InAppBrowser.open({ url });
          },
        },
        { text: 'Close', role: 'cancel' },
      ],
    });
    await alert.present();
  }

  private normalizeBaseUrl(url: string): string {
    if (!/^https?:\/\//i.test(url)) {
      url = 'http://' + url;
    }
    return url;
  }

}
