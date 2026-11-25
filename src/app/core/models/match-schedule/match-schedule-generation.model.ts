
import { MatchStage } from './match-schedule.model';

// ==========================================
// 1. MATCH SCHEDULE TEAM DRAW RESPONSE
// ==========================================

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

// ==========================================
// 2. MATCH SCHEDULE FIXTURE RESPONSE
// ==========================================

export interface MatchScheduleFixtureResponse {

  id: string;
  matchScheduleId: string;
  matchNumber: number;
  roundNumber: number;
  matchStage: MatchStage;
  status: string;

  // Home team information
  homeTournamentTeamId: string | null;
  homeTeamName: string | null;
  homeTeamShortName: string | null;
  homeTeamSource: string | null;

  // Away team information
  awayTournamentTeamId: string | null;
  awayTeamName: string | null;
  awayTeamShortName: string | null;
  awayTeamSource: string | null;

  // Match scheduling information
  matchDate: string | null;
  startTime: string | null;
  endTime: string | null;
  groundNumber: number | null;

  // Audit information
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. MATCH SCHEDULE GENERATION RESPONSE
// ==========================================

export interface MatchScheduleGenerationResponse {

  // Schedule information
  matchScheduleId: string;
  tournamentId: string;
  scheduleName: string;
  status: string;

  // Generation information
  generationNumber: number;
  randomSeed: number;
  regenerated: boolean;

  // Match statistics
  totalTeams: number;
  totalLeagueMatches: number;
  totalPlayoffMatches: number;
  totalMatches: number;

  // Generated team draws and fixtures
  teamDraws: MatchScheduleTeamDrawResponse[];
  fixtures: MatchScheduleFixtureResponse[];

  // Generation timestamp
  generatedAt: string;
}
