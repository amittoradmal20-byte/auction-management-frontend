
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import {
  Router,
  ActivatedRoute,
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

import { TeamUpdateRequest } from '../../../core/models/team/team-update-request.model';

import { LogoUpload } from '../../../shared/components/logo-upload/logo-upload';

@Component({
  selector: 'app-team-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LogoUpload
  ],
  templateUrl: './team-edit.html',
  styleUrl: './team-edit.scss'
})
export class TeamEdit implements OnInit {

  // =====================================
  // Dependencies
  // =====================================

  private readonly fb = inject(FormBuilder);

  private readonly teamService = inject(TeamService);

  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);

  // =====================================
  // Component State
  // =====================================

  teamId = '';

  isLoading = false;

  isTeamLoaded = false;

  isSubmitting = false;

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

  isLogoUploadFailed = false;

  // =====================================
  // Saved Team State
  // =====================================

  savedTeam: Team | null = null;

  // =====================================
  // Edit Team Form
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
  // Component Initialization
  // =====================================

  ngOnInit(): void {

    const id =
      this.activatedRoute.snapshot.paramMap.get('id');

    if (!id) {

      this.errorMessage = 'Invalid team ID.';

      return;

    }

    this.teamId = id;

    this.loadTeamDetails();

  }

  // =====================================
  // Computed Component State
  // =====================================

  get isBusy(): boolean {

    return this.isLoading ||
           this.isSubmitting ||
           this.isUploadingLogo ||
           this.isRemovingLogo;

  }

  get isFormLocked(): boolean {

    return this.savedTeam !== null;

  }

  get canSubmit(): boolean {

    return !!this.teamId &&
           this.isTeamLoaded &&
           this.teamForm.valid &&
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

  get canRemoveExistingLogo(): boolean {

    return !!this.teamId &&
           this.isTeamLoaded &&
           !!this.existingLogoPath &&
           !this.selectedLogoFile &&
           this.isLogoValid &&
           !this.isBusy &&
           !this.isFormLocked;

  }

  get submitButtonLabel(): string {

    if (this.isUploadingLogo) {

      return 'Uploading Logo...';

    }

    if (this.isSubmitting) {

      return 'Updating Team...';

    }

    return 'Update Team';

  }

  // =====================================
  // Load Existing Team Information
  // =====================================

  loadTeamDetails(): void {

    if (
      !this.teamId ||
      this.isBusy ||
      this.isFormLocked
    ) {

      return;

    }

    this.isLoading = true;

    this.isTeamLoaded = false;

    this.errorMessage = '';

    this.successMessage = '';

    this.teamService.getTeamById(this.teamId)
      .pipe(

        finalize(() => {

          this.isLoading = false;

          this.cdr.markForCheck();

        })

      )
      .subscribe({

        next: (team: Team) => {

          this.teamForm.patchValue({

            name: team.name,

            shortName: team.shortName

          });

          this.existingLogoPath =
            team.logoUrl ?? null;

          this.isTeamLoaded = true;

        },

        error: (error) => {

          console.error(
            'Error loading team:',
            error
          );

          this.errorMessage =
            error.error?.message ??
            'Unable to load team details. Please try again.';

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
  // Handle Logo Validation
  // =====================================

  onLogoValidationChange(isValid: boolean): void {

    this.isLogoValid = isValid;

  }

  // =====================================
  // Update Team
  // =====================================

  updateTeam(): void {

    if (!this.canSubmit) {

      this.teamForm.markAllAsTouched();

      return;

    }

    this.errorMessage = '';

    this.successMessage = '';

    const formValue = this.teamForm.getRawValue();

    const request: TeamUpdateRequest = {

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

    this.teamService.updateTeam(
      this.teamId,
      request
    )
    .pipe(

      // =====================================
      // Step 1: Update Team Information
      // Step 2: Upload Logo If Selected
      // =====================================

      switchMap((response: Team) => {

        this.savedTeam = response;

        this.existingLogoPath =
          response.logoUrl ?? null;

        // Preserve existing logo if no new logo selected

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

        // Enable form only if team update failed

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

    this.existingLogoPath =
      response.logoUrl ?? null;

    this.selectedLogoFile = null;

    this.isLogoUploadFailed = false;

    this.errorMessage = '';

    this.successMessage =
      'Team updated successfully.';

    this.navigateToTeamDetails(response.id);

  }

  // =====================================
  // Handle Submission Error
  // =====================================

  private handleSubmissionError(error: any): void {

    console.error(
      'Error updating team or uploading logo:',
      error
    );

    // Team information updated but logo upload failed

    if (this.savedTeam) {

      this.isLogoUploadFailed = true;

      this.successMessage =
        'Team information updated successfully.';

      const logoError =
        error.error?.message ??
        'Unable to upload the selected team logo.';

      this.errorMessage =
        `${logoError} Please retry the logo upload.`;

      return;

    }

    // Team information update failed

    this.errorMessage =
      error.error?.message ??
      'Unable to update team. Please try again.';

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
  // Continue Without Uploading New Logo
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

      'The team information has already been updated.\n\n' +

      'The selected logo has not been uploaded successfully.\n\n' +

      'Do you want to continue without uploading the new logo?'

    );

    if (!confirmed) {

      return;

    }

    this.navigateToTeamDetails(this.savedTeam.id);

  }

  // =====================================
  // Remove Existing Team Logo
  // =====================================

  removeExistingLogo(): void {

    if (!this.canRemoveExistingLogo) {

      return;

    }

    const confirmed = window.confirm(

      'Are you sure you want to remove the existing team logo?\n\n' +

      'The logo will be removed immediately.'

    );

    if (!confirmed) {

      return;

    }

    this.isRemovingLogo = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.teamService.deleteLogo(this.teamId)
      .pipe(

        finalize(() => {

          this.isRemovingLogo = false;

          this.cdr.markForCheck();

        })

      )
      .subscribe({

        next: (response: Team) => {

          this.existingLogoPath =
            response.logoUrl ?? null;

          this.successMessage =
            'Team logo removed successfully.';

        },

        error: (error) => {

          console.error(
            'Error removing team logo:',
            error
          );

          this.errorMessage =
            error.error?.message ??
            'Unable to remove team logo. Please try again.';

        }

      });

  }

  // =====================================
  // Navigate to Team Details
  // =====================================

  private navigateToTeamDetails(
    teamId: string
  ): void {

    this.router.navigate([
      '/teams',
      teamId
    ]);

  }

}
