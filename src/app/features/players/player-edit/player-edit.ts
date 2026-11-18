
import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { PlayerService } from '../../../core/services/player';
import { PlayerUpdateRequest } from '../../../core/models/player/player-update-request.model';

@Component({
  selector: 'app-player-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './player-edit.html',
  styleUrl: './player-edit.scss'
})
export class PlayerEdit implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private playerService = inject(PlayerService);

  playerId = '';

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  loadErrorMessage = '';

  playerRoles = [
    { value: 'BATSMAN', label: 'Batsman' },
    { value: 'BOWLER', label: 'Bowler' },
    { value: 'ALL_ROUNDER', label: 'All Rounder' },
    { value: 'WICKET_KEEPER', label: 'Wicket Keeper' }
  ];

  battingStyles = [
    { value: 'RIGHT_HAND', label: 'Right Hand' },
    { value: 'LEFT_HAND', label: 'Left Hand' }
  ];

  bowlingStyles = [
    { value: 'RIGHT_ARM_FAST', label: 'Right Arm Fast' },
    { value: 'RIGHT_ARM_FAST_MEDIUM', label: 'Right Arm Fast Medium' },
    { value: 'RIGHT_ARM_MEDIUM', label: 'Right Arm Medium' },
    { value: 'RIGHT_ARM_OFF_BREAK', label: 'Right Arm Off Break' },
    { value: 'RIGHT_ARM_LEG_BREAK', label: 'Right Arm Leg Break' },
    { value: 'LEFT_ARM_FAST', label: 'Left Arm Fast' },
    { value: 'LEFT_ARM_FAST_MEDIUM', label: 'Left Arm Fast Medium' },
    { value: 'LEFT_ARM_MEDIUM', label: 'Left Arm Medium' },
    { value: 'LEFT_ARM_ORTHODOX', label: 'Left Arm Orthodox' },
    { value: 'NONE', label: 'None' }
  ];

  maxDateOfBirth = this.getYesterday();

  playerForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.maxLength(100)]],
    displayName: ['', [Validators.required, Validators.maxLength(150)]],
    dateOfBirth: [''],
    nationality: ['', [Validators.maxLength(50)]],
    profileImageUrl: ['', [Validators.maxLength(500)]],
    role: ['', [Validators.required]],
    battingStyle: ['', [Validators.required]],
    bowlingStyle: ['', [Validators.required]]
  });

  get firstName() {
    return this.playerForm.controls.firstName;
  }

  get lastName() {
    return this.playerForm.controls.lastName;
  }

  get displayName() {
    return this.playerForm.controls.displayName;
  }

  get dateOfBirth() {
    return this.playerForm.controls.dateOfBirth;
  }

  get nationality() {
    return this.playerForm.controls.nationality;
  }

  get profileImageUrl() {
    return this.playerForm.controls.profileImageUrl;
  }

  get role() {
    return this.playerForm.controls.role;
  }

  get battingStyle() {
    return this.playerForm.controls.battingStyle;
  }

  get bowlingStyle() {
    return this.playerForm.controls.bowlingStyle;
  }

  ngOnInit(): void {

    this.playerId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.playerId) {
      this.loadErrorMessage = 'Invalid player ID.';
      return;
    }

    this.loadPlayer();
  }

  loadPlayer(): void {

    this.isLoading = true;
    this.loadErrorMessage = '';
    this.errorMessage = '';

    this.playerService.getPlayerById(this.playerId).subscribe({
      next: (player) => {

        this.playerForm.patchValue({
          firstName: player.firstName ?? '',
          lastName: player.lastName ?? '',
          displayName: player.displayName ?? '',
          dateOfBirth: player.dateOfBirth ?? '',
          nationality: player.nationality ?? '',
          profileImageUrl: player.profileImageUrl ?? '',
          role: player.role ?? '',
          battingStyle: player.battingStyle ?? '',
          bowlingStyle: player.bowlingStyle ?? ''
        });

        this.isLoading = false;
      },
      error: (error) => {

        console.error('Error loading player:', error);

        this.loadErrorMessage =
          'Unable to load player information. Please try again.';

        this.isLoading = false;
      }
    });
  }

  private getYesterday(): string {

    const date = new Date();
    date.setDate(date.getDate() - 1);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  updatePlayer(): void {

    if (this.playerForm.invalid) {
      this.playerForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting || this.isLoading || this.loadErrorMessage) {
      return;
    }

    const formValue = this.playerForm.getRawValue();

    const request: PlayerUpdateRequest = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim() || null,
      displayName: formValue.displayName.trim(),
      dateOfBirth: formValue.dateOfBirth || null,
      nationality: formValue.nationality.trim() || null,
      profileImageUrl: formValue.profileImageUrl.trim() || null,
      role: formValue.role,
      battingStyle: formValue.battingStyle,
      bowlingStyle: formValue.bowlingStyle
    };

    if (!request.firstName || !request.displayName) {

      if (!request.firstName) {
        this.firstName.setErrors({ required: true });
      }

      if (!request.displayName) {
        this.displayName.setErrors({ required: true });
      }

      this.playerForm.markAllAsTouched();
      return;
    }

    if (request.dateOfBirth &&
        request.dateOfBirth > this.maxDateOfBirth) {

      this.dateOfBirth.setErrors({ pastDate: true });
      this.dateOfBirth.markAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.playerService.updatePlayer(
      this.playerId,
      request
    ).subscribe({
      next: () => {

        this.isSubmitting = false;

        this.router.navigate([
          '/players',
          this.playerId
        ]);
      },
      error: (error) => {

        console.error('Error updating player:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to update player. Please try again.';

        this.isSubmitting = false;
      }
    });
  }
}
