import { Component, OnInit } from '@angular/core';
import { AppInitService } from '../services/app-init.service';
import { DeviceService } from '../services/device';
import { RefresherCustomEvent } from '@ionic/angular';
import { NetworkService } from '../services/network.service';

@Component({
  selector: 'app-startup',
  standalone: false,
  templateUrl: './startup.page.html',
  styleUrls: ['./startup.page.scss'],
})
export class StartupPage implements OnInit {

  deviceInfo: any;
  deviceId: any
  lastCheckedAt = new Date();

  constructor(private readonly appInitService: AppInitService,
    private readonly deviceService: DeviceService,
    private readonly networkService: NetworkService
  ) { }

  async ngOnInit(): Promise<void> {
    this.deviceInfo = await this.deviceService.getDeviceInfo();
    this.deviceId = await this.deviceService.getDeviceId();
    await this.appInitService.initialize({ openWebsite: true });
    this.lastCheckedAt = new Date();
  }

  async reopenWebsite(): Promise<void> {
    await this.appInitService.reloadWebsite();
  }

  get isOnline(): boolean {
    return this.networkService.isOnline;
  }

  async reload(): Promise<void> {

    await this.appInitService.reloadWebsite();
    this.lastCheckedAt = new Date();
  }

  async handleRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      await this.reload();
    } finally {
      event.target.complete();
    }
  }

}

