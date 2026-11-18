
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { AuctionService } from '../../../core/services/auction';
import { Auction } from '../../../core/models/auction/auction.model';
import { AuctionUpdateRequest } from '../../../core/models/auction/auction-update-request.model';

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
  selector: 'app-auction-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auction-edit.html',
  styleUrl: './auction-edit.scss'
})
export class AuctionEdit implements OnInit {

  private fb = inject(FormBuilder);
  private auctionService = inject(AuctionService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  auctionId = '';
  auction: Auction | null = null;

  isLoading = false;
  isSubmitting = false;

  errorMessage = '';
  successMessage = '';

  // =====================================
  // Edit Auction Form
  // =====================================

  auctionForm = this.fb.nonNullable.group({

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

    const id = this.activatedRoute.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Invalid auction ID.';
      return;
    }

    this.auctionId = id;

    this.loadAuction();
  }

  // =====================================
  // Load Existing Auction
  // =====================================

  loadAuction(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.auctionService.getAuctionById(this.auctionId).subscribe({

      next: (response: Auction) => {

        this.auction = response;
        this.isLoading = false;

        if (response.status !== 'DRAFT') {

          this.errorMessage =
            'Only auctions with DRAFT status can be edited.';

          this.auctionForm.disable();
          return;
        }

        this.auctionForm.enable();

        this.auctionForm.patchValue({

          name: response.name,

          description: response.description ?? '',

          startTime: this.toDateTimeLocal(response.startTime),

          endTime: this.toDateTimeLocal(response.endTime),

          openingBid: response.openingBid,

          bidIncrement: response.bidIncrement

        });

      },

      error: (error) => {

        console.error('Error loading auction:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to load auction details. Please try again.';

        this.isLoading = false;

      }

    });
  }

  // =====================================
  // Convert Backend Date to Input Format
  // =====================================

  private toDateTimeLocal(
    value: string | null
  ): string {

    if (!value) {
      return '';
    }

    // Backend LocalDateTime example:
    // 2026-11-21T19:21:00
    // datetime-local expects:
    // 2026-11-21T19:21

    return value.substring(0, 16);
  }

  // =====================================
  // Update Auction
  // =====================================

  updateAuction(): void {

    if (
      this.auctionForm.invalid ||
      this.isSubmitting ||
      this.isLoading ||
      this.auction?.status !== 'DRAFT'
    ) {

      this.auctionForm.markAllAsTouched();
      return;

    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.auctionForm.getRawValue();

    const name = formValue.name.trim();

    if (!name) {
      this.errorMessage = 'Auction name is required.';
      this.isSubmitting = false;
      return;
    }

    const request: AuctionUpdateRequest = {

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

    this.auctionService.updateAuction(
      this.auctionId,
      request
    ).subscribe({

      next: () => {

        this.isSubmitting = false;

        this.router.navigate([
          '/auctions',
          this.auctionId
        ]);

      },

      error: (error) => {

        console.error('Error updating auction:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to update auction. Please try again.';

        this.isSubmitting = false;

      }

    });
  }

}
