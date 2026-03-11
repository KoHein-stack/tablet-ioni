import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';
import { AppInitService } from '../services/app-init.service';
import { DeviceService } from '../services/device';
import { GenexusService } from '../services/genexus';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let appInitServiceSpy: jasmine.SpyObj<AppInitService>;
  let deviceServiceSpy: jasmine.SpyObj<DeviceService>;
  let genexusServiceSpy: jasmine.SpyObj<GenexusService>;

  beforeEach(async () => {
    appInitServiceSpy = jasmine.createSpyObj<AppInitService>('AppInitService', ['initialize', 'reloadWebsite']);
    appInitServiceSpy.initialize.and.resolveTo();
    appInitServiceSpy.reloadWebsite.and.resolveTo();

    deviceServiceSpy = jasmine.createSpyObj<DeviceService>('DeviceService', ['getDeviceInfo', 'getDeviceId']);
    deviceServiceSpy.getDeviceInfo.and.resolveTo({ manufacturer: 'ACME' } as any);
    deviceServiceSpy.getDeviceId.and.resolveTo('device-123');

    genexusServiceSpy = jasmine.createSpyObj<GenexusService>('GenexusService', ['sendData']);

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AppInitService, useValue: appInitServiceSpy },
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: GenexusService, useValue: genexusServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load device info and device id on init', async () => {
    await fixture.whenStable();

    expect(deviceServiceSpy.getDeviceInfo).toHaveBeenCalled();
    expect(deviceServiceSpy.getDeviceId).toHaveBeenCalled();
    expect(component.deviceInfo).toEqual({ manufacturer: 'ACME' } as any);
    expect(component.deviceId).toBe('device-123');
  });

  it('should reload website', async () => {
    await component.reload();
    expect(appInitServiceSpy.reloadWebsite).toHaveBeenCalled();
  });
});
