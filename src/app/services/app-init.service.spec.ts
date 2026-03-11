import { TestBed } from '@angular/core/testing';
import { AlertController, Platform } from '@ionic/angular';
import { of } from 'rxjs';

import { AppInitService } from './app-init.service';
import { CAPACITOR_INAPPBROWSER, URL_OPENER } from './app-init.service';
import { DeviceService } from './device';
import { GenexusService } from './genexus';

describe('AppInitService', () => {
  let service: AppInitService;
  let platformSpy: jasmine.SpyObj<Platform>;
  let alertCtrlSpy: jasmine.SpyObj<AlertController>;
  let deviceServiceSpy: jasmine.SpyObj<DeviceService>;
  let genexusSpy: jasmine.SpyObj<GenexusService>;
  let urlOpenerSpy: jasmine.SpyObj<{ assign: (url: string) => void }>;
  let inAppBrowserSpy: jasmine.SpyObj<{ openInExternalBrowser: (opts: { url: string }) => Promise<void> }>;

  beforeEach(() => {
    platformSpy = jasmine.createSpyObj<Platform>('Platform', ['ready', 'is', 'platforms']);
    platformSpy.ready.and.resolveTo();
    platformSpy.is.and.returnValue(false);
    platformSpy.platforms.and.returnValue(['mobileweb']);

    alertCtrlSpy = jasmine.createSpyObj<AlertController>('AlertController', ['create']);
    alertCtrlSpy.create.and.callFake(async () => ({ present: jasmine.createSpy('present') } as any));

    deviceServiceSpy = jasmine.createSpyObj<DeviceService>('DeviceService', ['getDeviceId', 'getDeviceInfo']);
    deviceServiceSpy.getDeviceId.and.resolveTo('device-123');
    deviceServiceSpy.getDeviceInfo.and.resolveTo({ manufacturer: 'ACME' } as any);

    genexusSpy = jasmine.createSpyObj<GenexusService>('GenexusService', ['sendData']);
    genexusSpy.sendData.and.returnValue(of({ isAllowed: false }));

    urlOpenerSpy = jasmine.createSpyObj('UrlOpener', ['assign']);
    inAppBrowserSpy = jasmine.createSpyObj('CapacitorInAppBrowserPlugin', ['openInExternalBrowser']);
    inAppBrowserSpy.openInExternalBrowser.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        AppInitService,
        { provide: Platform, useValue: platformSpy },
        { provide: AlertController, useValue: alertCtrlSpy },
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: GenexusService, useValue: genexusSpy },
        { provide: CAPACITOR_INAPPBROWSER, useValue: inAppBrowserSpy },
        { provide: URL_OPENER, useValue: urlOpenerSpy },
      ],
    });

    service = TestBed.inject(AppInitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initialize waits for platform.ready and opens website by default', async () => {
    const registerSpy = spyOn<any>(service, 'registerOfflineHandler').and.callFake(() => {});
    const openSpy = spyOn<any>(service, 'openWebsite').and.resolveTo();

    await service.initialize();

    expect(platformSpy.ready).toHaveBeenCalled();
    expect(registerSpy).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalled();
  });

  it('initialize does not open website when openWebsite=false', async () => {
    spyOn<any>(service, 'registerOfflineHandler').and.callFake(() => {});
    const openSpy = spyOn<any>(service, 'openWebsite').and.resolveTo();

    await service.initialize({ openWebsite: false });

    expect(openSpy).not.toHaveBeenCalled();
  });

  it('reloadWebsite closes existing in-app browser ref before re-initializing', async () => {
    const closeSpy = jasmine.createSpy('close');
    (service as any).iabRef = { close: closeSpy };
    const initSpy = spyOn(service, 'initialize').and.resolveTo();

    await service.reloadWebsite();

    expect(closeSpy).toHaveBeenCalled();
    expect(initSpy).toHaveBeenCalledWith({ openWebsite: true });
  });

  it('presentOfflineAlert creates and presents an alert', async () => {
    const presentSpy = jasmine.createSpy('present');
    alertCtrlSpy.create.and.resolveTo({ present: presentSpy } as any);

    await (service as any).presentOfflineAlert();

    expect(alertCtrlSpy.create).toHaveBeenCalled();
    expect(presentSpy).toHaveBeenCalled();
  });

  it('registerOfflineHandler wires offline listener and shows alert when offline event fires', () => {
    const presentSpy = spyOn<any>(service, 'presentOfflineAlert').and.resolveTo();
    let offlineListener: (() => void) | undefined;

    spyOn(window, 'addEventListener').and.callFake((type: any, listener: any) => {
      if (type === 'offline') {
        offlineListener = listener;
      }
    });

    (service as any).registerOfflineHandler();

    expect(window.addEventListener).toHaveBeenCalledWith('offline', jasmine.any(Function));
    expect(offlineListener).toEqual(jasmine.any(Function));

    offlineListener?.();
    expect(presentSpy).toHaveBeenCalled();
  });

  it('openWebsite uses InAppBrowser when running on hybrid', async () => {
    platformSpy.is.and.callFake((platform) => platform === 'hybrid');

    await (service as any).openWebsite('https://example.com');

    expect(inAppBrowserSpy.openInExternalBrowser).toHaveBeenCalledWith({ url: 'https://example.com' });
    expect(urlOpenerSpy.assign).not.toHaveBeenCalled();
  });

  it('openWebsite falls back to window.location.assign if InAppBrowser fails', async () => {
    platformSpy.is.and.callFake((platform) => platform === 'hybrid');
    inAppBrowserSpy.openInExternalBrowser.and.rejectWith(new Error('fail'));

    await (service as any).openWebsite('https://example.com/fallback');

    expect(urlOpenerSpy.assign).toHaveBeenCalledWith('https://example.com/fallback');
  });

  it('sendDeviceMetadata returns resolved redirect URL with device query params when allowed', async () => {
    genexusSpy.sendData.and.returnValue(of({ isAllowed: true, redirectUrl: '/next/page' }));

    const url = await (service as any).sendDeviceMetadata();

    const base = (service as any).deploymentBaseUrl as string;
    expect(url.startsWith(`${base}/next/page`)).toBeTrue();
    expect(url).toContain('P_deviceId=device-123');
    expect(url).toContain('P_manufacturer=ACME');
    expect(deviceServiceSpy.getDeviceId).toHaveBeenCalled();
    expect(deviceServiceSpy.getDeviceInfo).toHaveBeenCalled();
    expect(genexusSpy.sendData).toHaveBeenCalledWith('device-123', 'ACME');
    expect(alertCtrlSpy.create).toHaveBeenCalled();
  });

  it('sendDeviceMetadata returns /not-found when backend disallows', async () => {
    genexusSpy.sendData.and.returnValue(of({ isAllowed: false }));

    await expectAsync((service as any).sendDeviceMetadata()).toBeResolvedTo('/not-found');
  });
});
