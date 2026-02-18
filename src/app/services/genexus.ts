import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DeviceService } from './device';

@Injectable({
  providedIn: 'root',
})
export class GenexusService { // Renamed slightly for standard naming conventions

  // Ensure environment has the base URL string
  private apiUrl = environment.apiUrl;
  private id: any;
  private infos: any;

  constructor(private http: HttpClient, private deviceService: DeviceService) {
    this.id = this.deviceService.getDeviceId();
    this.infos = this.deviceService.getDeviceInfo();
  }



  sendData(id: number = this.id, name: string = this.infos.manufacturer) {
    const body = {
      deviceId: id,
      manufacturer: name
    };
    console.log('app is api calling!')

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'deviceId': id.toString(),
        'manufacturer': name
      })
    };



    // FIX: Use backticks `` instead of single quotes '' for template strings
    // return this.http.post<any>(`${this.apiUrl}`, httpOptions);
    return this.http.post<any>(`${this.apiUrl}`, body, httpOptions);
  }
}