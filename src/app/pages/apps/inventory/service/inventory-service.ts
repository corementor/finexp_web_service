import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProductTypeDto } from '../../../../common/dto/inventory/productType-dto';
import { GenericDeserializer } from '../../../../common/dto/util/generic-deserializer';
import { environment } from '../../../../environment/environment';
import { Response } from '../../../../common/dto/util/response';
const API_PRODUCT_TYPE_URL = `${environment.API}/productType`;
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
}
