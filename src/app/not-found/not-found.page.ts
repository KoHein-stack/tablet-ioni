import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.page.html',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class NotFoundPage {}
