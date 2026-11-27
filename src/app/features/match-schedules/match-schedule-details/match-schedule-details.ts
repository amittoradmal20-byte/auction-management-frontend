import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';
import { PdfDownloadUtil } from '../../../shared/utils/pdf-download.util';

import { MatchScheduleService } from '../../../core/services/match-schedule';

import {
  MatchScheduleResponse,
  PlayoffFormat,
  MatchStage
} from '../../../core/models/match-schedule/match-schedule.model';

import {
  MatchScheduleFixtureResponse,
  MatchScheduleTeamDrawResponse
} from '../../../core/models/match-schedule/match-schedule-generation.model';

import { SecureImage } from '../../../shared/components/secure-image/secure-image';

@Component({
  selector: 'app-match-schedule-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SecureImage],
  templateUrl: './match-schedule-details.html',
  styleUrl: './match-schedule-details.scss'
})
export class MatchScheduleDetails implements OnInit {

  // =====================================
  // 1. DEPENDENCIES
  // =====================================

  private readonly route = inject(ActivatedRoute);

  private readonly matchScheduleService =
    inject(MatchScheduleService);

  // =====================================
  // 2. COMPONENT STATE
  // =====================================

  scheduleId = '';

  schedule: MatchScheduleResponse | null = null;

  tournamentName = '';

  get tournamentLogoUrl(): string | null {
    return this.schedule?.tournamentLogoUrl ?? null;
  }

  teamDraws: MatchScheduleTeamDrawResponse[] = [];

  fixtures: MatchScheduleFixtureResponse[] = [];

  loading = false;

  loadingTournament = false;

  loadingFixtures = false;

  generating = false;

  downloadingPdf = false;

  pdfErrorMessage = '';

  pdfTeamId = 'ALL';

  pdfMatchDate = 'ALL';

  errorMessage = '';

  fixtureErrorMessage = '';

  generationErrorMessage = '';

  generationSuccessMessage = '';

  viewMode: 'table' | 'cards' = 'table';

  selectedDate = 'ALL';

  // =====================================
  // 3. PLAYOFF CONFIGURATION
  // =====================================

  private readonly playoffFormatLabels:
    Record<PlayoffFormat, string> = {

      NONE: 'No Playoffs',

      TOP_2_FINAL: 'Top 2 — Direct Final',

      TOP_3_PLAYOFF: 'Top 3 — Playoff',

      TOP_4_SEMIFINAL: 'Top 4 — Semifinals',

      TOP_4_PLAYOFF: 'Top 4 — IPL Style'

    };

  private readonly playoffMatchCounts:
    Record<PlayoffFormat, number> = {

      NONE: 0,

      TOP_2_FINAL: 1,

      TOP_3_PLAYOFF: 2,

      TOP_4_SEMIFINAL: 3,

      TOP_4_PLAYOFF: 4

    };

  private readonly matchStageLabels:
    Record<MatchStage, string> = {

      LEAGUE: 'League',

      SEMIFINAL: 'Semifinal',

      SEMIFINAL_1: 'Semifinal 1',

      SEMIFINAL_2: 'Semifinal 2',

      QUALIFIER_1: 'Qualifier 1',

      ELIMINATOR: 'Eliminator',

      QUALIFIER_2: 'Qualifier 2',

      FINAL: 'Grand Final'

    };

  // =====================================
  // 4. FIXTURE DATE FILTERS
  // =====================================

  get fixtureDates(): string[] {

    return [
      ...new Set(
        this.fixtures.flatMap(
          fixture => fixture.matchDate
            ? [fixture.matchDate]
            : []
        )
      )
    ].sort();

  }

  get filteredFixtures(): MatchScheduleFixtureResponse[] {

    return this.selectedDate === 'ALL'
      ? this.fixtures
      : this.fixtures.filter(fixture =>
          this.selectedDate === 'TBD'
            ? !fixture.matchDate
            : fixture.matchDate === this.selectedDate
        );

  }

  get hasUndatedFixtures(): boolean {

    return this.fixtures.some(
      fixture => !fixture.matchDate
    );

  }

  countForDate(date: string): number {

    return this.fixtures.filter(
      fixture => fixture.matchDate === date
    ).length;

  }

  // =====================================
  // 5. LEAGUE AND PLAYOFF FIXTURES
  // =====================================

  get leagueFixtures(): MatchScheduleFixtureResponse[] {

    return this.fixtures.filter(
      fixture => fixture.matchStage === 'LEAGUE'
    );

  }

  get playoffFixtures(): MatchScheduleFixtureResponse[] {

    return this.fixtures.filter(
      fixture => fixture.matchStage !== 'LEAGUE'
    );

  }

