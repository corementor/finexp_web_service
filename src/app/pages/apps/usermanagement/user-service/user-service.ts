import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { GenericDeserializer } from '../../../../common/dto/util/generic-deserializer';
import { catchError, map, Observable, throwError } from 'rxjs';
import { UserDTO } from '../../../../common/dto/usermanagement/user-dto';
import { Response } from '../../../../common/dto/util/response';
import { RoleDTO } from '../../../../common/dto/usermanagement/role-dto';
const API_USER_URL = `${environment.API}/user`;
const API_ROLE_URL = `${environment.API}/role`;
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private genericDeserializer: GenericDeserializer = new GenericDeserializer();

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<Response>(`${API_USER_URL}/search/criteria/all`).pipe(
      map((response) => this.genericDeserializer.deserializeJsonArray(response.data, UserDTO)),
      catchError((error) => {
        console.error('Error fetching users:', error);
        return throwError(() => new Error('Failed to fetch users'));
      })
    );
  }
  findAllRoles(): Observable<RoleDTO[]> {
    return this.http.get<Response>(`${API_ROLE_URL}/search/criteria/all`).pipe(
      map((response) => this.genericDeserializer.deserializeJsonArray(response.data, RoleDTO)),
      catchError((error) => {
        console.error('Error fetching roles:', error);
        return throwError(() => new Error('Failed to fetch roles'));
      })
    );
  }

  createUser(user: UserDTO): Observable<any> {
    return this.http.post(`${API_USER_URL}/create`, user, { observe: 'response' });
  }

  updateUser(user: UserDTO): Observable<any> {
    return this.http.post(`${API_USER_URL}/update`, user, { observe: 'response' });
  }

  deleteUser(user: UserDTO): Observable<any> {
    console.log('user to delete: ', user);
    return this.http.delete(`${API_USER_URL}/delete/${user.id}`, { observe: 'response' });
  }

  // getUserById(userId: String): Observable<any> {
  //   return this.http.get(`${API_USER_URL}/search/criteria/${userId}`);
  // }

  getUserById(userId: string): Observable<UserDTO> {
    return this.http.get<Response>(`${API_USER_URL}/search/criteria/${userId}`).pipe(
      map((response) => this.genericDeserializer.deserializeJson(response.data, UserDTO)),
      catchError((error) => {
        console.error('Error fetching user:', error);
        return throwError(() => new Error('Failed to fetch user'));
      })
    );
  }
}
