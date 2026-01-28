
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';

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




  private websiteUrl = 'https://ionicframework.com/'; // Your website

  constructor() {
    this.initializeApp();
  }

  private initializeApp() {
    // When app is opened, load the website
    if (Capacitor.isNativePlatform()) {
      this.openWebsite();
    } else {
      // For web browser
      window.location.href = this.websiteUrl;
    }
  }

  async openWebsite() {
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      // Open in app browser with custom options
      await Browser.open({
        url: this.websiteUrl,
        presentationStyle: 'fullscreen',
        toolbarColor: '#3880ff'
      });
    }
  }
}