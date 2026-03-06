import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let platformSpy: jasmine.SpyObj<Platform>;

  beforeEach(async () => {
    platformSpy = jasmine.createSpyObj<Platform>('Platform', ['ready']);
    (platformSpy as any).backButton = {
      subscribeWithPriority: jasmine.createSpy('subscribeWithPriority'),
    };
    platformSpy.ready.and.resolveTo();

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [{ provide: Platform, useValue: platformSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
