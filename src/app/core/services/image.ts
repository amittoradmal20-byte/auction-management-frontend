
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { API_CONFIG } from '../config/api.config';

// =====================================
// Supported Image Categories
// =====================================

export type ImageCategory =
  | 'tournaments'
  | 'teams'
  | 'players'
  | 'sponsors';

// =====================================
// Supported Logo Categories
// =====================================

export type LogoCategory =
  | 'tournaments'
  | 'teams';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = API_CONFIG.BASE_URL;

  private readonly imageApiUrl = `${this.apiUrl}/images`;

  // =====================================
  // Image Path Validation Pattern
  // =====================================

  private readonly imagePathPattern =
    /^(tournaments|teams|players|sponsors)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg)$/;

  // =====================================
  // Retrieve Secured Image
  // =====================================

  getImage(imagePath: string): Observable<Blob> {

    if (!this.isValidImagePath(imagePath)) {

      return throwError(
        () => new Error('Invalid image path.')
      );
    }

    return this.http.get(
      `${this.imageApiUrl}/${imagePath}`,
      {
        responseType: 'blob'
      }
    );
  }

  // =====================================
  // Upload Logo
  // =====================================

  uploadLogo<T>(
    category: LogoCategory,
    entityId: string,
    file: File
  ): Observable<T> {

    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<T>(
      `${this.apiUrl}/${category}/${entityId}/logo`,
      formData
    );
  }

  // =====================================
  // Delete Logo
  // =====================================

  deleteLogo<T>(
    category: LogoCategory,
    entityId: string
  ): Observable<T> {

    return this.http.delete<T>(
      `${this.apiUrl}/${category}/${entityId}/logo`
    );
  }

  // =====================================
  // Validate Image Path
  // =====================================

  isValidImagePath(
    imagePath: string | null | undefined
  ): boolean {

    if (!imagePath) {
      return false;
    }

    return this.imagePathPattern.test(imagePath);
  }

}
