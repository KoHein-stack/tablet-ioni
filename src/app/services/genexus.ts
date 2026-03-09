import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface DeviceLoginResponse {
  isAllowed: boolean;
  redirectUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GenexusService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  sendData(id: string, name: string) {
    console.log('Sending data to Genexus API:', { id, name });
    const body = {
      deviceId: '0f952d37-8eac-4efc-b235-c02ae6571311',
      manufacturer: name,
    
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Manufacturer': name,
      'DeviceId': '0f952d37-8eac-4efc-b235-c02ae6571311',
    });

    return this.http.post<DeviceLoginResponse>(this.apiUrl, body, { headers });
  }
}
