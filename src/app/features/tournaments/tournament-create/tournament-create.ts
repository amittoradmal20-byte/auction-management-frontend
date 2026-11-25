
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  Observable,
  of,
  switchMap,
  finalize
} from 'rxjs';

import { TournamentService } from '../../../core/services/tournament';

import { Tournament } from '../../../core/models/tournament/tournament.model';

import { TournamentCreateRequest } from '../../../core/models/tournament/tournament-create-request.model';

import { TournamentUpdateRequest } from '../../../core/models/tournament/tournament-update-request.model';

import { LogoUpload } from '../../../shared/components/logo-upload/logo-upload';

// =====================================
// Tournament Date Range Validator
// =====================================

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
    RouterLink,
    LogoUpload
  ],
  templateUrl: './tournament-create.html',
  styleUrl: './tournament-create.scss'
})
export class TournamentCreate implements OnInit {

  private readonly fb = inject(FormBuilder);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly tournamentService = inject(TournamentService);

  private readonly cdr = inject(ChangeDetectorRef);

  // =====================================
  // Tournament State
  // =====================================

  tournamentId = '';

  isEditMode = false;

  isSubmitting = false;

  isLoadingTournament = false;

  isTournamentLoaded = false;

  errorMessage = '';

  successMessage = '';

  // =====================================
  // Logo Management State
  // =====================================

  existingLogoPath: string | null = null;

  selectedLogoFile: File | null = null;

  isLogoValid = true;

  isUploadingLogo = false;

  isRemovingLogo = false;

  // =====================================
  // Partial Submission State
  // =====================================

  savedTournament: Tournament | null = null;

  isLogoUploadFailed = false;

  // =====================================
  // Tournament Form
  // =====================================

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

  // =====================================
  // Component Initialization
  // =====================================

  ngOnInit(): void {

    this.tournamentId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (this.tournamentId) {

      this.isEditMode = true;

      this.loadTournamentDetails();

    } else {

      this.isTournamentLoaded = true;
    }
  }

  // =====================================
  // Component State Getters
  // =====================================

  get isBusy(): boolean {

    return (
      this.isSubmitting ||
      this.isLoadingTournament ||
      this.isUploadingLogo ||
      this.isRemovingLogo
    );
  }

  get isFormLocked(): boolean {

    return this.savedTournament !== null;
  }

  get canSubmit(): boolean {

    return (
      this.isTournamentLoaded &&
      this.tournamentForm.valid &&
      this.isLogoValid &&
      !this.isBusy &&
      !this.isFormLocked
    );
  }

  get canRetryLogoUpload(): boolean {

    return (
      this.savedTournament !== null &&
      this.isLogoUploadFailed &&
      this.selectedLogoFile !== null &&
      this.isLogoValid &&
      !this.isBusy
    );
  }

  get submitButtonLabel(): string {

    if (this.isUploadingLogo) {
      return 'Uploading Logo...';
    }

    if (this.isSubmitting) {

      return this.isEditMode
        ? 'Updating...'
        : 'Creating...';
    }

    return this.isEditMode
      ? 'Update Tournament'
      : 'Create Tournament';
  }

  // =====================================
  // Load Tournament Details
  // =====================================

  loadTournamentDetails(): void {

    if (!this.tournamentId || this.isBusy) {
      return;
    }

    this.isLoadingTournament = true;

    this.isTournamentLoaded = false;

    this.errorMessage = '';

    this.tournamentService
      .getTournamentById(this.tournamentId)
      .pipe(

        finalize(() => {

          this.isLoadingTournament = false;

          this.cdr.markForCheck();

        })

      )
      .subscribe({

        next: (response: Tournament) => {

          this.tournamentForm.patchValue({

            name: response.name,

            description: response.description ?? '',

            startDate: response.startDate,

            endDate: response.endDate,

            maxTeams: response.maxTeams

          });

          this.existingLogoPath =
            response.logoUrl ?? null;

          this.isTournamentLoaded = true;

        },

        error: (error) => {

          console.error(
            'Error loading tournament:',
            error
          );

          this.errorMessage =
            error.error?.message ??
            'Unable to load tournament details. Please try again.';

        }

      });
  }

  // =====================================
  // Handle Logo Selection
  // =====================================

  onLogoSelected(file: File | null): void {

    this.selectedLogoFile = file;
  }

  // =====================================
  // Handle Logo Validation State
  // =====================================

  onLogoValidationChange(isValid: boolean): void {

    this.isLogoValid = isValid;
  }

  // =====================================
  // Create Tournament
  // =====================================

  createTournament(): void {

    if (this.isEditMode || !this.canSubmit) {

      this.tournamentForm.markAllAsTouched();

      return;
    }

    const request: TournamentCreateRequest = {

      name: this.tournamentForm.value.name!.trim(),

      description:
        this.tournamentForm.value.description ?? '',

      startDate:
        this.tournamentForm.value.startDate!,

      endDate:
        this.tournamentForm.value.endDate!,

      maxTeams:
        this.tournamentForm.value.maxTeams!

    };

    this.submitTournament(
      this.tournamentService.createTournament(request)
    );
  }

  // =====================================
  // Update Tournament
  // =====================================

  updateTournament(): void {

    if (
      !this.isEditMode ||
      !this.tournamentId ||
      !this.canSubmit
    ) {

      this.tournamentForm.markAllAsTouched();

      return;
    }

    const request: TournamentUpdateRequest = {

      name: this.tournamentForm.value.name!.trim(),

      description:
        this.tournamentForm.value.description ?? '',

      startDate:
        this.tournamentForm.value.startDate!,

      endDate:
        this.tournamentForm.value.endDate!,

      maxTeams:
        this.tournamentForm.value.maxTeams!

    };

    this.submitTournament(

      this.tournamentService.updateTournament(
        this.tournamentId,
        request
      )

    );
  }

