
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Team } from '../models/team/team.model';
import { TeamCreateRequest } from '../models/team/team-create-request.model';
import { TeamUpdateRequest } from '../models/team/team-update-request.model';

import { API_CONFIG } from '../config/api.config';
import { ImageService } from './image';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private readonly http = inject(HttpClient);

  private readonly imageService = inject(ImageService);

  private readonly apiUrl = `${API_CONFIG.BASE_URL}/teams`;

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

  // =====================================
  // Upload / Replace Team Logo
  // =====================================

  uploadLogo(
    teamId: string,
    file: File
  ): Observable<Team> {

    return this.imageService.uploadLogo<Team>(
      'teams',
      teamId,
      file
    );

  }

  // =====================================
  // Remove Team Logo
  // =====================================

  deleteLogo(teamId: string): Observable<Team> {

    return this.imageService.deleteLogo<Team>(
      'teams',
      teamId
    );

  }

}
