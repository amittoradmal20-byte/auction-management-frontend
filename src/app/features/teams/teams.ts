
import { Component, OnInit, inject } from '@angular/core';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

import { TeamService } from '../../core/services/team';
import { Team } from '../../core/models/team/team.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink],
  templateUrl: './teams.html',
  styleUrl: './teams.scss'
})
export class Teams implements OnInit {

  private teamService = inject(TeamService);

  teams: Team[] = [];

  isLoading = false;

  errorMessage = '';

  ngOnInit(): void {
    this.loadTeams();
  }

  // =====================================
  // Load All Teams
  // =====================================

  loadTeams(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.teamService.getAllTeams().subscribe({
      next: (response) => {

        this.teams = response;
        this.isLoading = false;

      },
      error: (error) => {

        console.error('Error loading teams:', error);

        this.errorMessage =
          'Unable to load teams. Please try again.';

        this.isLoading = false;

      }
    });
  }

}
