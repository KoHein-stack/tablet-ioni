
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { AndroidAnimation, AndroidViewStyle, DefaultWebViewOptions, InAppBrowser, iOSAnimation, iOSViewStyle, ToolbarPosition, WebViewOptions } from '@capacitor/inappbrowser';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { AlertController, Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { DeviceService } from '../services/device';
// import { InAppBrowser, ToolbarPosition } from '@capacitor/in-app-browser';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage { 

  // constructor() {
  //   this.openBrowser();
  // }

  //   openBrowser() {
  //     Browser.open({ url: 'https://ionicframework.com/' });
  //   }
  //   async openInApp() {
  //     await Browser.open({
  //       url: 'https://ionicframework.com/',
  //       showTitle: true,
  //       toolbarColor: '#3880ff',
  //       closeButtonCaption: 'Done',
  //       presentationStyle: 'popover' // For tablets
  //     });
  //   }

  // }




  private websiteUrl = "http://192.168.200.147:8080/tkz_gx18u10_wwp15344JavaPostgreSQL/com.tkzgx18u10wwp15344.z101_wp01_login";
  // 'https://developer.android.com/';
  //  "https://122.103.187.60/tkz_gx18u10_wwp1534JavaPostgreSQL/com.tkzgx18u10wwp1534.z101_wp01_login"
  // 'https://developer.android.com/'; // Your website

  // constructor() {
  //   this.initializeApp();
  // }
  safeAreaTop: number = 0;
  deviceId: any;
  deviceInfo: any;


  constructor(private platform: Platform, private alertCtrl: AlertController, private deviceService: DeviceService) { }

  async ngOnInit() {
    await this.platform.ready();
    this.initializeApp();
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });
    await StatusBar.setStyle({ style: StatusBarStyle.Dark });
    await StatusBar.hide();
    this.openWebsite();
  }

  // async openWebsite() {
  //   if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
  //     // Open in app browser with custom options
  //     if (Capacitor.isNativePlatform()) {
  //       const screenWidth = this.platform.width();
  //       const screenHeight = this.platform.height();

  //       await Browser.open({
  //         url: this.websiteUrl,
  //         presentationStyle: 'popover',
  //         toolbarColor: '#3880ff',
  //         width: screenWidth - 100,
  //         height: screenHeight - this.safeAreaTop - 40
  //       });
  //     } else {
  //       // For web browser
  //       window.location.href = this.websiteUrl;
  //     }
  //   }
  // }
  private initializeApp() {
    this.platform.ready().then(() => {
      // Priority 10 ensures this runs when the browser is NOT open
      this.platform.backButton.subscribeWithPriority(10, () => {
        this.presentExitAlert();
      });
    });
  }
  async presentExitAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Exit App',
      message: 'Do you want to close the app?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Exit', handler: () => App.exitApp() }
      ]
    });
    await alert.present();
  }
  async openWebsite() {
  this.deviceId = await this.deviceService.getDeviceId();
    this.deviceInfo = await this.deviceService.getDeviceInfo();
    const DefaultWebViewOptions = {
      headers: {
      "X-Device-ID": this.deviceId,
      "X-Manufacturer": this.deviceInfo.manufacturer || "Unknown"
    },
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
        pauseMedia: false
      },

      iOS: {
        allowOverScroll: false,
        enableViewportScale: false,
        allowInLineMediaPlayback: true,
        surpressIncrementalRendering: false,
        viewStyle: iOSViewStyle.FULL_SCREEN,
        animationEffect: iOSAnimation.COVER_VERTICAL,
        allowsBackForwardNavigationGestures: true
      }
    };
    await InAppBrowser.openInWebView({
      url: this.websiteUrl,
      options: DefaultWebViewOptions,
    });

    // await await InAppBrowser.openInWebView({
    //   url: this.websiteUrl,
    //   options: {
    //     ...DefaultWebViewOptions,
    //     showURL: true,
    //     showToolbar: true,
    //     clearCache: false,
    //     clearSessionCache: false,
    //     mediaPlaybackRequiresUserAction: false,
    //     closeButtonText: 'Close',
    //     toolbarPosition: ToolbarPosition.TOP,
    //     showNavigationButtons: true,
    //     leftToRight: false,

    //     android: {
    //       allowZoom: true,
    //       hardwareBack: true,
    //       pauseMedia: false,
    //       viewStyle: AndroidViewStyle.FULL_SCREEN,
    //       animation: AndroidAnimation.FADE_IN
    //     },

    //     iOS: {
    //       allowOverScroll: false,
    //       enableViewportScale: false,
    //       allowInLineMediaPlayback: false,
    //       surpressIncrementalRendering: false,
    //       viewStyle: iOSViewStyle.FULL_SCREEN,
    //       animationEffect: iOSAnimation.COVER_VERTICAL,
    //       allowsBackForwardNavigationGestures: true
    //     }
    //   }
    // });
  }

  // async openWebsite() {
  //   await InAppBrowser.openInWebView({
  //     url: this.websiteUrl,
  //     options: {
  //       ...DefaultWebViewOptions,
  //       showToolbar: true,
  //       showNavigationButtons: true,
  //       closeButtonText: 'Close',
  //       toolbarPosition: ToolbarPosition.TOP,
  //     }


  //     // options: {
  //     //   showToolbar: true, // Global setting
  //     //   showURL: true,
  //     //   showNavigationButtons: true,
  //     //   closeButtonText: 'Close',
  //     //   clearCache: true,
  //     //   clearSessionCache: true,
  //     //   mediaPlaybackRequiresUserAction: true,
  //     //   toolbarPosition: ToolbarPosition.TOP,

  //     //   android: {
  //     //     // ADD THESE THREE LINES BELOW:
  //     //     toolbarPosition: ToolbarPosition.TOP,
  //     //     toolbarColor: '#ffffff', // Set a color to ensure it's not transparent

  //     //     allowZoom: true,
  //     //     hardwareBack: true,
  //     //     pauseMedia: false
  //     //   },

  //     //   iOS: {
  //     //     allowsBackForwardNavigationGestures: true,
  //     //     allowOverScroll: false,
  //     //     enableViewportScale: false,
  //     //     allowInLineMediaPlayback: false,
  //     //     surpressIncrementalRendering: false,
  //     //     viewStyle: iOSViewStyle.PAGE_SHEET,
  //     //     animationEffect: iOSAnimation.FLIP_HORIZONTAL
  //     //   },

  //     //   leftToRight: false
  //     // } as WebViewOptions
  //   });
  // }
  // private initializeApp() {
  //   // When app is opened, load the website
  //   if (Capacitor.isNativePlatform()) {
  //     this.openWebsite();
  //   } else {
  //     // For web browser
  //     window.location.href = this.websiteUrl;
  //   }
  // }

  // async openWebsite() {
  //   if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
  //     // Open in app browser with custom options
  //     await Browser.open({
  //       url: this.websiteUrl,
  //       presentationStyle: 'popover',
  //       toolbarColor: '#3880ff',

  //     });
  //   }
  // }
}