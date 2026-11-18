
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../config/api.config';
import { Player } from '../models/player/player.model';
import { PlayerCreateRequest } from '../models/player/player-create-request.model';
import { PlayerUpdateRequest } from '../models/player/player-update-request.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private http = inject(HttpClient);

  private readonly apiUrl = `${API_CONFIG.BASE_URL}/players`;

  // Get all players, optionally filtered by status and role
  getAllPlayers(
    status?: string,
    role?: string
  ): Observable<Player[]> {

    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    if (role) {
      params = params.set('role', role);
    }

    return this.http.get<Player[]>(this.apiUrl, { params });
  }

  // Get a single player by ID
  getPlayerById(playerId: string): Observable<Player> {
    return this.http.get<Player>(
      `${this.apiUrl}/${playerId}`
    );
  }


  // Create a new player
  createPlayer(request: PlayerCreateRequest): Observable<Player> {

    return this.http.post<Player>(
      this.apiUrl,
      request
    );
  }

  updatePlayer(playerId: string,  request: PlayerUpdateRequest): Observable<Player> {

  return this.http.put<Player>(
    `${this.apiUrl}/${playerId}`,
    request
  );

}


deactivatePlayer(playerId: string): Observable<void> {

  return this.http.patch<void>(
    `${this.apiUrl}/${playerId}/deactivate`,
    null
  );

}

activatePlayer(playerId: string): Observable<void> {

  return this.http.patch<void>(
    `${this.apiUrl}/${playerId}/activate`,
    null
  );

}



}
