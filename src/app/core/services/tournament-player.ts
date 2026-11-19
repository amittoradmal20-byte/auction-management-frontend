
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../config/api.config';

import { TournamentPlayer } from '../models/tournament-player/tournament-player.model';

import { TournamentPlayerCreateRequest } from '../models/tournament-player/tournament-player-create-request.model';

@Injectable({
  providedIn: 'root'
})
export class TournamentPlayerService {

  private http = inject(HttpClient);

  private readonly apiUrl =
    `${API_CONFIG.BASE_URL}/tournament-players`;

  // =====================================
  // 1. Register or Re-register Player
  // =====================================

  registerPlayer(
    request: TournamentPlayerCreateRequest
  ): Observable<TournamentPlayer> {

    return this.http.post<TournamentPlayer>(
      this.apiUrl,
      request
    );
  }

  // =====================================
  // 2. Get Players by Tournament
  // =====================================

  getPlayersByTournament(
    tournamentId: string
  ): Observable<TournamentPlayer[]> {

    return this.http.get<TournamentPlayer[]>(
      `${this.apiUrl}/tournament/${tournamentId}`
    );
  }

  // =====================================
  // 3. Withdraw Player from Tournament
  // =====================================

  withdrawPlayer(
    tournamentId: string,
    playerId: string
  ): Observable<TournamentPlayer> {

    return this.http.patch<TournamentPlayer>(
      `${this.apiUrl}/tournament/${tournamentId}/player/${playerId}/withdraw`,
      {}
    );
  }

}
