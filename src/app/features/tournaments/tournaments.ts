
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

import { SecureImage } from '../../shared/components/secure-image/secure-image';

import { TournamentService } from '../../core/services/tournament';

import { Tournament } from '../../core/models/tournament/tournament.model';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [
    PageHeaderComponent,
    RouterLink,
    SecureImage
  ],
  templateUrl: './tournaments.html',
  styleUrl: './tournaments.scss'
})
export class Tournaments implements OnInit {

  private readonly tournamentService = inject(TournamentService);

  // =====================================
  // Tournament List State
  // =====================================

  tournaments: Tournament[] = [];

  selectedTournamentId = '';

  showDeleteConfirmation = false;

  isDeleting = false;

  isLoading = false;

  errorMessage = '';

  // =====================================
  // Component Initialization
  // =====================================

  ngOnInit(): void {

    this.loadTournaments();

  }

  // =====================================
  // Load All Tournaments
  // =====================================

  loadTournaments(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.tournamentService.getAllTournaments().subscribe({

      next: (response) => {

        this.tournaments = response;

        this.isLoading = false;

      },

      error: (error) => {

        console.error(
          'Error loading tournaments:',
          error
        );

        this.errorMessage =
          'Unable to load tournaments. Please try again.';

        this.isLoading = false;

      }

    });

  }

  // =====================================
  // Open Delete Confirmation
  // =====================================

  confirmDelete(tournamentId: string): void {

    this.selectedTournamentId = tournamentId;

    this.showDeleteConfirmation = true;

  }

  // =====================================
  // Delete Tournament
  // =====================================

  deleteTournament(): void {

    if (!this.selectedTournamentId || this.isDeleting) {

      return;

    }

    this.isDeleting = true;

    this.errorMessage = '';

    this.tournamentService.deleteTournament(
      this.selectedTournamentId
    ).subscribe({

      next: () => {

        this.isDeleting = false;

        this.showDeleteConfirmation = false;

        this.selectedTournamentId = '';

        this.loadTournaments();

      },

      error: (error) => {

        console.error(
          'Error deleting tournament:',
          error
        );

        this.errorMessage =
          error.error?.message ??
          'Unable to delete tournament. Please try again.';

        this.isDeleting = false;

        this.showDeleteConfirmation = false;

        this.selectedTournamentId = '';

      }

    });

  }

  // =====================================
  // Cancel Delete Confirmation
  // =====================================

  cancelDelete(): void {

    this.showDeleteConfirmation = false;

    this.selectedTournamentId = '';

  }

}
