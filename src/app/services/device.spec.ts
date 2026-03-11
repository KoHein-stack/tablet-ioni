import { TestBed } from '@angular/core/testing';
import { CAPACITOR_DEVICE, DeviceService } from './device';

describe('DeviceService', () => {
  let service: DeviceService;
  let devicePlugin: { getId: jasmine.Spy; getInfo: jasmine.Spy };

  beforeEach(() => {
    devicePlugin = jasmine.createSpyObj('CapacitorDevicePlugin', ['getId', 'getInfo']);
    devicePlugin.getId.and.resolveTo({ identifier: 'test-device-id' } as any);
    devicePlugin.getInfo.and.resolveTo({ manufacturer: 'ACME', platform: 'android' } as any);

    TestBed.configureTestingModule({
      providers: [{ provide: CAPACITOR_DEVICE, useValue: devicePlugin }],
    });
    service = TestBed.inject(DeviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getDeviceId returns the identifier from @capacitor/device', async () => {
    await expectAsync(service.getDeviceId()).toBeResolvedTo('test-device-id');
    expect(devicePlugin.getId).toHaveBeenCalled();
  });

  it('getDeviceInfo returns the info from @capacitor/device', async () => {
    const info = { manufacturer: 'ACME', platform: 'android' };
    await expectAsync(service.getDeviceInfo()).toBeResolvedTo(info as any);
    expect(devicePlugin.getInfo).toHaveBeenCalled();
  });
});
