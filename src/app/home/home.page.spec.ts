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
    appInitServiceSpy = jasmine.createSpyObj<AppInitService>('AppInitService', ['reloadWebsite']);
    appInitServiceSpy.reloadWebsite.and.resolveTo();
    deviceServiceSpy = jasmine.createSpyObj<DeviceService>('DeviceService', ['getDeviceInfo', 'getDeviceId']);
    deviceServiceSpy.getDeviceInfo.and.resolveTo({ manufacturer: 'Test Inc.', model: 'Pixel' });
    deviceServiceSpy.getDeviceId.and.resolveTo('test-device-id');
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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load device information on init', () => {
    expect(deviceServiceSpy.getDeviceInfo).toHaveBeenCalled();
    expect(deviceServiceSpy.getDeviceId).toHaveBeenCalled();
    expect(component.deviceInfo?.manufacturer).toBe('Test Inc.');
    expect(component.deviceId).toBe('test-device-id');
  });

  it('should reload website', async () => {
    await component.reload();
    expect(appInitServiceSpy.reloadWebsite).toHaveBeenCalled();
  });

  it('should complete refresher after reload', async () => {
    const completeSpy = jasmine.createSpy('complete');
    const event = { target: { complete: completeSpy } } as any;

    await component.handleRefresh(event);

    expect(appInitServiceSpy.reloadWebsite).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
