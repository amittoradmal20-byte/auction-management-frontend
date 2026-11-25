
import {
  DayOfWeek,
  SchedulingType,
  PlayoffFormat
} from './match-schedule.model';

export interface MatchScheduleCreateRequest {

  // Tournament information
  tournamentId: string;
  name: string;

  // Scheduling configuration
  schedulingType: SchedulingType;
  leagueFormat: string;
  opponentsToSkip: number;
  playoffFormat: PlayoffFormat;
  qualifyingTeamCount: number;

  // Tournament dates
  startDate: string;
  endDate: string;

  allowedDaysOfWeek: DayOfWeek[];
  selectedDates: string[];
  excludedDates: string[];

  // Daily match timings
  dailyStartTime: string;
  dailyEndTime: string;

  matchDurationMinutes: number;
  breakBetweenMatchesMinutes: number;

  // Fairness configuration
  minimumRestMinutes: number;
  minimumMatchesBetweenAppearances: number;
  maxMatchesPerTeamPerDay: number;

  // Ground configuration
  numberOfGrounds: number;

  // Randomization
  randomSeed: number | null;
}