  get filteredLeagueFixtures(): MatchScheduleFixtureResponse[] {

    return this.filteredFixtures.filter(
      fixture => fixture.matchStage === 'LEAGUE'
    );

  }

  get filteredPlayoffFixtures(): MatchScheduleFixtureResponse[] {

    return this.filteredFixtures.filter(
      fixture => fixture.matchStage !== 'LEAGUE'
    );

  }

  get hasLeagueFixtures(): boolean {

    return this.leagueFixtures.length > 0;

  }

  get hasPlayoffFixtures(): boolean {

    return this.playoffFixtures.length > 0;

  }

  // =====================================
  // 6. MATCH STATISTICS
  // =====================================

  get totalTeams(): number {

    return this.teamDraws.length;

  }

  get totalLeagueMatches(): number {

    return this.leagueFixtures.length;

  }

  get totalPlayoffMatches(): number {

    return this.playoffFixtures.length;

  }

  get totalMatches(): number {

    return this.fixtures.length;

  }

  get qualifyingTeamCount(): number {

    return this.schedule?.qualifyingTeamCount ?? 0;

  }

  // =====================================
  // 7. PLAYOFF CONFIGURATION DETAILS
  // =====================================

  get playoffFormat(): PlayoffFormat {

    return this.schedule?.playoffFormat ?? 'NONE';

  }

  get playoffFormatLabel(): string {

    return this.playoffFormatLabels[this.playoffFormat]
      ?? this.playoffFormat;

  }

  get hasPlayoffConfiguration(): boolean {

    return this.playoffFormat !== 'NONE';

  }

  get expectedPlayoffMatches(): number {

    return this.playoffMatchCounts[this.playoffFormat] ?? 0;

  }

  get hasMissingPlayoffFixtures(): boolean {

    return !this.loading &&
      !this.loadingFixtures &&
      !this.fixtureErrorMessage &&
      this.hasPlayoffConfiguration &&
      this.hasLeagueFixtures &&
      this.totalPlayoffMatches < this.expectedPlayoffMatches;

  }

  get playoffConfigurationWarning(): string {

    if (!this.hasMissingPlayoffFixtures) {
      return '';
    }

    return `The configured playoff format requires ` +
      `${this.expectedPlayoffMatches} playoff matches, ` +
      `but only ${this.totalPlayoffMatches} have been generated. ` +
      `The match schedule requires regeneration.`;

  }

  // =====================================
  // 8. MATCH STAGE DISPLAY
  // =====================================

  getMatchStageLabel(stage: MatchStage): string {

    return this.matchStageLabels[stage]
      ?? stage;

  }

  isLeagueMatch(
    fixture: MatchScheduleFixtureResponse
  ): boolean {

    return fixture.matchStage === 'LEAGUE';

  }

  isPlayoffMatch(
    fixture: MatchScheduleFixtureResponse
  ): boolean {

    return fixture.matchStage !== 'LEAGUE';

  }

  isFinalMatch(
    fixture: MatchScheduleFixtureResponse
  ): boolean {

    return fixture.matchStage === 'FINAL';

  }

  getMatchStageClass(stage: MatchStage): string {

    switch (stage) {

      case 'LEAGUE':
        return 'stage-league';

      case 'SEMIFINAL':
      case 'SEMIFINAL_1':
      case 'SEMIFINAL_2':
        return 'stage-semifinal';

      case 'QUALIFIER_1':
      case 'QUALIFIER_2':
        return 'stage-qualifier';

      case 'ELIMINATOR':
        return 'stage-eliminator';

      case 'FINAL':
        return 'stage-final';

      default:
        return 'stage-default';

    }

  }

  // =====================================
  // 9. TEAM SOURCE DISPLAY
  // =====================================

  formatTeamSource(source: string | null): string {

    if (!source?.trim()) {
      return 'TBD';
    }

    const value = source.trim();

    const rankMatch = /^RANK_(\d+)$/.exec(value);

    if (rankMatch) {
      return `Rank ${rankMatch[1]}`;
    }

    const winnerMatch =
      /^WINNER_MATCH_(\d+)$/.exec(value);

    if (winnerMatch) {
      return `Winner of Match ${winnerMatch[1]}`;
    }

    const loserMatch =
      /^LOSER_MATCH_(\d+)$/.exec(value);

    if (loserMatch) {
      return `Loser of Match ${loserMatch[1]}`;
    }

    return value.replace(/_/g, ' ');

  }

