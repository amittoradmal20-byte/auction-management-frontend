
export interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: TournamentStatus;
  maxTeams: number;
  createdAt: string;
  updatedAt: string;
}

export type TournamentStatus =
  | 'DRAFT'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'AUCTION_PENDING'
  | 'AUCTION_IN_PROGRESS'
  | 'AUCTION_COMPLETED'
  | 'TOURNAMENT_IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';
