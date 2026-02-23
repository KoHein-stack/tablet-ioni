import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DeviceService } from './device';

@Injectable({
  providedIn: 'root',
})
export class GenexusService {

  // Ensure environment has the base URL string
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  sendData(id: string, name: string) {
    const body = {
      deviceId: id,
      manufacturer: name
    };
    console.log('app is api calling!')

    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json',
    //     'deviceId': id,
    //     'manufacturer': name
    //   })
    // };
    // httpOptions

    return this.http.post<any>(`${this.apiUrl}`, body);
  }
}