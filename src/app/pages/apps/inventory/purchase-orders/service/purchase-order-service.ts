import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PurchaseOrderDto } from '../../../../../common/dto/inventory/purchase-order-dto';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../environment/environment';
import { PurchaseOrderHistoryDto } from '../../../../../common/dto/inventory/purchase-order-history';
import { GenericDeserializer } from '../../../../../common/dto/util/generic-deserializer';
import { Response } from '../../../../../common/dto/util/response';
import { RequestDto } from '../../../../../common/dto/util/request-dto';

const API_PURCHASE_ORDER_URL = `${environment.API}/purchaseOrder`;
const API_PURCHASE_ORDER_HISTORY_URL = `${environment.API}/purchaseOrder/history`;

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  private apiUrl = API_PURCHASE_ORDER_URL;
  private apiHistoryUrl = API_PURCHASE_ORDER_HISTORY_URL;
  private genericDeserializer: GenericDeserializer = new GenericDeserializer();

  constructor(private http: HttpClient) {}

  createPurchaseOrder(purchaseOrder: PurchaseOrderDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, purchaseOrder, { observe: 'response' });
  }

  updatePurchaseOrder(purchaseOrder: PurchaseOrderDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, purchaseOrder, { observe: 'response' });
  }

  getPurchaseOrderById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getPurchaseOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/criteria/all`);
  }

  deletePurchaseOrderItem(itemId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/item/${itemId}`, { observe: 'response' });
  }
  deletePurchaseOrder(order: PurchaseOrderDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, order, { observe: 'response' });
  }

  getPurchaseOrderHistory(purchaseOrderId: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiHistoryUrl}/${purchaseOrderId}`, { observe: 'response' })
      .pipe(map((response: HttpResponse<any>) => response.body));
  }
  getAllPurchaseOrderHistory(purchaseOrderId: string): Observable<PurchaseOrderHistoryDto[]> {
    return this.http.get<Response>(`${this.apiHistoryUrl}/${purchaseOrderId}`).pipe(
      map((response) =>
        this.genericDeserializer.deserializeJsonArray(response.data, PurchaseOrderHistoryDto)
      ),
      catchError((error) => {
        console.error('Error fetching purchase order history:', error);
        return throwError(() => new Error('Failed to fetch purchase order history'));
      })
    );
  }

  // Approval workflow methods
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

  approvePurchaseOrder(requestDto: RequestDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/approveOrder`, requestDto, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => response.body),
      catchError((error) => {
        console.error('Error approving purchase order:', error);
        return throwError(() => error);
      })
    );
  }

  returnPurchaseOrder(requestDto: RequestDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/returnOrder`, requestDto, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => response.body),
      catchError((error) => {
        console.error('Error returning purchase order:', error);
        return throwError(() => error);
      })
    );
  }
}
