
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

// ==========================================
// PLAYOFF FORMAT
// ==========================================

export type PlayoffFormat =
  | 'NONE'
  | 'TOP_2_FINAL'
  | 'TOP_3_PLAYOFF'
  | 'TOP_4_SEMIFINAL'
  | 'TOP_4_PLAYOFF';

// ==========================================
// MATCH STAGE
// ==========================================

export type MatchStage =
  | 'LEAGUE'
  | 'SEMIFINAL'
  | 'SEMIFINAL_1'
  | 'SEMIFINAL_2'
  | 'QUALIFIER_1'
  | 'ELIMINATOR'
  | 'QUALIFIER_2'
  | 'FINAL';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

// ==========================================
// MATCH SCHEDULE RESPONSE
// ==========================================

export interface MatchScheduleResponse {

  // Schedule information
  id: string;
  tournamentId: string;
  tournamentName: string | null;
  tournamentLogoUrl: string | null;
  name: string;
  status: MatchScheduleStatus;

  // Scheduling configuration
  schedulingType: SchedulingType;
  leagueFormat: LeagueFormat | string;
  opponentsToSkip: number;
  playoffFormat: PlayoffFormat;
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
