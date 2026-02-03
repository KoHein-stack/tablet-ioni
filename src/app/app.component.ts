import { Component } from '@angular/core';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {}
  async ngOnInit() {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });
    await StatusBar.setStyle({ style: StatusBarStyle.Dark });
    await StatusBar.hide();
  }
}
