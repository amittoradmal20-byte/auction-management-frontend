export interface TournamentTeamResponse {

  id: string;

  tournamentId: string;

  teamId: string;

  ownerId: string | null;

  initialBudget: number;

  remainingBudget: number;

  status: string;

  createdAt: string;

  updatedAt: string;

}