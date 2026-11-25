
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { DatePipe } from '@angular/common';

import { finalize } from 'rxjs';

import { TeamService } from '../../../core/services/team';

import { Team } from '../../../core/models/team/team.model';

import { SecureImage } from '../../../shared/components/secure-image/secure-image';

@Component({
  selector: 'app-team-details',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    SecureImage
  ],
  templateUrl: './team-details.html',
  styleUrl: './team-details.scss'
})
export class TeamDetails implements OnInit {

  // =====================================
  // Dependencies
  // =====================================

  private readonly teamService = inject(TeamService);

  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);

  // =====================================
  // Component State
  // =====================================

  teamId = '';

  team: Team | null = null;

  isLoading = false;

  isDeleting = false;

  errorMessage = '';

  // =====================================
  // Component Initialization
  // =====================================

  ngOnInit(): void {

    this.teamId =
      this.activatedRoute.snapshot.paramMap.get('id') ?? '';

    if (!this.teamId) {

      this.errorMessage = 'Invalid team ID.';

      return;

    }

    this.loadTeamDetails();

  }

  // =====================================
  // Computed Component State
  // =====================================

  get isBusy(): boolean {

    return this.isLoading ||
           this.isDeleting;

  }

  get hasLogo(): boolean {

    return !!this.team?.logoUrl;

  }

  // =====================================
  // Load Team Details
  // =====================================

  loadTeamDetails(): void {

    if (
      !this.teamId ||
      this.isBusy
    ) {

      return;

    }

    this.isLoading = true;

    this.errorMessage = '';

    this.team = null;

    this.teamService.getTeamById(this.teamId)
      .pipe(

        finalize(() => {

          this.isLoading = false;

          this.cdr.markForCheck();

        })

      )
      .subscribe({

        next: (response: Team) => {

          this.team = response;

        },

        error: (error) => {

          console.error(
            'Error loading team details:',
            error
          );

          this.errorMessage =
            error.error?.message ??
            'Unable to load team details. Please try again.';

        }

      });

  }

  // =====================================
  // Delete Team
  // =====================================

  deleteTeam(): void {

    if (
      !this.team ||
      this.isBusy
    ) {

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

    this.teamService.deleteTeam(teamId)
      .pipe(

        finalize(() => {

          this.isDeleting = false;

          this.cdr.markForCheck();

        })

      )
      .subscribe({

        next: () => {

          // Navigate to Teams List after deletion

          this.router.navigate(['/teams']);

        },

        error: (error) => {

          console.error(
            'Error deleting team:',
            error
          );

          this.errorMessage =
            error.error?.message ??
            'Unable to delete team. Please try again.';

        }

      });

  }

  // =====================================
  // Back Navigation
  // =====================================

  goBack(): void {

    if (this.isDeleting) {

      return;

    }

    this.router.navigate(['/teams']);

  }

}
