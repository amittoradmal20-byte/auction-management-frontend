
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PlayerService } from '../../../core/services/player';
import { TournamentService } from '../../../core/services/tournament';
import { TournamentPlayerService } from '../../../core/services/tournament-player';

import { Player } from '../../../core/models/player/player.model';

import {
  TournamentPlayer,
  TournamentPlayerStatus
} from '../../../core/models/tournament-player/tournament-player.model';

import {
  TournamentPlayerCreateRequest
} from '../../../core/models/tournament-player/tournament-player-create-request.model';

@Component({
  selector: 'app-tournament-players',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tournament-players.html',
  styleUrl: './tournament-players.scss'
})
export class TournamentPlayers implements OnInit {

  private route = inject(ActivatedRoute);

  private playerService = inject(PlayerService);

  private tournamentService = inject(TournamentService);

  private tournamentPlayerService = inject(TournamentPlayerService);

  readonly TournamentPlayerStatus = TournamentPlayerStatus;

  tournamentId = '';

  tournamentStatus = '';

  allPlayers: Player[] = [];

  tournamentPlayers: TournamentPlayer[] = [];

  availablePlayers: Player[] = [];

  selectedPlayerId = '';

  isLoading = false;

  isRegistering = false;

  processingPlayerId: string | null = null;

  errorMessage = '';

  successMessage = '';

  // =====================================
  // Component Initialization
  // =====================================

  ngOnInit(): void {

    this.tournamentId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.tournamentId) {
      this.errorMessage = 'Invalid tournament ID.';
      return;
    }