  // =====================================
  // Common Tournament Submission
  // =====================================

  private submitTournament(
    request$: Observable<Tournament>
  ): void {

    this.isSubmitting = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.isLogoUploadFailed = false;

    this.savedTournament = null;

    const logoFile = this.selectedLogoFile;

    // Prevent form changes during submission.
    this.tournamentForm.disable();

    request$
      .pipe(

        switchMap((response: Tournament) => {

          // Preserve the successfully saved entity.
          this.savedTournament = response;

          this.tournamentId = response.id;

          this.existingLogoPath =
            response.logoUrl ?? null;

          // No logo selected.
          if (!logoFile) {

            return of(response);
          }

          // Upload logo using the saved tournament ID.
          this.isUploadingLogo = true;

          this.cdr.markForCheck();

          return this.tournamentService.uploadLogo(
            response.id,
            logoFile
          );

        }),

        finalize(() => {

          this.isSubmitting = false;

          this.isUploadingLogo = false;

          // Allow form changes only if the entity
          // has not already been saved.
          if (!this.savedTournament) {

            this.tournamentForm.enable();
          }

          this.cdr.markForCheck();

        })

      )
      .subscribe({

        next: (response: Tournament) => {

          this.handleSubmissionSuccess(response);

        },

        error: (error) => {

          this.handleSubmissionError(error);

        }

      });
  }

  // =====================================
  // Handle Successful Submission
  // =====================================

  private handleSubmissionSuccess(
    response: Tournament
  ): void {

    this.savedTournament = response;

    this.existingLogoPath =
      response.logoUrl ?? null;

    this.selectedLogoFile = null;

    this.isLogoUploadFailed = false;

    this.errorMessage = '';

    this.successMessage = this.isEditMode

      ? 'Tournament updated successfully.'

      : 'Tournament created successfully.';

    this.navigateToTournamentDetails(response.id);
  }

  // =====================================
  // Handle Submission Failure
  // =====================================

  private handleSubmissionError(error: any): void {

    console.error(
      'Error saving tournament or logo:',
      error
    );

    // Tournament saved, but logo upload failed.
    if (this.savedTournament) {

      this.isLogoUploadFailed = true;

      this.successMessage = this.isEditMode

        ? 'Tournament information updated successfully.'

        : 'Tournament created successfully.';

      const logoError =
        error.error?.message ??
        'Unable to upload the selected logo.';

      this.errorMessage =
        `${logoError} Please retry the logo upload.`;

      return;
    }

    // Tournament creation or update failed.
    this.errorMessage =
      error.error?.message ??
      (
        this.isEditMode

          ? 'Unable to update tournament. Please try again.'

          : 'Unable to create tournament. Please try again.'
      );
  }

  // =====================================
  // Retry Failed Logo Upload
  // =====================================

  retryLogoUpload(): void {

    if (!this.canRetryLogoUpload) {
      return;
    }

    const tournamentId = this.savedTournament!.id;

    const logoFile = this.selectedLogoFile!;

    this.isSubmitting = true;

    this.isUploadingLogo = true;

    this.errorMessage = '';

    this.tournamentService
      .uploadLogo(tournamentId, logoFile)
      .pipe(

        finalize(() => {

          this.isSubmitting = false;

          this.isUploadingLogo = false;

          this.cdr.markForCheck();

        })

      )
      .subscribe({

        next: (response: Tournament) => {

          this.handleSubmissionSuccess(response);

        },

        error: (error) => {

          this.handleSubmissionError(error);

        }

      });
  }

  // =====================================
  // Continue Without Uploading New Logo
  // =====================================

  continueWithoutLogo(): void {

    if (
      !this.savedTournament ||
      !this.isLogoUploadFailed ||
      this.isBusy
    ) {
      return;
    }

    const confirmed = window.confirm(

      'The tournament information has already been saved.\n\n' +

      'The selected logo has not been uploaded.\n\n' +

      'Do you want to continue without uploading the new logo?'

    );

    if (!confirmed) {
      return;
    }

    this.navigateToTournamentDetails(
      this.savedTournament.id
    );
  }

  // =====================================
  // Remove Existing Tournament Logo
  // =====================================

  removeExistingLogo(): void {

    if (
      !this.isEditMode ||
      !this.isTournamentLoaded ||
      !this.tournamentId ||
      !this.existingLogoPath ||
      this.selectedLogoFile ||
      !this.isLogoValid ||
      this.isBusy ||
      this.isFormLocked
    ) {
      return;
    }

    const confirmed = window.confirm(

      'Are you sure you want to remove the existing tournament logo?\n\n' +

      'The logo will be removed immediately.'

    );

    if (!confirmed) {
      return;
    }

    this.isRemovingLogo = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.tournamentService
      .deleteLogo(this.tournamentId)
      .pipe(

        finalize(() => {

          this.isRemovingLogo = false;

          this.cdr.markForCheck();

        })

      )
      .subscribe({

        next: (response: Tournament) => {

          this.existingLogoPath =
            response.logoUrl ?? null;

          this.successMessage =
            'Tournament logo removed successfully.';

        },

        error: (error) => {

          console.error(
            'Error removing tournament logo:',
            error
          );

          this.errorMessage =
            error.error?.message ??
            'Unable to remove tournament logo. Please try again.';

        }

      });
  }

  // =====================================
  // Navigate To Tournament Details
  // =====================================

  private navigateToTournamentDetails(
    tournamentId: string
  ): void {

    this.router.navigate([
      '/tournaments',
      tournamentId
    ]);
  }

}
