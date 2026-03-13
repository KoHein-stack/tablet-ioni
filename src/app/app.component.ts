import { Component, OnInit } from '@angular/core';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { DeviceService } from './services/device';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  private deviceId: string | null = null;
  private manufacturer: string | null = null;
  private routeListenerReady = false;

  constructor(
    private readonly deviceService: DeviceService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit(): Promise<void> {
    // Status bar setup (safe to ignore failures on web).
    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
      await StatusBar.setStyle({ style: StatusBarStyle.Dark });
      await StatusBar.hide();
    } catch {
      // no-op
    }

    // Load device info once; then keep query params attached on every route change.
    try {
      this.deviceId = await this.deviceService.getDeviceId();
      const deviceInfo = await this.deviceService.getDeviceInfo();
      this.manufacturer = (deviceInfo?.manufacturer as string | undefined) ?? 'Unknown';
    } catch {
      this.deviceId = 'unknown-device';
      this.manufacturer = 'Unknown';
    }

    this.ensureDeviceQueryParams();
    this.startRouteListener();
  }

  private startRouteListener(): void {
    if (this.routeListenerReady) return;
    this.routeListenerReady = true;

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.ensureDeviceQueryParams());
  }

  private ensureDeviceQueryParams(): void {
    if (!this.deviceId || !this.manufacturer) return;

    const tree = this.router.parseUrl(this.router.url);
    const current = tree.queryParams ?? {};
    const nextDeviceId = this.deviceId;
    const nextManufacturer = this.manufacturer;

    const alreadySet =
      current['P_deviceId'] === nextDeviceId && current['P_manufacturer'] === nextManufacturer;
    if (alreadySet) return;

    void this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        P_deviceId: nextDeviceId,
        P_manufacturer: nextManufacturer,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