    this.loadPlayers();
  }

  // =====================================
  // Load Tournament and Players
  // =====================================

  loadPlayers(): void {

    if (!this.tournamentId || this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.errorMessage = '';

    forkJoin({

      tournament:
        this.tournamentService.getTournamentById(
          this.tournamentId
        ),

      players:
        this.playerService.getAllPlayers(),

      tournamentPlayers:
        this.tournamentPlayerService.getPlayersByTournament(
          this.tournamentId
        )

    }).subscribe({

      next: (response) => {

        this.tournamentStatus = response.tournament.status;

        this.allPlayers = response.players;

        this.tournamentPlayers = response.tournamentPlayers;

        this.updateAvailablePlayers();

        this.isLoading = false;
      },

      error: (error) => {

        console.error(
          'Error loading tournament players:',
          error
        );

        this.errorMessage =
          error.error?.message ||
          'Unable to load tournament players. Please try again.';

        this.isLoading = false;
      }

    });
  }

  // =====================================
  // Check Tournament Registration Status
  // =====================================

  get isRegistrationOpen(): boolean {

    return this.tournamentStatus === 'REGISTRATION_OPEN';
  }

  // =====================================
  // Filter Available Players
  // =====================================

  updateAvailablePlayers(): void {

    const registeredPlayerIds = new Set(
      this.tournamentPlayers.map(
        tournamentPlayer => tournamentPlayer.playerId
      )
    );

    this.availablePlayers = this.allPlayers.filter(
      player =>
        player.status === 'ACTIVE' &&
        !registeredPlayerIds.has(player.id)
    );

    if (
      this.selectedPlayerId &&
      !this.availablePlayers.some(
        player => player.id === this.selectedPlayerId
      )
    ) {
      this.selectedPlayerId = '';
    }
  }

  // =====================================
  // Select Player
  // =====================================

  onPlayerChange(playerId: string): void {

    this.selectedPlayerId = playerId;

    this.errorMessage = '';

    this.successMessage = '';
  }

  // =====================================
  // Register Player
  // =====================================

  registerPlayer(): void {

    if (
      !this.tournamentId ||
      !this.selectedPlayerId ||
      !this.isRegistrationOpen ||
      this.isRegistering ||
      this.processingPlayerId !== null ||
      this.isLoading
    ) {
      return;
    }

    const request: TournamentPlayerCreateRequest = {
      tournamentId: this.tournamentId,
      playerId: this.selectedPlayerId
    };

    this.isRegistering = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.tournamentPlayerService.registerPlayer(request)
      .subscribe({

        next: (response: TournamentPlayer) => {

          this.upsertTournamentPlayer(response);

          this.selectedPlayerId = '';

          this.updateAvailablePlayers();

          this.successMessage =
            'Player registered successfully for the tournament.';

          this.isRegistering = false;
        },

        error: (error) => {

          console.error(
            'Error registering tournament player:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Unable to register player. Please try again.';

          this.isRegistering = false;
        }

      });
  }

  // =====================================
  // Withdraw Player
  // =====================================

  withdrawPlayer(playerId: string): void {

    if (
      !this.tournamentId ||
      !playerId ||
      !this.isRegistrationOpen ||
      this.isLoading ||
      this.isRegistering ||
      this.processingPlayerId !== null
    ) {
      return;
    }

    const tournamentPlayer = this.tournamentPlayers.find(
      player => player.playerId === playerId
    );

    if (
      !tournamentPlayer ||
      tournamentPlayer.status !== TournamentPlayerStatus.SELECTED
    ) {
      return;
    }

    this.processingPlayerId = playerId;

    this.errorMessage = '';

    this.successMessage = '';

    this.tournamentPlayerService.withdrawPlayer(
      this.tournamentId,
      playerId
    ).subscribe({

      next: (response: TournamentPlayer) => {

        this.upsertTournamentPlayer(response);

        this.updateAvailablePlayers();

        this.successMessage =
          'Player withdrawn successfully from the tournament.';

        this.processingPlayerId = null;
      },

      error: (error) => {

        console.error(
          'Error withdrawing tournament player:',
          error
        );

        this.errorMessage =
          error.error?.message ||
          'Unable to withdraw player. Please try again.';

        this.processingPlayerId = null;
      }

    });
  }

  // =====================================
  // Re-register Withdrawn Player
  // =====================================

  reRegisterPlayer(playerId: string): void {

    if (
      !this.tournamentId ||
      !playerId ||
      !this.isRegistrationOpen ||
      this.isLoading ||
      this.isRegistering ||
      this.processingPlayerId !== null
    ) {
      return;
    }

    const tournamentPlayer = this.tournamentPlayers.find(
      player => player.playerId === playerId
    );

    if (
      !tournamentPlayer ||
      tournamentPlayer.status !== TournamentPlayerStatus.WITHDRAWN
    ) {
      return;
    }

    const request: TournamentPlayerCreateRequest = {
      tournamentId: this.tournamentId,
      playerId
    };

    this.processingPlayerId = playerId;

    this.errorMessage = '';

    this.successMessage = '';

    this.tournamentPlayerService.registerPlayer(request)
      .subscribe({

        next: (response: TournamentPlayer) => {

          this.upsertTournamentPlayer(response);

          this.updateAvailablePlayers();

          this.successMessage =
            'Player re-registered successfully for the tournament.';

          this.processingPlayerId = null;
        },

        error: (error) => {

          console.error(
            'Error re-registering tournament player:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Unable to re-register player. Please try again.';

          this.processingPlayerId = null;
        }

      });
  }

  // =====================================
  // Add or Update Tournament Player
  // =====================================

  private upsertTournamentPlayer(
    updatedPlayer: TournamentPlayer
  ): void {

    const existingIndex = this.tournamentPlayers.findIndex(
      player => player.id === updatedPlayer.id
    );

    if (existingIndex >= 0) {

      this.tournamentPlayers = this.tournamentPlayers.map(
        player =>
          player.id === updatedPlayer.id
            ? updatedPlayer
            : player
      );

    } else {

      this.tournamentPlayers = [
        ...this.tournamentPlayers,
        updatedPlayer
      ];
    }
  }

  // =====================================
  // Get Player Details
  // =====================================

  getPlayerById(playerId: string): Player | undefined {

    return this.allPlayers.find(
      player => player.id === playerId
    );
  }

  // =====================================
  // Get Selected Players Count
  // =====================================

  get selectedPlayersCount(): number {

    return this.tournamentPlayers.filter(
      player =>
        player.status === TournamentPlayerStatus.SELECTED
    ).length;
  }

  // =====================================
  // Get Withdrawn Players Count
  // =====================================

  get withdrawnPlayersCount(): number {

    return this.tournamentPlayers.filter(
      player =>
        player.status === TournamentPlayerStatus.WITHDRAWN
    ).length;
  }

}
