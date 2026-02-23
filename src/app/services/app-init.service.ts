import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { InAppBrowser, ToolbarPosition, iOSAnimation, iOSViewStyle } from '@capacitor/inappbrowser';
import { DeviceService } from './device';
import { GenexusService } from './genexus';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  private readonly websiteUrl = environment.websiteUrl;

  constructor(
    private readonly platform: Platform,
    private readonly alertCtrl: AlertController,
    private readonly deviceService: DeviceService,
    private readonly genexusService: GenexusService
  ) {}

  async initialize(): Promise<void> {
    await this.platform.ready();
    this.registerOfflineHandler();
    await this.sendDeviceMetadata();
    await this.openWebsite();
  }

  async reloadWebsite(): Promise<void> {
    try {
      await InAppBrowser.close();
    } catch {
      // Ignore if there is no active browser to close.
    }

    await this.openWebsite();
  }

  private registerOfflineHandler(): void {
    if (!navigator.onLine) {
      void this.presentOfflineAlert();
    }

    window.addEventListener('offline', () => {
      void this.presentOfflineAlert();
    });
  }

  private async sendDeviceMetadata(): Promise<void> {
    try {
      const deviceId = await this.deviceService.getDeviceId();
      const deviceInfo = await this.deviceService.getDeviceInfo();
      const manufacturer = deviceInfo.manufacturer ?? 'Unknown';

      this.genexusService.sendData(deviceId, manufacturer).subscribe({
        next: (res) => {
          console.log('sendData SUCCESS:', res);
        },
        error: (err) => {
          console.error('sendData ERROR:', err);
        },
      });
    } catch (error) {
      console.error('Error getting device info or sending data', error);
    }
  }

  private async presentOfflineAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'No Internet Connection',
      message: 'Please check your internet connection and try again.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  private async openWebsite(): Promise<void> {
    const webViewOptions = {
      showURL: true,
      showToolbar: true,
      clearCache: false,
      clearSessionCache: false,
      mediaPlaybackRequiresUserAction: false,
      closeButtonText: 'Close',
      toolbarPosition: ToolbarPosition.TOP,
      showNavigationButtons: true,
      leftToRight: false,
      android: {
        allowZoom: true,
        hardwareBack: true,
        pauseMedia: false,
      },
      iOS: {
        allowOverScroll: false,
        enableViewportScale: false,
        allowInLineMediaPlayback: true,
        surpressIncrementalRendering: false,
        viewStyle: iOSViewStyle.FULL_SCREEN,
        animationEffect: iOSAnimation.COVER_VERTICAL,
        allowsBackForwardNavigationGestures: true,
      },
    };

    await InAppBrowser.openInWebView({
      url: this.websiteUrl,
      options: webViewOptions,
    });
  }
}
