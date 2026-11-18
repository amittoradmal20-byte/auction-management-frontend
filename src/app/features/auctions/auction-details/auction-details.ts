
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuctionService } from '../../../core/services/auction';
import { Auction } from '../../../core/models/auction/auction.model';
import { AuctionStatus } from '../../../core/models/auction/auction-status.model';

// =====================================
// Auction Action Type
// =====================================

type AuctionAction =
  | 'schedule'
  | 'start'
  | 'pause'
  | 'resume'
  | 'complete'
  | 'cancel'
  | 'delete';

@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './auction-details.html',
  styleUrl: './auction-details.scss'
})
export class AuctionDetails implements OnInit {

  private auctionService = inject(AuctionService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  auction: Auction | null = null;

  isLoading = false;

  // Only one lifecycle action can run at a time.
  activeAction: AuctionAction | null = null;

  errorMessage = '';

  ngOnInit(): void {
    this.loadAuctionDetails();
  }

  // =====================================
  // Loading State Getters
  // =====================================

  get isDeleting(): boolean {
    return this.activeAction === 'delete';
  }

  get isScheduling(): boolean {
    return this.activeAction === 'schedule';
  }

  get isStarting(): boolean {
    return this.activeAction === 'start';
  }

  get isPausing(): boolean {
    return this.activeAction === 'pause';
  }

  get isResuming(): boolean {
    return this.activeAction === 'resume';
  }

  get isCompleting(): boolean {
    return this.activeAction === 'complete';
  }

  get isCancelling(): boolean {
    return this.activeAction === 'cancel';
  }

  // =====================================
  // Load Auction Details
  // =====================================

  loadAuctionDetails(): void {

    if (this.isLoading || this.activeAction) {
      return;
    }

    const auctionId =
      this.activatedRoute.snapshot.paramMap.get('id');

    if (!auctionId) {
      this.errorMessage = 'Invalid auction ID.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.auctionService.getAuctionById(auctionId).subscribe({

      next: (response: Auction) => {
        this.auction = response;
        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error loading auction details:', error);

        this.auction = null;

        this.errorMessage =
          error.error?.message ||
          'Unable to load auction details. Please try again.';

        this.isLoading = false;
      }

    });
  }

  // =====================================
  // Schedule Auction
  // =====================================

