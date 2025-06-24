import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { PredictionRequest, PredictionResponse } from '../interfaces/medical.interface';

@Injectable() // 🔧 Removí 'providedIn: root'
export class MedicalService {
  private readonly API_URL = 'http://localhost:3000'; // 🔧 Cambia por tu URL de API
  private readonly REQUEST_TIMEOUT = 30000; // 30 segundos

  // 🔧 Usar inject() en lugar de constructor
  private http = inject(HttpClient);

  /**
   * Envía síntomas al endpoint de predicción
   */
  predictDisease(request: PredictionRequest): Observable<PredictionResponse> {
    return this.http.post<PredictionResponse>(`${this.API_URL}/predict-friendly`, request)
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError(this.handleError)
      );
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
          break;
        case 404:
          errorMessage = 'Servicio no encontrado. Verifica que el servidor esté funcionando.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
          break;
        case 408:
          errorMessage = 'La consulta tardó demasiado tiempo. Intenta nuevamente.';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      }
    }

    console.error('Error en MedicalService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
