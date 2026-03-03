import { Component, OnInit } from '@angular/core';
import { AppInitService } from '../services/app-init.service';

@Component({
  selector: 'app-startup',
  standalone: true,
  template: '',
})
export class StartupPage implements OnInit {
  constructor(private readonly appInitService: AppInitService) {}

  async ngOnInit(): Promise<void> {
    await this.appInitService.initialize({ openWebsite: true });
  }
}

