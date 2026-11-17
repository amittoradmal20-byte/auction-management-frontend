
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TournamentService } from '../../../core/services/tournament';
import { Tournament } from '../../../core/models/tournament/tournament.model';
import { TournamentCreateRequest } from '../../../core/models/tournament/tournament-create-request.model';
import { TournamentUpdateRequest } from '../../../core/models/tournament/tournament-update-request.model';

const dateRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;

  if (!startDate || !endDate) {
    return null;
  }

  return endDate < startDate
    ? { invalidDateRange: true }
    : null;
};

@Component({
  selector: 'app-tournament-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './tournament-create.html',
  styleUrl: './tournament-create.scss'
})
export class TournamentCreate implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentService = inject(TournamentService);

  tournamentId = '';
  isEditMode = false;

  isSubmitting = false;
  isLoadingTournament = false;
  errorMessage = '';

  tournamentForm = this.fb.group({

    name: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(150)
    ]],

    description: ['', [
      Validators.maxLength(500)
    ]],

    startDate: ['', Validators.required],

    endDate: ['', Validators.required],

    maxTeams: [8, [
      Validators.required,
      Validators.min(2)
    ]]

  }, {
    validators: dateRangeValidator
  });

  ngOnInit(): void {

    this.tournamentId = this.route.snapshot.paramMap.get('id') ?? '';

    if (this.tournamentId) {
      this.isEditMode = true;
      this.loadTournamentDetails();
    }

  }

  loadTournamentDetails(): void {

    this.isLoadingTournament = true;
    this.errorMessage = '';

    this.tournamentService.getTournamentById(this.tournamentId).subscribe({

      next: (response: Tournament) => {

        this.tournamentForm.patchValue({

          name: response.name,
          description: response.description ?? '',
          startDate: response.startDate,
          endDate: response.endDate,
          maxTeams: response.maxTeams

        });

        this.isLoadingTournament = false;

      },

      error: (error) => {

        console.error('Error loading tournament:', error);

        this.errorMessage =
          'Unable to load tournament details. Please try again.';

        this.isLoadingTournament = false;

      }

    });

  }

  createTournament(): void {

    if (this.tournamentForm.invalid || this.isSubmitting) {
      this.tournamentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const request: TournamentCreateRequest = {
      name: this.tournamentForm.value.name!.trim(),
      description: this.tournamentForm.value.description ?? '',
      startDate: this.tournamentForm.value.startDate!,
      endDate: this.tournamentForm.value.endDate!,
      maxTeams: this.tournamentForm.value.maxTeams!
    };

    this.tournamentService.createTournament(request).subscribe({

      next: () => {

        this.isSubmitting = false;
        this.router.navigate(['/tournaments']);

      },

      error: (error) => {

        console.error('Error creating tournament:', error);

        this.errorMessage =
          error.error?.message ??
          'Unable to create tournament. Please try again.';

        this.isSubmitting = false;

      }

    });

  }

  updateTournament(): void {

  if (this.tournamentForm.invalid || this.isSubmitting) {
    this.tournamentForm.markAllAsTouched();
    return;
  }

  this.isSubmitting = true;
  this.errorMessage = '';

  const request: TournamentUpdateRequest = {
    name: this.tournamentForm.value.name!.trim(),
    description: this.tournamentForm.value.description ?? '',
    startDate: this.tournamentForm.value.startDate!,
    endDate: this.tournamentForm.value.endDate!,
    maxTeams: this.tournamentForm.value.maxTeams!
  };

  this.tournamentService.updateTournament(
    this.tournamentId,
    request
  ).subscribe({

    next: () => {

      this.isSubmitting = false;

      this.router.navigate(['/tournaments']);

    },

    error: (error) => {

      console.error('Error updating tournament:', error);

      this.errorMessage =
        error.error?.message ??
        'Unable to update tournament. Please try again.';

      this.isSubmitting = false;

    }

  });

}

}
