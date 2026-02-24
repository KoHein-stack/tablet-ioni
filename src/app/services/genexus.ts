import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GenexusService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  sendData(id: string, name: string) {
    console.log('Sending data to Genexus API:', { id, name });
    const body = {
      deviceId: id,
      manufacturer: name,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Manufacturer: name,
      DeviceId: id,
    });

    return this.http.post(this.apiUrl, body, { headers,  withCredentials: true });
  }
}
