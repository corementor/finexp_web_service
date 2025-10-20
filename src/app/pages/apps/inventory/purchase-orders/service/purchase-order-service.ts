import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PurchaseOrderDto } from '../../../../../common/dto/inventory/purchase-order-dto';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment/environment';
const API_PURCHASE_ORDER_URL = `${environment.API}/purchaseOrder`;
@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  private apiUrl = API_PURCHASE_ORDER_URL;
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
}
