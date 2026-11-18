
export interface AuctionCreateRequest {

  tournamentId: string;

  name: string;

  description: string | null;

  startTime: string | null;

  endTime: string | null;

  openingBid: number;

  bidIncrement: number;

}