  getHomeTeamDisplayName(
    fixture: MatchScheduleFixtureResponse
  ): string {

    return fixture.homeTeamName?.trim()
      || this.formatTeamSource(fixture.homeTeamSource);

  }

  getAwayTeamDisplayName(
    fixture: MatchScheduleFixtureResponse
  ): string {

    return fixture.awayTeamName?.trim()
      || this.formatTeamSource(fixture.awayTeamSource);

  }

  getHomeTeamShortName(
    fixture: MatchScheduleFixtureResponse
  ): string {

    return fixture.homeTeamShortName?.trim()
      || this.getHomeTeamDisplayName(fixture);

  }

  getAwayTeamShortName(
    fixture: MatchScheduleFixtureResponse
  ): string {

    return fixture.awayTeamShortName?.trim()
      || this.getAwayTeamDisplayName(fixture);

  }

  isHomeTeamPlaceholder(
    fixture: MatchScheduleFixtureResponse
  ): boolean {

    return !fixture.homeTeamName?.trim();

  }

  isAwayTeamPlaceholder(
    fixture: MatchScheduleFixtureResponse
  ): boolean {

    return !fixture.awayTeamName?.trim();

  }

  // =====================================
  // 10. TEAM DISTRIBUTION
  // =====================================

  get teamDistribution() {

    const league = this.leagueFixtures;

    return this.teamDraws.map(team => {

      const matches = league.filter(fixture =>

        fixture.homeTournamentTeamId === team.tournamentTeamId ||

        fixture.awayTournamentTeamId === team.tournamentTeamId

      );

      return {

        id: team.id,

        name: team.teamName,

        total: matches.length,

        daily: this.fixtureDates.map(date =>

          matches.filter(
            fixture => fixture.matchDate === date
          ).length

        )

      };

    });

  }

  // =====================================
  // 11. SKIPPED PAIRINGS
  // =====================================

  get skippedPairings() {

    if (
      this.schedule?.leagueFormat !== 'PARTIAL_ROUND_ROBIN' ||
      !this.leagueFixtures.length
    ) {
      return [];
    }

    const played = new Set(

      this.leagueFixtures.map(fixture => [

        fixture.homeTournamentTeamId,

        fixture.awayTournamentTeamId

      ].sort().join('|'))

    );

    return this.teamDraws.flatMap((a, i) =>

      this.teamDraws.slice(i + 1)

        .filter(b =>

          !played.has([

            a.tournamentTeamId,

            b.tournamentTeamId

          ].sort().join('|'))

        )

        .map(b => ({

          id: `${a.id}-${b.id}`,

          home: a.teamName,

          away: b.teamName

        }))

    );

  }

  get equalLeagueMatches(): boolean {

    const counts = this.teamDistribution;

    return counts.length > 0 &&

      this.leagueFixtures.length > 0 &&

      counts.every(
        team => team.total === counts[0].total
      );

  }

  // =====================================
  // 12. INITIALIZATION
  // =====================================

  ngOnInit(): void {

    this.scheduleId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.scheduleId) {

      this.errorMessage =
        'Invalid Match Schedule ID.';

      return;

    }

