import { Injectable } from '@angular/core';
import { environment } from '../../../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { SalesOrderDTO } from '../../../../../common/dto/inventory/sales-order-dto';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Response } from '../../../../../common/dto/util/response';
import { GenericDeserializer } from '../../../../../common/dto/util/generic-deserializer';
const API_SALES_ORDER_URL = `${environment.API}/salesOrder`;

@Injectable({
  providedIn: 'root',
})
export class SalesOrderService {
  private genericDeserializer: GenericDeserializer = new GenericDeserializer();

  private apiUrl = API_SALES_ORDER_URL;
  constructor(private http: HttpClient) {}

  createSalesOrder(salesOrder: SalesOrderDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, salesOrder, { observe: 'response' });
  }
  getSalesOrders(): Observable<SalesOrderDTO[]> {
    return this.http.get<Response>(`${this.apiUrl}/search/criteria/all`).pipe(
      map((response) =>
        this.genericDeserializer.deserializeJsonArray(response.data, SalesOrderDTO)
      ),
      catchError((error) => {
        console.error('Error fetching sales orders:', error);
        return throwError(() => new Error('Failed to fetch sales orders'));
      })
    );
  }

  updateSalesOrder(salesOrder: SalesOrderDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, salesOrder, { observe: 'response' });
  }

  deleteSalesOrderItem(itemId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/item/${itemId}`, { observe: 'response' });
  }
}
