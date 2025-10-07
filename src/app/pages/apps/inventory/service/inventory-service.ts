import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProductTypeDto } from '../../../../common/dto/inventory/productType-dto';
import { GenericDeserializer } from '../../../../common/dto/util/generic-deserializer';
import { environment } from '../../../../environment/environment';
import { Response } from '../../../../common/dto/util/response';
import { PurchaseOrderDto } from '../../../../common/dto/inventory/purchase-order-dto';
import { ProductOrderItem } from '../product-order-item/product-order-item';
import { ProductOrderItemDto } from '../../../../common/dto/inventory/product-order-item-dto';
const API_PRODUCT_TYPE_URL = `${environment.API}/productType`;
const API_PRODUCT_ORDER_ITEM_URL = `${environment.API}/productOrderItem`;
@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private baseUrl = API_PRODUCT_TYPE_URL;
  private genericDeserializer: GenericDeserializer = new GenericDeserializer();

  constructor(private http: HttpClient) {}

  getAllProductTypes(): Observable<ProductTypeDto[]> {
    return this.http.get<Response>(`${this.baseUrl}/search/criteria/all`).pipe(
      map((response) =>
        this.genericDeserializer.deserializeJsonArray(response.data, ProductTypeDto)
      ),
      catchError((error) => {
        console.error('Error fetching product types:', error);
        return throwError(() => new Error('Failed to fetch product types'));
      })
    );
  }

  createProductType(productType: ProductTypeDto): Observable<Response> {
    return this.http.post<Response>(`${this.baseUrl}/create`, productType);
  }

  updateProductType(productType: ProductTypeDto): Observable<Response> {
    return this.http.post<Response>(`${this.baseUrl}/update`, productType);
  }

  deleteProductType(productType: ProductTypeDto): Observable<Response> {
    return this.http.post<Response>(`${this.baseUrl}/delete`, productType);
  }
  findAllProductOrderItemByPurchaseOrder(
    purchaseOrder: PurchaseOrderDto
  ): Observable<ProductOrderItemDto[]> {
    return this.http
      .post<Response>(`${API_PRODUCT_ORDER_ITEM_URL}/search/criteria/purchaseOrder`, purchaseOrder)
      .pipe(
        map((response) =>
          this.genericDeserializer.deserializeJsonArray(response.data, ProductOrderItemDto)
        ),
        catchError((error) => {
          console.error('Error fetching product order items:', error);
          return throwError(() => new Error('Failed to fetch product order items'));
        })
      );
  }
}
