
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  MatchScheduleResponse
} from '../models/match-schedule/match-schedule.model';

import {
  MatchScheduleCreateRequest
} from '../models/match-schedule/match-schedule-create-request.model';

import {
  MatchScheduleFixtureResponse,
  MatchScheduleTeamDrawResponse,
  MatchScheduleGenerationResponse
} from '../models/match-schedule/match-schedule-generation.model';

@Injectable({
  providedIn: 'root'
})
export class MatchScheduleService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/api/v1/match-schedules';

  // =====================================
  // 1. GET SCHEDULE BY ID
  // =====================================

  getScheduleById(
    scheduleId: string
  ): Observable<MatchScheduleResponse> {

    return this.http.get<MatchScheduleResponse>(
      `${this.apiUrl}/${scheduleId}`
    );
  }

  // =====================================
  // 2. GET SCHEDULES BY TOURNAMENT
  // =====================================

  getSchedulesByTournament(
    tournamentId: string
  ): Observable<MatchScheduleResponse[]> {

    return this.http.get<MatchScheduleResponse[]>(
      `${this.apiUrl}/tournament/${tournamentId}`
    );
  }

  // =====================================
  // 3. CREATE MATCH SCHEDULE
  // =====================================

  createSchedule(
    request: MatchScheduleCreateRequest
  ): Observable<MatchScheduleResponse> {

    return this.http.post<MatchScheduleResponse>(
      this.apiUrl,
      request
    );
  }

  // =====================================
  // 4. GENERATE MATCH FIXTURES
  // =====================================

  generateSchedule(
    scheduleId: string
  ): Observable<MatchScheduleGenerationResponse> {

    return this.http.post<MatchScheduleGenerationResponse>(
      `${this.apiUrl}/${scheduleId}/generate`,
      {}
    );
  }

  // =====================================
  // 5. GET GENERATED TEAM DRAWS
  // =====================================

  getTeamDraws(
    scheduleId: string
  ): Observable<MatchScheduleTeamDrawResponse[]> {

    return this.http.get<MatchScheduleTeamDrawResponse[]>(
      `${this.apiUrl}/${scheduleId}/team-draws`
    );
  }

  // =====================================
  // 6. GET GENERATED MATCH FIXTURES
  // =====================================

  getFixtures(
    scheduleId: string
  ): Observable<MatchScheduleFixtureResponse[]> {

    return this.http.get<MatchScheduleFixtureResponse[]>(
      `${this.apiUrl}/${scheduleId}/fixtures`
    );
  }
}
