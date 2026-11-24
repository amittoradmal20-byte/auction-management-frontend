
import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { TournamentService } from '../../core/services/tournament';

import { Tournament } from '../../core/models/tournament/tournament.model';

import { MatchScheduleService } from '../../core/services/match-schedule';

import { MatchScheduleResponse } from '../../core/models/match-schedule/match-schedule.model';


@Component({
  selector: 'app-match-schedules',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './match-schedules.html',
  styleUrl: './match-schedules.scss'
})
export class MatchSchedules implements OnInit {

  // =====================================
  // 1. DEPENDENCY INJECTION
  // =====================================

  private readonly tournamentService =
    inject(TournamentService);

  private readonly matchScheduleService =
    inject(MatchScheduleService);

  private readonly route =
    inject(ActivatedRoute);


  // =====================================
  // 2. COMPONENT STATE
  // =====================================

  tournaments: Tournament[] = [];

  schedules: MatchScheduleResponse[] = [];

  selectedTournamentId = '';

  loadingTournaments = false;

  loading = false;

  errorMessage = '';

  tournamentErrorMessage = '';

  private scheduleRequestVersion = 0;


  // =====================================
  // 3. INITIALIZATION
  // =====================================

  ngOnInit(): void {

    this.loadTournaments();

  }


  // =====================================
  // 4. LOAD ALL TOURNAMENTS
  // =====================================

  loadTournaments(): void {

    this.loadingTournaments = true;

    this.tournamentErrorMessage = '';

    this.tournamentService
      .getAllTournaments()
      .subscribe({

        next: (response) => {

          this.tournaments = response;

          this.loadingTournaments = false;

          // Read tournamentId from redirect URL
          const requestedTournamentId =
            this.route.snapshot.queryParamMap.get(
              'tournamentId'
            );

          // Verify the requested tournament exists
          const requestedTournamentExists =
            this.tournaments.some(
              tournament =>
                tournament.id === requestedTournamentId
            );

          // Priority 1: Tournament from redirect URL
          if (
            requestedTournamentExists &&
            requestedTournamentId
          ) {

            this.selectedTournamentId =
              requestedTournamentId;

          }

          // Priority 2: Preserve current selection
          else if (
            this.selectedTournamentId &&
            this.tournaments.some(
              tournament =>
                tournament.id === this.selectedTournamentId
            )
          ) {

            // Keep the existing tournament selection

          }

          // Priority 3: Select first tournament
          else if (this.tournaments.length > 0) {

            this.selectedTournamentId =
              this.tournaments[0].id;

          }

          // No tournaments available
          else {

            this.selectedTournamentId = '';

          }

          if (this.selectedTournamentId) {

            this.loadSchedules();

          } else {

            this.scheduleRequestVersion++;

            this.schedules = [];

            this.loading = false;

          }

        },

        error: (error) => {

          console.error(
            'Failed to load tournaments:',
            error
          );

          this.tournamentErrorMessage =
            'Unable to load tournaments. Please try again.';

          this.loadingTournaments = false;

        }

      });

  }


  // =====================================
  // 5. TOURNAMENT SELECTION CHANGED
  // =====================================

  onTournamentChange(tournamentId: string): void {

    this.selectedTournamentId = tournamentId;

    this.schedules = [];

    this.errorMessage = '';

    if (tournamentId) {

      this.loadSchedules();

    } else {

      this.scheduleRequestVersion++;

      this.loading = false;

    }

  }


  // =====================================
  // 6. LOAD SCHEDULES BY TOURNAMENT
  // =====================================

  loadSchedules(): void {

    if (!this.selectedTournamentId) {
      return;
    }

    const tournamentId =
      this.selectedTournamentId;

    const requestVersion =
      ++this.scheduleRequestVersion;

    this.loading = true;

    this.errorMessage = '';

    this.schedules = [];

    this.matchScheduleService
      .getSchedulesByTournament(tournamentId)
      .subscribe({

        next: (response) => {

          // Ignore outdated API responses
          if (
            requestVersion !==
            this.scheduleRequestVersion
          ) {
            return;
          }

          this.schedules = response;

          this.loading = false;

        },

        error: (error) => {

          // Ignore outdated API responses
          if (
            requestVersion !==
            this.scheduleRequestVersion
          ) {
            return;
          }

          console.error(
            'Failed to load match schedules:',
            error
          );

          this.errorMessage =
            'Unable to load match schedules. Please try again.';

          this.loading = false;

        }

      });

  }


  // =====================================
  // 7. RESOLVE TOURNAMENT NAME
  // =====================================

  getTournamentName(tournamentId: string): string {

    if (!tournamentId) {
      return 'N/A';
    }

    const tournament = this.tournaments.find(
      item => item.id === tournamentId
    );

    return tournament?.name ?? 'N/A';

  }

}
