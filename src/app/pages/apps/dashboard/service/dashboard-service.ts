import { Injectable } from '@angular/core';
import { DashboardReportDto } from '../../../../common/dto/report/dasboard-report-dto';
import { catchError, map, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GenericDeserializer } from '../../../../common/dto/util/generic-deserializer';
import { environment } from '../../../../environment/environment';
import { Response } from '../../../../common/dto/util/response';
const API_DASHBOARD_URL = `${environment.API}/dashboard`;

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private genericDeserializer: GenericDeserializer = new GenericDeserializer();

  constructor(private http: HttpClient) {}

  getDashboardReport(): Observable<DashboardReportDto> {
    return this.http.get<Response>(`${API_DASHBOARD_URL}/report`).pipe(
      map((response) => {
        return this.genericDeserializer.deserializeJson(response.data, DashboardReportDto);
      }),
      catchError((error) => {
        // Handle the error and throw it for the caller to handle
        console.error('Error fetching Dashboard Report:', error);
        return throwError(() => new Error('Failed to fetch Dashboard Report'));
      })
    );
  }
}
