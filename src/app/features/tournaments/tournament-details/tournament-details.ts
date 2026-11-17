
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { TournamentService } from '../../../core/services/tournament';
import { Tournament } from '../../../core/models/tournament/tournament.model';

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
  errorMessage = '';

  ngOnInit(): void {

    this.tournamentId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.tournamentId) {
      this.errorMessage = 'Invalid tournament ID.';
      return;
    }

    this.loadTournament();
  }

  loadTournament(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.tournamentService.getTournamentById(this.tournamentId).subscribe({

      next: (response) => {
        this.tournament = response;
        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error loading tournament details:', error);

        this.errorMessage = 'Unable to load tournament details. Please try again.';
        this.isLoading = false;
      }

    });
  }

}
