
import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { TeamService } from '../../../core/services/team';
import { TeamUpdateRequest } from '../../../core/models/team/team-update-request.model';

@Component({
  selector: 'app-team-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './team-edit.html',
  styleUrl: './team-edit.scss'
})
export class TeamEdit implements OnInit {

  private fb = inject(FormBuilder);
  private teamService = inject(TeamService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  teamId = '';

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  teamForm = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.maxLength(100)
    ]],
    shortName: ['', [
      Validators.required,
      Validators.maxLength(20)
    ]],
    logoUrl: ['', [
      Validators.maxLength(500)
    ]]
  });

  ngOnInit(): void {

    const id = this.activatedRoute.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Invalid team ID.';
      return;
    }

    this.teamId = id;
    this.loadTeamDetails();
  }

  loadTeamDetails(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.teamService.getTeamById(this.teamId).subscribe({

      next: (team) => {

        this.teamForm.patchValue({
          name: team.name,
          shortName: team.shortName,
          logoUrl: team.logoUrl ?? ''
        });

        this.isLoading = false;
      },

      error: (error) => {

        console.error('Error loading team:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to load team details. Please try again.';

        this.isLoading = false;
      }

    });
  }

  updateTeam(): void {

    if (
      this.teamForm.invalid ||
      this.isLoading ||
      this.isSubmitting ||
      !this.teamId
    ) {
      this.teamForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.teamForm.getRawValue();

    const request: TeamUpdateRequest = {
      name: formValue.name.trim(),
      shortName: formValue.shortName.trim(),
      logoUrl: formValue.logoUrl.trim() || null
    };

    if (!request.name || !request.shortName) {
      this.errorMessage = 'Team name and short name are required.';
      this.isSubmitting = false;
      return;
    }

    this.teamService.updateTeam(this.teamId, request).subscribe({

      next: () => {

        this.isSubmitting = false;

        this.router.navigate([
          '/teams',
          this.teamId
        ]);
      },

      error: (error) => {

        console.error('Error updating team:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to update team. Please try again.';

        this.isSubmitting = false;
      }

    });
  }

}
