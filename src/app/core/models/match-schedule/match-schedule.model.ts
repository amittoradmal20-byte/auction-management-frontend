export type MatchScheduleStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type SchedulingType =
  | 'DAILY'
  | 'WEEKLY'
  | 'WEEKEND'
  | 'TWO_DAY'
  | 'THREE_DAY'
  | 'CUSTOM';

export type LeagueFormat =
  | 'SINGLE_ROUND_ROBIN'
  | 'DOUBLE_ROUND_ROBIN'
  | 'PARTIAL_ROUND_ROBIN';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface MatchScheduleResponse {

  // Schedule information
  id: string;
  tournamentId: string;
  tournamentName: string | null;
  name: string;
  status: MatchScheduleStatus;

  // Scheduling configuration
  schedulingType: SchedulingType;
  leagueFormat: LeagueFormat | string;
  opponentsToSkip: number;
  playoffFormat: string;
  qualifyingTeamCount: number;

  // Tournament dates
  startDate: string;
  endDate: string;
  allowedDaysOfWeek: DayOfWeek[];
  selectedDates: string[];
  excludedDates: string[];

  // Daily timings
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
  generationNumber: number;

  // Generated match statistics
  totalTeams: number | null;
  totalLeagueMatches: number | null;
  totalPlayoffMatches: number | null;
  totalMatches: number | null;

  // Audit information
  createdAt: string;
  updatedAt: string;
}