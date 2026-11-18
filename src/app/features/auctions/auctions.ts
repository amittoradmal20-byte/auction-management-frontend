
import { Component, OnInit, inject } from '@angular/core';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

import { AuctionService } from '../../core/services/auction';
import { Auction } from '../../core/models/auction/auction.model';

import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-auctions',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink],
  templateUrl: './auctions.html',
  styleUrl: './auctions.scss'
})
export class Auctions implements OnInit {

  private auctionService = inject(AuctionService);

  auctions: Auction[] = [];

  isLoading = false;
  errorMessage = '';

  // =====================================
  // Component Initialization
  // =====================================

  ngOnInit(): void {
    this.loadAuctions();
  }

  // =====================================
  // Load All Auctions
  // =====================================

  loadAuctions(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.auctionService.getAllAuctions().subscribe({

      next: (response: Auction[]) => {

        this.auctions = response;
        this.isLoading = false;

      },

      error: (error) => {

        console.error('Error loading auctions:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to load auctions. Please try again.';

        this.isLoading = false;

      }

    });
  }

}
