
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { TeamService } from '../../../core/services/team';

import { TeamCreateRequest } from '../../../core/models/team/team-create-request.model';

@Component({
  selector: 'app-team-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './team-create.html',
  styleUrl: './team-create.scss'
})
export class TeamCreate {

  private fb = inject(FormBuilder);

  private teamService = inject(TeamService);

  private router = inject(Router);

  // =====================================
  // Component State
  // =====================================

  isSubmitting = false;

  errorMessage = '';

  // =====================================
  // Create Team Form
  // =====================================

  teamForm = this.fb.nonNullable.group({

    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    shortName: [
      '',
      [
        Validators.required,
        Validators.maxLength(20)
      ]
    ],

    logoUrl: [
      '',
      [
        Validators.maxLength(500)
      ]
    ]

  });

  // =====================================
  // Create Team
  // =====================================

  createTeam(): void {

    if (this.teamForm.invalid || this.isSubmitting) {

      this.teamForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;

    this.errorMessage = '';

    const formValue = this.teamForm.getRawValue();

    const request: TeamCreateRequest = {

      name: formValue.name.trim(),

      shortName: formValue.shortName.trim(),

      logoUrl: formValue.logoUrl.trim() || null

    };

    // Validate trimmed required values
    if (!request.name || !request.shortName) {

      this.errorMessage =
        'Team name and short name are required.';

      this.isSubmitting = false;

      return;
    }

    this.teamService.createTeam(request).subscribe({

      next: () => {

        this.isSubmitting = false;

        this.router.navigate(['/teams']);

      },

      error: (error) => {

        console.error('Error creating team:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to create team. Please try again.';

        this.isSubmitting = false;

      }

    });

  }

}
