import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

export interface CapacitorDevicePlugin {
  getId: typeof Device.getId;
  getInfo: typeof Device.getInfo;
}

export const CAPACITOR_DEVICE = new InjectionToken<CapacitorDevicePlugin>(
  'CAPACITOR_DEVICE',
  {
    providedIn: 'root',
    factory: () => Device,
  }
);

@Injectable({
  providedIn: 'root',
})
export class DeviceService {

  constructor(@Inject(CAPACITOR_DEVICE) private readonly devicePlugin: CapacitorDevicePlugin) {}

  async getDeviceId(): Promise<string> {
    // if (!Capacitor.isNativePlatform()) {
    //   return 'web-device-id';
    // }

    const id = await this.devicePlugin.getId();
    return id.identifier; // ANDROID_ID or UUID
  }

  async getDeviceInfo(): Promise<any> {
    // if (!Capacitor.isNativePlatform()) {
    //   return {
    //     platform: Capacitor.getPlatform(),
    //     manufacturer: 'Unknown',
    //   };
    // }

    const info = await this.devicePlugin.getInfo();
    console.log('Fetching device information...', info);
    return info;
  }
}
