
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TeamService } from '../../../core/services/team';
import { Team } from '../../../core/models/team/team.model';

@Component({
  selector: 'app-team-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './team-details.html',
  styleUrl: './team-details.scss'
})
export class TeamDetails implements OnInit {

  private teamService = inject(TeamService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  team: Team | null = null;

  isLoading = false;
  isDeleting = false;

  errorMessage = '';

  ngOnInit(): void {
    this.loadTeamDetails();
  }

  // =====================================
  // Load Team Details
  // =====================================

  loadTeamDetails(): void {

    const teamId = this.activatedRoute.snapshot.paramMap.get('id');

    if (!teamId) {
      this.errorMessage = 'Invalid team ID.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.teamService.getTeamById(teamId).subscribe({

      next: (response: Team) => {

        this.team = response;
        this.isLoading = false;

      },

      error: (error) => {

        console.error('Error loading team details:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to load team details. Please try again.';

        this.isLoading = false;

      }

    });
  }

  // =====================================
  // Delete Team
  // =====================================

  deleteTeam(): void {

    if (!this.team || this.isDeleting) {
      return;
    }

    const teamId = this.team.id;
    const teamName = this.team.name;

    // Confirm before deleting
    const confirmed = window.confirm(
      `Are you sure you want to delete the team "${teamName}"?\n\n` +
      'This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;
    this.errorMessage = '';

    this.teamService.deleteTeam(teamId).subscribe({

      next: () => {

        this.isDeleting = false;

        // Navigate to Teams List after deletion
        this.router.navigate(['/teams']);

      },

      error: (error) => {

        console.error('Error deleting team:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to delete team. Please try again.';

        this.isDeleting = false;

      }

    });
  }

  // =====================================
  // Back Navigation
  // =====================================

  goBack(): void {
    this.router.navigate(['/teams']);
  }

}
