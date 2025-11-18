import { Injectable } from '@angular/core';
import { environment } from '../../../../../environment/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { SalesOrderDTO } from '../../../../../common/dto/inventory/sales-order-dto';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Response } from '../../../../../common/dto/util/response';
import { GenericDeserializer } from '../../../../../common/dto/util/generic-deserializer';
import { RequestDto } from '../../../../../common/dto/util/request-dto';
const API_SALES_ORDER_URL = `${environment.API}/salesOrder`;
const API_PURCHASE_ORDER_HISTORY_URL = `${environment.API}/purchaseOrder/history`;
const API_SALES_ORDER_HISTORY_URL = `${environment.API}/salesOrder/history`;
@Injectable({
  providedIn: 'root',
})
export class SalesOrderService {
  private genericDeserializer: GenericDeserializer = new GenericDeserializer();

  private apiUrl = API_SALES_ORDER_URL;
  private apiHistoryUrl = API_SALES_ORDER_HISTORY_URL;

  constructor(private http: HttpClient) {}

  createSalesOrder(salesOrder: SalesOrderDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, salesOrder, { observe: 'response' });
  }

  /**
   * Get all sales orders
   */
  getSalesOrders(): Observable<any> {
    return this.http
      .get<any>(`${API_SALES_ORDER_URL}/search/criteria/all`, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<any>) => response.body),
        catchError((error) => {
          console.error('Error fetching sales orders:', error);
          return throwError(() => new Error('Failed to fetch sales orders'));
        })
      );
  }
  getSalesOrderById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  updateSalesOrder(salesOrder: SalesOrderDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, salesOrder, { observe: 'response' });
  }

  deleteSalesOrder(order: SalesOrderDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, order, { observe: 'response' });
  }

  deleteSalesOrderItem(itemId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/item/${itemId}`, { observe: 'response' });
  }

  getSalesOrderHistory(salesOrderId: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiHistoryUrl}/${salesOrderId}`, { observe: 'response' })
      .pipe(map((response: HttpResponse<any>) => response.body));
  }

  submitForApproval(requestDto: RequestDto): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/submitForApproval`, requestDto, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<any>) => response.body),
        catchError((error) => {
          console.error('Error submitting for approval:', error);
          return throwError(() => error);
        })
      );
  }

  approveSalesOrder(requestDto: RequestDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/approveOrder`, requestDto, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => response.body),
      catchError((error) => {
        console.error('Error approving sales order:', error);
        return throwError(() => error);
      })
    );
  }

  returnSalesOrder(requestDto: RequestDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/returnOrder`, requestDto, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => response.body),
      catchError((error) => {
        console.error('Error returning sales order:', error);
        return throwError(() => error);
      })
    );
  }
}
