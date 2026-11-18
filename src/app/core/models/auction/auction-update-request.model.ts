
export interface AuctionUpdateRequest {

  name: string;

  description: string | null;

  startTime: string | null;

  endTime: string | null;

  openingBid: number | null;

  bidIncrement: number | null;

}
