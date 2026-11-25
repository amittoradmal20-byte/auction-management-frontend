
import {
  Component,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  of,
  switchMap,
  finalize
} from 'rxjs';

import { TeamService } from '../../../core/services/team';

import { Team } from '../../../core/models/team/team.model';

import { TeamCreateRequest } from '../../../core/models/team/team-create-request.model';

import { LogoUpload } from '../../../shared/components/logo-upload/logo-upload';

@Component({
  selector: 'app-team-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LogoUpload
  ],
  templateUrl: './team-create.html',
  styleUrl: './team-create.scss'
})
export class TeamCreate {

  // =====================================
  // Dependencies
  // =====================================

  private readonly fb = inject(FormBuilder);

  private readonly teamService = inject(TeamService);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);

  // =====================================
  // Component State
  // =====================================

  isSubmitting = false;

  errorMessage = '';

  successMessage = '';

  // =====================================
  // Logo Upload State
  // =====================================

  selectedLogoFile: File | null = null;

  isLogoValid = true;

  isUploadingLogo = false;

  isLogoUploadFailed = false;

  // =====================================
  // Saved Team State
  // =====================================

  savedTeam: Team | null = null;

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
    ]

  });

  // =====================================
  // Computed Component State
  // =====================================

  get isBusy(): boolean {

    return this.isSubmitting ||
           this.isUploadingLogo;

  }

  get isFormLocked(): boolean {

    return this.savedTeam !== null;

  }

  get canSubmit(): boolean {

    return this.teamForm.valid &&
           this.isLogoValid &&
           !this.isBusy &&
           !this.isFormLocked;

  }

  get canRetryLogoUpload(): boolean {

    return this.savedTeam !== null &&
           this.isLogoUploadFailed &&
           this.selectedLogoFile !== null &&
           this.isLogoValid &&
           !this.isBusy;

  }

  get submitButtonLabel(): string {

    if (this.isUploadingLogo) {

      return 'Uploading Logo...';

    }

    if (this.isSubmitting) {

      return 'Creating Team...';

    }

    return 'Create Team';

  }

  // =====================================
  // Handle Logo Selection
  // =====================================

  onLogoSelected(file: File | null): void {

    this.selectedLogoFile = file;

  }

  // =====================================
  // Handle Logo Validation
  // =====================================

  onLogoValidationChange(isValid: boolean): void {

    this.isLogoValid = isValid;

  }

  // =====================================
  // Create Team
  // =====================================

  createTeam(): void {

    if (!this.canSubmit) {

      this.teamForm.markAllAsTouched();

      return;

    }

    this.errorMessage = '';

    this.successMessage = '';

    const formValue = this.teamForm.getRawValue();

    const request: TeamCreateRequest = {

      name: formValue.name.trim(),

      shortName: formValue.shortName.trim()

    };

    // Validate trimmed required values

    if (!request.name || !request.shortName) {

      this.errorMessage =
        'Team name and short name are required.';

      return;

    }

    // Capture selected logo before submission

    const logoFile = this.selectedLogoFile;

    this.isSubmitting = true;

    this.isLogoUploadFailed = false;

    this.savedTeam = null;

    // Prevent changes during submission

    this.teamForm.disable();

    this.teamService.createTeam(request)
      .pipe(

        // =====================================
        // Step 1: Create Team
        // Step 2: Upload Logo
        // =====================================

        switchMap((response: Team) => {

          this.savedTeam = response;

          // Logo is optional

          if (!logoFile) {

            return of(response);

          }

          this.isUploadingLogo = true;

          this.cdr.markForCheck();

          return this.teamService.uploadLogo(
            response.id,
            logoFile
          );

        }),

        // =====================================
        // Reset Submission State
        // =====================================

        finalize(() => {

          this.isSubmitting = false;

          this.isUploadingLogo = false;

          // Enable form only if team creation failed

          if (!this.savedTeam) {

            this.teamForm.enable();

          }

          this.cdr.markForCheck();

        })

      )
      .subscribe({

        next: (response: Team) => {

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
    response: Team
  ): void {

    this.savedTeam = response;

    this.selectedLogoFile = null;

    this.isLogoUploadFailed = false;

    this.errorMessage = '';

    this.successMessage =
      'Team created successfully.';

    this.navigateToTeamDetails(response.id);

  }

  // =====================================
  // Handle Submission Error
  // =====================================

  private handleSubmissionError(error: any): void {

    console.error(
      'Error creating team or uploading logo:',
      error
    );

    // Team created successfully but logo upload failed

    if (this.savedTeam) {

      this.isLogoUploadFailed = true;

      this.successMessage =
        'Team created successfully.';

      const logoError =
        error.error?.message ??
        'Unable to upload the selected team logo.';

      this.errorMessage =
        `${logoError} Please retry the logo upload.`;

      return;

    }

    // Team creation failed

    this.errorMessage =
      error.error?.message ??
      'Unable to create team. Please try again.';

  }

  // =====================================
  // Retry Failed Logo Upload
  // =====================================

  retryLogoUpload(): void {

    if (!this.canRetryLogoUpload) {

      return;

    }

    const teamId = this.savedTeam!.id;

    const logoFile = this.selectedLogoFile!;

    this.isSubmitting = true;

    this.isUploadingLogo = true;

    this.errorMessage = '';

    this.teamService.uploadLogo(
      teamId,
      logoFile
    )
    .pipe(

      finalize(() => {

        this.isSubmitting = false;

        this.isUploadingLogo = false;

        this.cdr.markForCheck();

      })

    )
    .subscribe({

      next: (response: Team) => {

        this.handleSubmissionSuccess(response);

      },

      error: (error) => {

        this.handleSubmissionError(error);

      }

    });

  }

  // =====================================
  // Continue Without Logo
  // =====================================

  continueWithoutLogo(): void {

    if (
      !this.savedTeam ||
      !this.isLogoUploadFailed ||
      this.isBusy
    ) {

      return;

    }

    const confirmed = window.confirm(

      'The team information has already been saved.\n\n' +

      'The selected logo has not been uploaded.\n\n' +

      'Do you want to continue without uploading the logo?'

    );

    if (!confirmed) {

      return;

    }

    this.navigateToTeamDetails(this.savedTeam.id);

  }

  // =====================================
  // Navigate to Team Details
  // =====================================

  private navigateToTeamDetails(teamId: string): void {

    this.router.navigate(['/teams', teamId]);

  }

}
