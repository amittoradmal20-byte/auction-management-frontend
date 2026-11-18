
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { TournamentService } from '../../../core/services/tournament';
import { Tournament } from '../../../core/models/tournament/tournament.model';

import { AuctionService } from '../../../core/services/auction';
import { AuctionCreateRequest } from '../../../core/models/auction/auction-create-request.model';

// =====================================
// Auction Date Range Validator
// =====================================

function auctionDateRangeValidator(
  control: AbstractControl
): ValidationErrors | null {

  const startTime = control.get('startTime')?.value;
  const endTime = control.get('endTime')?.value;

  if (!startTime || !endTime) {
    return null;
  }

  return new Date(endTime).getTime() >
    new Date(startTime).getTime()
    ? null
    : { invalidDateRange: true };
}

@Component({
  selector: 'app-auction-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auction-create.html',
  styleUrl: './auction-create.scss'
})
export class AuctionCreate implements OnInit {

  private fb = inject(FormBuilder);
  private tournamentService = inject(TournamentService);
  private auctionService = inject(AuctionService);
  private router = inject(Router);

  tournaments: Tournament[] = [];

  isLoadingTournaments = false;
  isSubmitting = false;

  errorMessage = '';
  tournamentErrorMessage = '';

  // =====================================
  // Create Auction Form
  // =====================================

  auctionForm = this.fb.nonNullable.group({

    tournamentId: ['', Validators.required],

    name: ['', [
      Validators.required,
      Validators.maxLength(150)
    ]],

    description: ['', [
      Validators.maxLength(500)
    ]],

    startTime: [''],

    endTime: [''],

    openingBid: [1000, [
      Validators.required,
      Validators.min(0.01)
    ]],

    bidIncrement: [500, [
      Validators.required,
      Validators.min(0.01)
    ]]

  }, {
    validators: auctionDateRangeValidator
  });

  // =====================================
  // Component Initialization
  // =====================================

  ngOnInit(): void {
    this.loadTournaments();
  }

  // =====================================
  // Load Eligible Tournaments
  // =====================================

  loadTournaments(): void {

    this.isLoadingTournaments = true;
    this.tournamentErrorMessage = '';

    this.tournamentService.getAllTournaments().subscribe({

      next: (response: Tournament[]) => {

        // Auction creation is allowed only
        // for AUCTION_PENDING tournaments.

        this.tournaments = response.filter(
          tournament =>
            tournament.status === 'AUCTION_PENDING'
        );

        this.isLoadingTournaments = false;

      },

      error: (error) => {

        console.error('Error loading tournaments:', error);

        this.tournamentErrorMessage =
          'Unable to load eligible tournaments. Please try again.';

        this.isLoadingTournaments = false;

      }

    });
  }

  // =====================================
  // Create Auction
  // =====================================

  createAuction(): void {

    if (
      this.auctionForm.invalid ||
      this.isSubmitting ||
      this.isLoadingTournaments ||
      !!this.tournamentErrorMessage
    ) {

      this.auctionForm.markAllAsTouched();
      return;

    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.auctionForm.getRawValue();

    const name = formValue.name.trim();

    if (!name) {
      this.errorMessage = 'Auction name is required.';
      this.isSubmitting = false;
      return;
    }

    const request: AuctionCreateRequest = {

      tournamentId: formValue.tournamentId,

      name,

      description: formValue.description.trim() || null,

      startTime: formValue.startTime
        ? `${formValue.startTime}:00`
        : null,

      endTime: formValue.endTime
        ? `${formValue.endTime}:00`
        : null,

      openingBid: formValue.openingBid,

      bidIncrement: formValue.bidIncrement

    };

    this.auctionService.createAuction(request).subscribe({

      next: () => {

        this.isSubmitting = false;

        this.router.navigate(['/auctions']);

      },

      error: (error) => {

        console.error('Error creating auction:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to create auction. Please try again.';

        this.isSubmitting = false;

      }

    });
  }

}
