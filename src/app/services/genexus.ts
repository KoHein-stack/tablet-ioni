import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GenexusService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  sendData(id: string, name: string) {
    const body = {
      deviceId: id,
      manufacturer: name,
    };

    return this.http.post<any>(this.apiUrl, body);
  }
}
