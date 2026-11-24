
export interface MatchScheduleTeamDrawResponse {
  id: string;
  matchScheduleId: string;
  tournamentTeamId: string;
  teamId: string;
  teamName: string;
  teamShortName: string;
  randomNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface MatchScheduleFixtureResponse {
  id: string;
  matchScheduleId: string;
  matchNumber: number;
  roundNumber: number;
  matchStage: string;
  status: string;

  homeTournamentTeamId: string | null;
  homeTeamName: string | null;
  homeTeamShortName: string | null;
  homeTeamSource: string | null;

  awayTournamentTeamId: string | null;
  awayTeamName: string | null;
  awayTeamShortName: string | null;
  awayTeamSource: string | null;

  matchDate: string | null;
  startTime: string | null;
  endTime: string | null;
  groundNumber: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface MatchScheduleGenerationResponse {
  matchScheduleId: string;
  tournamentId: string;
  scheduleName: string;
  status: string;

  generationNumber: number;
  randomSeed: number;
  regenerated: boolean;

  totalTeams: number;
  totalLeagueMatches: number;
  totalPlayoffMatches: number;
  totalMatches: number;

  teamDraws: MatchScheduleTeamDrawResponse[];
  fixtures: MatchScheduleFixtureResponse[];

  generatedAt: string;
}
