
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { TournamentService } from '../../../core/services/tournament';
import { Tournament } from '../../../core/models/tournament/tournament.model';

// =====================================
// Tournament Lifecycle Actions
// =====================================

type TournamentAction =
  | 'open-registration'
  | 'close-registration'
  | 'prepare-auction';

@Component({
  selector: 'app-tournament-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tournament-details.html',
  styleUrl: './tournament-details.scss'
})
export class TournamentDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private tournamentService = inject(TournamentService);

  tournament: Tournament | null = null;
  tournamentId = '';

  isLoading = false;

  activeAction: TournamentAction | null = null;

  errorMessage = '';

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

    this.loadTournament();
  }

  // =====================================
  // Loading State Getters
  // =====================================

  get isOpeningRegistration(): boolean {
    return this.activeAction === 'open-registration';
  }

  get isClosingRegistration(): boolean {
    return this.activeAction === 'close-registration';
  }

  get isPreparingAuction(): boolean {
    return this.activeAction === 'prepare-auction';
  }

  // =====================================
  // Load Tournament Details
  // =====================================

  loadTournament(): void {

    if (
      !this.tournamentId ||
      this.isLoading ||
      this.activeAction
    ) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.tournamentService
      .getTournamentById(this.tournamentId)
      .subscribe({

        next: (response: Tournament) => {
          this.tournament = response;
          this.isLoading = false;
        },

        error: (error) => {

          console.error(
            'Error loading tournament details:',
            error
          );

          this.tournament = null;

          this.errorMessage =
            error.error?.message ||
            'Unable to load tournament details. Please try again.';

          this.isLoading = false;
        }

      });
  }

  // =====================================
  // Open Tournament Registration
  // =====================================

  openRegistration(): void {

    if (!this.canExecuteAction('DRAFT')) {
      return;
    }

    const tournament = this.tournament!;

    const confirmed = window.confirm(
      `Are you sure you want to open registration for "${tournament.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.activeAction = 'open-registration';
    this.errorMessage = '';

    this.tournamentService
      .openRegistration(tournament.id)
      .subscribe({

        next: (response: Tournament) => {
          this.tournament = response;
          this.activeAction = null;
        },

        error: (error) => {
          this.handleActionError(error, 'open registration');
        }

      });
  }

  // =====================================
  // Close Tournament Registration
  // =====================================

  closeRegistration(): void {

    if (!this.canExecuteAction('REGISTRATION_OPEN')) {
      return;
    }

    const tournament = this.tournament!;

    const confirmed = window.confirm(
      `Are you sure you want to close registration for "${tournament.name}"?\n\n` +
      'New registrations will no longer be accepted.'
    );

    if (!confirmed) {
      return;
    }

    this.activeAction = 'close-registration';
    this.errorMessage = '';

    this.tournamentService
      .closeRegistration(tournament.id)
      .subscribe({

        next: (response: Tournament) => {
          this.tournament = response;
          this.activeAction = null;
        },

        error: (error) => {
          this.handleActionError(error, 'close registration');
        }

      });
  }

  // =====================================
  // Prepare Tournament For Auction
  // =====================================

  prepareAuction(): void {

    if (!this.canExecuteAction('REGISTRATION_CLOSED')) {
      return;
    }

    const tournament = this.tournament!;

    const confirmed = window.confirm(
      `Are you sure you want to prepare "${tournament.name}" for auction?\n\n` +
      'The tournament status will change to AUCTION_PENDING.'
    );

    if (!confirmed) {
      return;
    }

    this.activeAction = 'prepare-auction';
    this.errorMessage = '';

    this.tournamentService
      .prepareAuction(tournament.id)
      .subscribe({

        next: (response: Tournament) => {
          this.tournament = response;
          this.activeAction = null;
        },

        error: (error) => {
          this.handleActionError(error, 'prepare auction');
        }

      });
  }

  // =====================================
  // Validate Tournament Lifecycle Action
  // =====================================

  private canExecuteAction(
    expectedStatus: Tournament['status']
  ): boolean {

    if (
      !this.tournament ||
      this.isLoading ||
      this.activeAction
    ) {
      return false;
    }

    if (this.tournament.status !== expectedStatus) {

      this.errorMessage =
        `Only ${expectedStatus} tournaments support this action.`;

      return false;
    }

    return true;
  }

  // =====================================
  // Handle API Errors
  // =====================================

  private handleActionError(
    error: any,
    action: string
  ): void {

    console.error(
      `Error performing tournament action '${action}':`,
      error
    );

    this.errorMessage =
      error.error?.message ||
      `Unable to ${action}. Please try again.`;

    this.activeAction = null;
  }

}