  scheduleAuction(): void {

    if (!this.canExecuteAction(AuctionStatus.DRAFT)) {
      return;
    }

    const auction = this.auction!;

    const confirmed = window.confirm(
      `Are you sure you want to schedule the auction "${auction.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.activeAction = 'schedule';
    this.errorMessage = '';

    this.auctionService.scheduleAuction(auction.id).subscribe({

      next: (response: Auction) => {
        this.auction = response;
        this.activeAction = null;
      },

      error: (error) => {
        this.handleActionError(error, 'schedule');
      }

    });
  }

  // =====================================
  // Start Auction
  // =====================================

  startAuction(): void {

    if (!this.canExecuteAction(AuctionStatus.SCHEDULED)) {
      return;
    }

    const auction = this.auction!;

    const confirmed = window.confirm(
      `Are you sure you want to start the auction "${auction.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.activeAction = 'start';
    this.errorMessage = '';

    this.auctionService.startAuction(auction.id).subscribe({

      next: (response: Auction) => {
        this.auction = response;
        this.activeAction = null;
      },

      error: (error) => {
        this.handleActionError(error, 'start');
      }

    });
  }

  // =====================================
  // Pause Auction
  // =====================================

  pauseAuction(): void {

    if (!this.canExecuteAction(AuctionStatus.IN_PROGRESS)) {
      return;
    }

    const auction = this.auction!;

    const confirmed = window.confirm(
      `Are you sure you want to pause the auction "${auction.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.activeAction = 'pause';
    this.errorMessage = '';

    this.auctionService.pauseAuction(auction.id).subscribe({

      next: (response: Auction) => {
        this.auction = response;
        this.activeAction = null;
      },

      error: (error) => {
        this.handleActionError(error, 'pause');
      }

    });
  }

  // =====================================
  // Resume Auction
  // =====================================

  resumeAuction(): void {

    if (!this.canExecuteAction(AuctionStatus.PAUSED)) {
      return;
    }

    const auction = this.auction!;

    const confirmed = window.confirm(
      `Are you sure you want to resume the auction "${auction.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.activeAction = 'resume';
    this.errorMessage = '';

    this.auctionService.resumeAuction(auction.id).subscribe({

      next: (response: Auction) => {
        this.auction = response;
        this.activeAction = null;
      },

      error: (error) => {
        this.handleActionError(error, 'resume');
      }

    });
  }

  // =====================================
  // Complete Auction
  // =====================================

  completeAuction(): void {

    if (!this.canExecuteAction(AuctionStatus.IN_PROGRESS)) {
      return;
    }

    const auction = this.auction!;

    const confirmed = window.confirm(
      `Are you sure you want to complete the auction "${auction.name}"?\n\n` +
      'This will mark the auction as COMPLETED.\n' +
      'You will not be able to resume bidding after completion.'
    );

    if (!confirmed) {
      return;
    }

    this.activeAction = 'complete';
    this.errorMessage = '';

    this.auctionService.completeAuction(auction.id).subscribe({

      next: (response: Auction) => {
        this.auction = response;
        this.activeAction = null;
      },

      error: (error) => {
        this.handleActionError(error, 'complete');
      }

    });
  }

  // =====================================
  // Cancel Auction
  // =====================================

  cancelAuction(): void {

    if (
      !this.auction ||
      this.isLoading ||
      this.activeAction
    ) {
      return;
    }

    const auction = this.auction;

    // Terminal auctions cannot be cancelled.
    if (
      auction.status === AuctionStatus.COMPLETED ||
      auction.status === AuctionStatus.CANCELLED
    ) {

      this.errorMessage =
        'Completed or cancelled auctions cannot be cancelled again.';

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel the auction "${auction.name}"?\n\n` +
      'This action cannot be undone.\n' +
      'The auction will no longer be available for bidding.'
    );

    if (!confirmed) {
      return;
    }

    this.activeAction = 'cancel';
    this.errorMessage = '';

    this.auctionService.cancelAuction(auction.id).subscribe({

      next: (response: Auction) => {
        this.auction = response;
        this.activeAction = null;
      },

      error: (error) => {
        this.handleActionError(error, 'cancel');
      }

    });
  }

  // =====================================
  // Delete Auction
  // =====================================

  deleteAuction(): void {

    if (!this.canExecuteAction(AuctionStatus.DRAFT)) {
      return;
    }

    const auction = this.auction!;

    const confirmed = window.confirm(
      `Are you sure you want to delete the auction "${auction.name}"?\n\n` +
      'This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.activeAction = 'delete';
    this.errorMessage = '';

    this.auctionService.deleteAuction(auction.id).subscribe({

      next: () => {
        this.activeAction = null;
        this.router.navigate(['/auctions']);
      },

      error: (error) => {
        this.handleActionError(error, 'delete');
      }

    });
  }

  // =====================================
  // Validate Lifecycle Action
  // =====================================

  private canExecuteAction(
    expectedStatus: AuctionStatus
  ): boolean {

    if (
      !this.auction ||
      this.isLoading ||
      this.activeAction
    ) {
      return false;
    }

    if (this.auction.status !== expectedStatus) {

      this.errorMessage =
        `Only ${expectedStatus} auctions support this action.`;

      return false;
    }

    return true;
  }

  // =====================================
  // Handle API Errors
  // =====================================

  private handleActionError(
    error: any,
    action: string
  ): void {

    console.error(
      `Error performing auction action '${action}':`,
      error
    );

    this.errorMessage =
      error.error?.message ||
      `Unable to ${action} auction. Please try again.`;

    this.activeAction = null;
  }

  // =====================================
  // Navigate Back
  // =====================================

  goBack(): void {
    this.router.navigate(['/auctions']);
  }

}