    this.loadSchedule(this.scheduleId);

  }

  // =====================================
  // 13. LOAD MATCH SCHEDULE
  // =====================================

  loadSchedule(scheduleId: string): void {

    if (!scheduleId) {
      return;
    }

    this.loading = true;

    this.errorMessage = '';

    this.matchScheduleService
      .getScheduleById(scheduleId)
      .subscribe({

        next: response => {

          this.schedule = response;

          this.loading = false;

          this.tournamentName = response.tournamentName?.trim() || 'N/A';

          this.loadGeneratedData(scheduleId);

        },

        error: error => {

          console.error(
            'Failed to load schedule:',
            error
          );

          this.errorMessage =
            'Unable to load Match Schedule details. Please try again.';

          this.loading = false;

        }

      });

  }

  // =====================================
  // 14. LOAD GENERATED DATA
  // =====================================

  loadGeneratedData(scheduleId: string): void {

    this.loadingFixtures = true;

    this.fixtureErrorMessage = '';

    this.teamDraws = [];

    this.fixtures = [];

    this.selectedDate = 'ALL';
    this.resetPdfFilters();

    forkJoin({

      teamDraws:
        this.matchScheduleService.getTeamDraws(scheduleId),

      fixtures:
        this.matchScheduleService.getFixtures(scheduleId)

    }).subscribe({

      next: response => {

        this.teamDraws = [...response.teamDraws]

          .sort(
            (a, b) => a.randomNumber - b.randomNumber
          );

        this.fixtures = [...response.fixtures]

          .sort(
            (a, b) => a.matchNumber - b.matchNumber
          );

        this.loadingFixtures = false;

      },

      error: error => {

        console.error(
          'Failed to load generated data:',
          error
        );

        this.fixtureErrorMessage =
          'Unable to load team draws and match fixtures.';

        this.loadingFixtures = false;

      }

    });

  }

  // =====================================
  // 15. GENERATE FIXTURES
  // =====================================

  generateFixtures(): void {

    if (
      !this.schedule ||
      this.schedule.status !== 'DRAFT' ||
      this.generating ||
      this.loading ||
      this.loadingFixtures ||
      (this.schedule.totalMatches ?? 0) > 0
    ) {
      return;
    }

    const scheduleId = this.schedule.id;

    this.generating = true;

    this.generationErrorMessage = '';

    this.generationSuccessMessage = '';

    this.matchScheduleService
      .generateSchedule(scheduleId)
      .subscribe({

        next: response => {

          this.generating = false;

          this.generationSuccessMessage =

            `${response.totalMatches} match fixtures generated successfully. ` +

            `League matches: ${response.totalLeagueMatches}. ` +

            `Playoff matches: ${response.totalPlayoffMatches}.`;

          this.loadSchedule(scheduleId);

        },

        error: (error: HttpErrorResponse) => {

          this.generating = false;

          console.error(
            'Failed to generate fixtures:',
            error
          );

          this.generationErrorMessage =

            typeof error.error?.message === 'string'

              ? error.error.message

              : 'Unable to generate fixtures. Please verify tournament teams and scheduling configuration.';

        }

      });

  }

  // =====================================
  // 16. DOWNLOAD COMPLETE SCHEDULE PDF
  // =====================================

  get pdfReportLabel(): string {
    if (this.pdfTeamId !== 'ALL') {
      return this.pdfMatchDate !== 'ALL'
        ? 'Team and Date-wise Schedule' : 'Team-wise Schedule';
    }
    return this.pdfMatchDate !== 'ALL'
      ? 'Date-wise Schedule' : 'Complete Tournament Schedule';
  }

  resetPdfFilters(): void {
    this.pdfTeamId = 'ALL';
    this.pdfMatchDate = 'ALL';
    this.pdfErrorMessage = '';
  }

  get canDownloadPdf(): boolean {
    return !!this.schedule &&
      !this.loading &&
      !this.loadingFixtures &&
      !this.generating &&
      !this.downloadingPdf &&
      !this.errorMessage &&
      !this.fixtureErrorMessage &&
      this.fixtures.length > 0;
  }

  downloadSchedulePdf(): void {

    if (!this.schedule || !this.canDownloadPdf) {
      return;
    }

    const scheduleId = this.schedule.id;
    const teamId = this.pdfTeamId === 'ALL' ? undefined : this.pdfTeamId;
    const matchDate = this.pdfMatchDate === 'ALL' ? undefined : this.pdfMatchDate;
    const team = this.teamDraws.find(draw => draw.tournamentTeamId === teamId);

    if ((teamId && !team) || (matchDate && !this.fixtureDates.includes(matchDate))) {
      this.pdfErrorMessage = 'Please select a valid team and match date.';
      return;
    }

    const fallbackFileName = [
      this.schedule.name || 'match-schedule',
      'schedule',
      team?.teamName,
      matchDate
    ].filter(Boolean).join('-') + '.pdf';

    this.downloadingPdf = true;
    this.pdfErrorMessage = '';

    this.matchScheduleService.downloadSchedulePdf(scheduleId, teamId, matchDate)
      .pipe(finalize(() => this.downloadingPdf = false))
      .subscribe({
        next: response => {
          try {
            PdfDownloadUtil.download(response, fallbackFileName);
          } catch (error) {
            this.pdfErrorMessage = error instanceof Error
              ? error.message
              : 'Unable to download the match schedule PDF.';
          }
        },
        error: (error: HttpErrorResponse) => {
          this.pdfErrorMessage = 'Unable to download the match schedule PDF. Please try again.';
          if (error.error instanceof Blob) {
            void error.error.text().then(text => {
              const body = JSON.parse(text);
              if (typeof body?.message === 'string' && body.message.trim()) {
                this.pdfErrorMessage = body.message;
              }
            }).catch(() => { /* Retain the fallback message. */ });
          } else if (typeof error.error?.message === 'string') {
            this.pdfErrorMessage = error.error.message;
          }
        }
      });
  }

  // =====================================
  // 17. FORMAT TIME
  // =====================================

  formatTime(time: string | null): string {

    return time ? time.substring(0, 5) : '-';

  }

}
