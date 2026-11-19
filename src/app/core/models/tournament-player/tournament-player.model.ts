
export enum TournamentPlayerStatus {
  SELECTED = 'SELECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface TournamentPlayer {
  id: string;
  tournamentId: string;
  playerId: string;
  status: TournamentPlayerStatus;
}
