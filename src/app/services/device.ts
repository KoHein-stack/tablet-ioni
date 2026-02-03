import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {

  async getDeviceId(): Promise<string> {
    const id = await Device.getId();
    return id.identifier; // ANDROID_ID or UUID
  }

  async getDeviceInfo(): Promise<any> {
    return await Device.getInfo();
  }
}
