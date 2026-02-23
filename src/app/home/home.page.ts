import { Component } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';
import { AppInitService } from '../services/app-init.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  constructor(private readonly appInitService: AppInitService) {}

  async ngOnInit(): Promise<void> {
    await this.appInitService.initialize();
  }

  async reload(): Promise<void> {
    await this.appInitService.reloadWebsite();
  }

  async handleRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      await this.reload();
    } finally {
      event.target.complete();
    }
  }
}
