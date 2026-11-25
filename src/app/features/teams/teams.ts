
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { finalize } from 'rxjs';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

import { SecureImage } from '../../shared/components/secure-image/secure-image';

import { TeamService } from '../../core/services/team';

import { Team } from '../../core/models/team/team.model';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    PageHeaderComponent,
    RouterLink,
    SecureImage
  ],
  templateUrl: './teams.html',
  styleUrl: './teams.scss'
})
export class Teams implements OnInit {

  // =====================================
  // Dependencies
  // =====================================

  private readonly teamService = inject(TeamService);

  private readonly cdr = inject(ChangeDetectorRef);

  // =====================================
  // Component State
  // =====================================

  teams: Team[] = [];

  isLoading = false;

  errorMessage = '';

  // =====================================
  // Component Initialization
  // =====================================

  ngOnInit(): void {

    this.loadTeams();

  }

  // =====================================
  // Load All Teams
  // =====================================

  loadTeams(): void {

    // Prevent duplicate API requests

    if (this.isLoading) {

      return;

    }

    this.isLoading = true;

    this.errorMessage = '';

    this.teamService.getAllTeams()
      .pipe(

        finalize(() => {

          this.isLoading = false;

          this.cdr.markForCheck();

        })

      )
      .subscribe({

        next: (response: Team[]) => {

          this.teams = response;

        },

        error: (error) => {

          console.error(
            'Error loading teams:',
            error
          );

          this.teams = [];

          this.errorMessage =
            error.error?.message ??
            'Unable to load teams. Please try again.';

        }

      });

  }

}
