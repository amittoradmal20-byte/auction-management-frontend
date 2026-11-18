
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../config/api.config';

import { Tournament } from '../models/tournament/tournament.model';
import { TournamentCreateRequest } from '../models/tournament/tournament-create-request.model';
import { TournamentUpdateRequest } from '../models/tournament/tournament-update-request.model';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  private http = inject(HttpClient);

  private readonly apiUrl = `${API_CONFIG.BASE_URL}/tournaments`;

  // =====================================
  // Get All Tournaments
  // =====================================

  getAllTournaments(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(this.apiUrl);
  }

  // =====================================
  // Get Tournament By ID
  // =====================================

  getTournamentById(id: string): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.apiUrl}/${id}`);
  }

  // =====================================
  // Create Tournament
  // =====================================

  createTournament(
    request: TournamentCreateRequest
  ): Observable<Tournament> {

    return this.http.post<Tournament>(
      this.apiUrl,
      request
    );
  }

  // =====================================
  // Update Tournament
  // =====================================

  updateTournament(
    id: string,
    request: TournamentUpdateRequest
  ): Observable<Tournament> {

    return this.http.put<Tournament>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  // =====================================
  // Delete Tournament
  // =====================================

  deleteTournament(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // =====================================
  // Open Tournament Registration
  // DRAFT -> REGISTRATION_OPEN
  // =====================================

  openRegistration(id: string): Observable<Tournament> {

    return this.http.patch<Tournament>(
      `${this.apiUrl}/${id}/open-registration`,
      {}
    );
  }

  // =====================================
  // Close Tournament Registration
  // REGISTRATION_OPEN -> REGISTRATION_CLOSED
  // =====================================

  closeRegistration(id: string): Observable<Tournament> {

    return this.http.patch<Tournament>(
      `${this.apiUrl}/${id}/close-registration`,
      {}
    );
  }

  // =====================================
  // Prepare Tournament For Auction
  // REGISTRATION_CLOSED -> AUCTION_PENDING
  // =====================================

  prepareAuction(id: string): Observable<Tournament> {

    return this.http.patch<Tournament>(
      `${this.apiUrl}/${id}/prepare-auction`,
      {}
    );
  }

}
