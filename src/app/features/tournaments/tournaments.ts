
import { Component, OnInit, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

import { TournamentService } from '../../core/services/tournament';
import { Tournament } from '../../core/models/tournament/tournament.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink],
  templateUrl: './tournaments.html',
  styleUrl: './tournaments.scss'
})
export class Tournaments implements OnInit {

  private tournamentService = inject(TournamentService);

  tournaments: Tournament[] = [];

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadTournaments();
  }

  loadTournaments(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.tournamentService.getAllTournaments().subscribe({

      next: (response) => {
        this.tournaments = response;
        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error loading tournaments:', error);

        this.errorMessage = 'Unable to load tournaments. Please try again.';
        this.isLoading = false;
      }

    });
  }

}
