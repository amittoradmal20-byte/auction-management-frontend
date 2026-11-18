
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Auction } from '../models/auction/auction.model';
import { AuctionCreateRequest } from '../models/auction/auction-create-request.model';
import { AuctionUpdateRequest } from '../models/auction/auction-update-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuctionService {

  private http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/api/v1/auctions';

  // =====================================
  // Get All Auctions
  // =====================================

  getAllAuctions(): Observable<Auction[]> {

    return this.http.get<Auction[]>(this.apiUrl);

  }

  // =====================================
  // Get Auction By ID
  // =====================================

  getAuctionById(auctionId: string): Observable<Auction> {

    return this.http.get<Auction>(
      `${this.apiUrl}/${auctionId}`
    );

  }

  // =====================================
  // Get Auctions By Tournament
  // =====================================

  getAuctionsByTournament(tournamentId: string): Observable<Auction[]> {

    const params = new HttpParams()
      .set('tournamentId', tournamentId);

    return this.http.get<Auction[]>(
      this.apiUrl,
      { params }
    );

  }

  // =====================================
  // Create Auction
  // =====================================

  createAuction(request: AuctionCreateRequest): Observable<Auction> {

    return this.http.post<Auction>(
      this.apiUrl,
      request
    );

  }

  // =====================================
  // Update Auction
  // =====================================

  updateAuction(
    auctionId: string,
    request: AuctionUpdateRequest
  ): Observable<Auction> {

    return this.http.put<Auction>(
      `${this.apiUrl}/${auctionId}`,
      request
    );

  }

  // =====================================
  // Delete Auction
  // =====================================

  deleteAuction(auctionId: string): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${auctionId}`
    );

  }

  // =====================================
  // Schedule Auction
  // =====================================

  scheduleAuction(auctionId: string): Observable<Auction> {

    return this.http.post<Auction>(
      `${this.apiUrl}/${auctionId}/schedule`,
      {}
    );

  }

  // =====================================
  // Start Auction
  // =====================================

  startAuction(auctionId: string): Observable<Auction> {

    return this.http.post<Auction>(
      `${this.apiUrl}/${auctionId}/start`,
      {}
    );

  }

  // =====================================
  // Pause Auction
  // =====================================

  pauseAuction(auctionId: string): Observable<Auction> {

    return this.http.post<Auction>(
      `${this.apiUrl}/${auctionId}/pause`,
      {}
    );

  }

  // =====================================
  // Resume Auction
  // =====================================

  resumeAuction(auctionId: string): Observable<Auction> {

    return this.http.post<Auction>(
      `${this.apiUrl}/${auctionId}/resume`,
      {}
    );

  }

  // =====================================
  // Complete Auction
  // =====================================

  completeAuction(auctionId: string): Observable<Auction> {

    return this.http.post<Auction>(
      `${this.apiUrl}/${auctionId}/complete`,
      {}
    );

  }

  // =====================================
  // Cancel Auction
  // =====================================

  cancelAuction(auctionId: string): Observable<Auction> {

    return this.http.post<Auction>(
      `${this.apiUrl}/${auctionId}/cancel`,
      {}
    );

  }

}
