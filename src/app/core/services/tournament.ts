
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

  getAllTournaments(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(this.apiUrl);
  }

  getTournamentById(id: string): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.apiUrl}/${id}`);
  }

  createTournament(request: TournamentCreateRequest): Observable<Tournament> {
  return this.http.post<Tournament>(this.apiUrl, request);
  }

    updateTournament(
    id: string,
    request: TournamentUpdateRequest
    ): Observable<Tournament> {
    return this.http.put<Tournament>(`${this.apiUrl}/${id}`, request);
    }

}
