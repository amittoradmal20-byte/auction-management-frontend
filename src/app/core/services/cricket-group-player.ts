
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../config/api.config';

import { CricketGroupPlayer } from '../models/cricket-group-player/cricket-group-player.model';

import { CricketGroupPlayerAddRequest } from '../models/cricket-group-player/cricket-group-player-add-request.model';

@Injectable({
  providedIn: 'root'
})
export class CricketGroupPlayerService {

  private http = inject(HttpClient);

  private readonly apiUrl =
    `${API_CONFIG.BASE_URL}/cricket-groups`;

  // Get all players belonging to a cricket group
  getGroupPlayers(
    cricketGroupId: string
  ): Observable<CricketGroupPlayer[]> {

    return this.http.get<CricketGroupPlayer[]>(
      `${this.apiUrl}/${cricketGroupId}/players`
    );
  }

  // Add an existing player to a cricket group
  addPlayerToGroup(
    cricketGroupId: string,
    request: CricketGroupPlayerAddRequest
  ): Observable<CricketGroupPlayer> {

    return this.http.post<CricketGroupPlayer>(
      `${this.apiUrl}/${cricketGroupId}/players`,
      request
    );
  }

  // Deactivate a player within a cricket group
  deactivatePlayer(
    cricketGroupId: string,
    playerId: string
  ): Observable<CricketGroupPlayer> {

    return this.http.delete<CricketGroupPlayer>(
      `${this.apiUrl}/${cricketGroupId}/players/${playerId}`
    );
  }

  // Reactivate a previously deactivated player
  reactivatePlayer(
    cricketGroupId: string,
    playerId: string
  ): Observable<CricketGroupPlayer> {

    return this.http.post<CricketGroupPlayer>(
      `${this.apiUrl}/${cricketGroupId}/players/${playerId}/reactivate`,
      {}
    );
  }

}
