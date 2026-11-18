
import { AuctionStatus } from './auction-status.model';

export interface Auction {

  id: string;

  tournamentId: string;

  name: string;

  description: string | null;

  status: AuctionStatus;

  startTime: string | null;

  endTime: string | null;

  createdAt: string;

  updatedAt: string;

  openingBid: number;

  bidIncrement: number;

}
