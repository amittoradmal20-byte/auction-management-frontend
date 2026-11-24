import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../config/api.config';

import {
  TournamentTeamResponse
} from '../models/tournament-team/tournament-team.model';

@Injectable({
  providedIn: 'root'
})
export class TournamentTeamService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${API_CONFIG.BASE_URL}/tournament-teams`;

  // =====================================
  // Get Teams By Tournament
  // =====================================

  getTeamsByTournament(
    tournamentId: string
  ): Observable<TournamentTeamResponse[]> {

    return this.http.get<TournamentTeamResponse[]>(
      `${this.apiUrl}/tournament/${tournamentId}`
    );

  }

}