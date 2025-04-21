import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Status } from '../enum/status.enum';
import { CustomResponse } from '../interface/custom-response';
import { Server } from '../interface/server';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/v1/server';
  constructor() {}

  //Procedure approach

  // getServers(): Observable<CustomResponse> {
  //   return this.http.get<CustomResponse>(
  //     `http://localhost:8080/api/v1/server/list`
  //   );
  // }

  //Reactive approach
  servers$ = <Observable<CustomResponse>>(
    this.http
      .get<CustomResponse>(`${this.apiUrl}/list`)
      .pipe(tap(console.log), catchError(this.handleError))
  );

  save$ = (server: Server) =>
    <Observable<CustomResponse>>(
      this.http
        .post<CustomResponse>(`${this.apiUrl}/save`, server)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  filter$ = (status: Status, response: CustomResponse) =>
    <Observable<CustomResponse>>new Observable<CustomResponse>((subscribe) => {
      console.log(response);
      subscribe.next(
        status === Status.ALL
          ? { ...response, message: `Servers filterd by ${status} status` }
          : {
              ...response,
              message:
                response.data.servers?.filter(
                  (server) => server.status === status
                ).length > 0
                  ? `Servers filterd by ${
                      status === Status.SERVER_UP ? 'SERVER UP' : 'SERVER DOWN'
                    } status`
                  : `No servers of ${status} found`,
              data: {
                servers: response.data.servers?.filter(
                  (server) => server.status === status
                ),
              },
            }
      );
      subscribe.complete();
    }).pipe(tap(console.log), catchError(this.handleError));

  ping$ = (ipAddress: String) =>
    <Observable<CustomResponse>>(
      this.http
        .get<CustomResponse>(`${this.apiUrl}/ping/${ipAddress}`)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  delete$ = (serverId: number) =>
    <Observable<CustomResponse>>(
      this.http
        .delete<CustomResponse>(`${this.apiUrl}/delete/${serverId}`)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`An error ocurrerd - Error code: ${error.status}`);
  }
}
