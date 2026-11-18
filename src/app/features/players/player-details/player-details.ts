
import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PlayerService } from '../../../core/services/player';
import { Player } from '../../../core/models/player/player.model';

@Component({
  selector: 'app-player-details',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './player-details.html',
  styleUrl: './player-details.scss'
})
export class PlayerDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private playerService = inject(PlayerService);

  player: Player | null = null;
  playerId = '';

  isLoading = false;
  isUpdatingStatus = false;

  errorMessage = '';
  statusErrorMessage = '';
  statusSuccessMessage = '';

  ngOnInit(): void {

    this.playerId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.playerId) {
      this.errorMessage = 'Invalid player ID.';
      return;
    }

    this.loadPlayer();
  }

  loadPlayer(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.playerService.getPlayerById(this.playerId).subscribe({
      next: (response) => {

        this.player = response;
        this.isLoading = false;

      },
      error: (error) => {

        console.error('Error loading player details:', error);

        this.errorMessage =
          'Unable to load player details. Please try again.';

        this.isLoading = false;
      }
    });
  }

  togglePlayerStatus(): void {

    if (!this.player || this.isUpdatingStatus) {
      return;
    }

    const isActive = this.player.status === 'ACTIVE';

    const action = isActive ? 'deactivate' : 'activate';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${this.player.displayName}?`
    );

    if (!confirmed) {
      return;
    }

    this.isUpdatingStatus = true;
    this.statusErrorMessage = '';
    this.statusSuccessMessage = '';

    const request$ = isActive
      ? this.playerService.deactivatePlayer(this.playerId)
      : this.playerService.activatePlayer(this.playerId);

    request$.subscribe({
      next: () => {

        this.isUpdatingStatus = false;

        this.statusSuccessMessage =
          `Player ${isActive ? 'deactivated' : 'activated'} successfully.`;

        this.loadPlayer();
      },
      error: (error) => {

        console.error('Error updating player status:', error);

        this.statusErrorMessage =
          error.error?.message ||
          'Unable to update player status. Please try again.';

        this.isUpdatingStatus = false;
      }
    });
  }

}
