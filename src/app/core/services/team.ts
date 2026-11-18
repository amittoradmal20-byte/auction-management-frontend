
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Team } from '../models/team/team.model';
import { TeamCreateRequest } from '../models/team/team-create-request.model';
import { TeamUpdateRequest } from '../models/team/team-update-request.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/api/v1/teams';

  // =====================================
  // Get All Teams
  // =====================================

  getAllTeams(): Observable<Team[]> {

    return this.http.get<Team[]>(
      this.apiUrl
    );
  }

  // =====================================
  // Get Team By ID
  // =====================================

  getTeamById(id: string): Observable<Team> {

    return this.http.get<Team>(
      `${this.apiUrl}/${id}`
    );
  }

  // =====================================
  // Create Team
  // =====================================

  createTeam(request: TeamCreateRequest): Observable<Team> {

    return this.http.post<Team>(
      this.apiUrl,
      request
    );
  }

  // =====================================
  // Update Team
  // =====================================

  updateTeam(
    id: string,
    request: TeamUpdateRequest
  ): Observable<Team> {

    return this.http.put<Team>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  // =====================================
  // Delete Team
  // =====================================

  deleteTeam(id: string): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}
