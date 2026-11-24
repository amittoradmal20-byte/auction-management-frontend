import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatchScheduleService } from '../../../core/services/match-schedule';
import { MatchScheduleResponse } from '../../../core/models/match-schedule/match-schedule.model';
import { MatchScheduleFixtureResponse, MatchScheduleTeamDrawResponse } from '../../../core/models/match-schedule/match-schedule-generation.model';
import { TournamentService } from '../../../core/services/tournament';

@Component({
  selector: 'app-match-schedule-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './match-schedule-details.html',
  styleUrl: './match-schedule-details.scss'
})
export class MatchScheduleDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly matchScheduleService = inject(MatchScheduleService);
  private readonly tournamentService = inject(TournamentService);

  scheduleId = '';
  schedule: MatchScheduleResponse | null = null;
  tournamentName = '';
  teamDraws: MatchScheduleTeamDrawResponse[] = [];
  fixtures: MatchScheduleFixtureResponse[] = [];
  loading = false;
  loadingTournament = false;
  loadingFixtures = false;
  generating = false;
  errorMessage = '';
  fixtureErrorMessage = '';
  generationErrorMessage = '';
  generationSuccessMessage = '';
  viewMode: 'table' | 'cards' = 'table';
  selectedDate = 'ALL';

  get fixtureDates(): string[] {
    return [...new Set(this.fixtures.flatMap(f => f.matchDate ? [f.matchDate] : []))].sort();
  }

  get filteredFixtures(): MatchScheduleFixtureResponse[] {
    return this.selectedDate === 'ALL' ? this.fixtures :
      this.fixtures.filter(f => this.selectedDate === 'TBD' ? !f.matchDate : f.matchDate === this.selectedDate);
  }

  get hasUndatedFixtures(): boolean { return this.fixtures.some(f => !f.matchDate); }
  get leagueFixtures(): MatchScheduleFixtureResponse[] { return this.fixtures.filter(f => f.matchStage === 'LEAGUE'); }
  get teamDistribution() {
    const league = this.leagueFixtures;
    return this.teamDraws.map(team => {
      const matches = league.filter(f => f.homeTournamentTeamId === team.tournamentTeamId || f.awayTournamentTeamId === team.tournamentTeamId);
      return { id: team.id, name: team.teamName, total: matches.length,
        daily: this.fixtureDates.map(date => matches.filter(f => f.matchDate === date).length) };
    });
  }
  get skippedPairings() {
    if (this.schedule?.leagueFormat !== 'PARTIAL_ROUND_ROBIN' || !this.leagueFixtures.length) return [];
    const played = new Set(this.leagueFixtures.map(f => [f.homeTournamentTeamId, f.awayTournamentTeamId].sort().join('|')));
    return this.teamDraws.flatMap((a, i) => this.teamDraws.slice(i + 1)
      .filter(b => !played.has([a.tournamentTeamId, b.tournamentTeamId].sort().join('|')))
      .map(b => ({ id: `${a.id}-${b.id}`, home: a.teamName, away: b.teamName })));
  }
  get equalLeagueMatches(): boolean {
    const counts = this.teamDistribution;
    return counts.length > 0 && this.leagueFixtures.length > 0 && counts.every(t => t.total === counts[0].total);
  }
  countForDate(date: string): number { return this.fixtures.filter(f => f.matchDate === date).length; }

  ngOnInit(): void {
    this.scheduleId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.scheduleId) { this.errorMessage = 'Invalid Match Schedule ID.'; return; }
    this.loadSchedule(this.scheduleId);
  }
  loadSchedule(scheduleId: string): void {
    if (!scheduleId) return;
    this.loading = true;
    this.errorMessage = '';
    this.matchScheduleService.getScheduleById(scheduleId).subscribe({
      next: response => {
        this.schedule = response;
        this.loading = false;
        this.loadTournamentName(response.tournamentId);
        this.loadGeneratedData(scheduleId);
      },
      error: error => {
        console.error('Failed to load schedule:', error);
        this.errorMessage = 'Unable to load Match Schedule details. Please try again.';
        this.loading = false;
      }
    });
  }
  loadTournamentName(tournamentId: string): void {
    if (!tournamentId) { this.tournamentName = 'N/A'; return; }
    this.loadingTournament = true;
    this.tournamentService.getAllTournaments().subscribe({
      next: tournaments => {
        this.tournamentName = tournaments.find(item => item.id === tournamentId)?.name ?? 'N/A';
        this.loadingTournament = false;
      },
      error: error => {
        console.error('Failed to load tournament:', error);
        this.tournamentName = 'N/A';
        this.loadingTournament = false;
      }
    });
  }
  loadGeneratedData(scheduleId: string): void {
    this.loadingFixtures = true;
    this.fixtureErrorMessage = '';
    this.teamDraws = [];
    this.fixtures = [];
    this.selectedDate = 'ALL';
    forkJoin({ teamDraws: this.matchScheduleService.getTeamDraws(scheduleId), fixtures: this.matchScheduleService.getFixtures(scheduleId) }).subscribe({
      next: response => {
        this.teamDraws = [...response.teamDraws].sort((a,b) => a.randomNumber - b.randomNumber);
        this.fixtures = [...response.fixtures].sort((a,b) => a.matchNumber - b.matchNumber);
        this.loadingFixtures = false;
      },
      error: error => {
        console.error('Failed to load generated data:', error);
        this.fixtureErrorMessage = 'Unable to load team draws and match fixtures.';
        this.loadingFixtures = false;
      }
    });
  }
  generateFixtures(): void {
    if (!this.schedule || this.schedule.status !== 'DRAFT' || this.generating || this.loading || this.loadingFixtures || (this.schedule.totalMatches ?? 0) > 0) return;
    const scheduleId = this.schedule.id;
    this.generating = true;
    this.generationErrorMessage = '';
    this.generationSuccessMessage = '';
    this.matchScheduleService.generateSchedule(scheduleId).subscribe({
      next: response => {
        this.generating = false;
        this.generationSuccessMessage = `${response.totalMatches} match fixtures generated successfully.`;
        this.loadSchedule(scheduleId);
      },
      error: (error: HttpErrorResponse) => {
        this.generating = false;
        console.error('Failed to generate fixtures:', error);
        this.generationErrorMessage = typeof error.error?.message === 'string' ? error.error.message : 'Unable to generate fixtures. Please verify tournament teams and scheduling configuration.';
      }
    });
  }
  formatTime(time: string | null): string { return time ? time.substring(0,5) : '-'; }
}
