import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { PredictionRequest, PredictionResponse } from '../interfaces/medical.interface';

@Injectable()
export class MedicalService {
  private readonly API_URL = 'https://backendsaludia.onrender.com'; // 🔧 Cambia por tu URL de API
  private readonly REQUEST_TIMEOUT = 10000; // 10 segundos

  private http = inject(HttpClient);

  /**
   * Envía síntomas al endpoint de predicción con nuevo formato
   */
  predictDisease(request: PredictionRequest): Observable<PredictionResponse> {
    // 🆕 Incluir el modelo en la request
    const requestBody = {
      symptoms: request.symptoms,
      age: request.age,
      gender: request.gender,
      model: request.model || 'v8' // Default a v8
    };

    return this.http.post<PredictionResponse>(`${this.API_URL}/api/predict-friendly`, requestBody)
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
