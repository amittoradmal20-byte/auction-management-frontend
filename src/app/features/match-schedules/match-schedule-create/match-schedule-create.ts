
import {
  Component,
  OnInit,
  DestroyRef,
  inject
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { TournamentTeamService } from '../../../core/services/tournament-team';
import { TournamentTeamResponse } from '../../../core/models/tournament-team/tournament-team.model';

import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatchScheduleService } from '../../../core/services/match-schedule';

import { CommonModule } from '@angular/common';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { RouterLink } from '@angular/router';

import { TournamentService } from '../../../core/services/tournament';

import { Tournament } from '../../../core/models/tournament/tournament.model';

import {
  DayOfWeek,
  SchedulingType,
  LeagueFormat
} from '../../../core/models/match-schedule/match-schedule.model';

import { MatchScheduleCreateRequest } from '../../../core/models/match-schedule/match-schedule-create-request.model';


// =====================================
// 1. DATE RANGE VALIDATOR
// =====================================

export const scheduleDateRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;

  if (!startDate || !endDate) {
    return null;
  }

  return endDate < startDate
    ? { invalidDateRange: true }
    : null;
};




// =====================================
// 2. DAILY TIME RANGE VALIDATOR
// =====================================

export const scheduleTimeRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const startTime = control.get('dailyStartTime')?.value;
  const endTime = control.get('dailyEndTime')?.value;

  if (!startTime || !endTime) {
    return null;
  }

  return endTime <= startTime
    ? { invalidTimeRange: true }
    : null;
};


// =====================================
// LEAGUE CONFIGURATION VALIDATOR
// =====================================

export const leagueConfigurationValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const leagueFormat = control.get('leagueFormat')?.value;
  const opponentsToSkip = control.get('opponentsToSkip')?.value;

  if (
    opponentsToSkip === null ||
    opponentsToSkip === undefined ||
    !Number.isInteger(opponentsToSkip) ||
    opponentsToSkip < 0
  ) {
    return { invalidOpponentsToSkip: true };
  }

  if (leagueFormat === 'PARTIAL_ROUND_ROBIN') {
    return opponentsToSkip < 1
      ? { partialRoundRobinSkipRequired: true }
      : null;
  }

  return opponentsToSkip !== 0
    ? { opponentsToSkipNotAllowed: true }
    : null;
};

// =====================================
// 3. COMPONENT
// =====================================

@Component({
  selector: 'app-match-schedule-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './match-schedule-create.html',
  styleUrl: './match-schedule-create.scss'
})
export class MatchScheduleCreate implements OnInit {

  private readonly fb = inject(FormBuilder);

  private readonly tournamentService =
    inject(TournamentService);


  // =====================================
  // 4. COMPONENT STATE
  // =====================================

  private readonly tournamentTeamService = inject(TournamentTeamService);
  private readonly destroyRef = inject(DestroyRef);

  activeTournamentTeams: TournamentTeamResponse[] = [];
  loadingTournamentTeams = false;
  tournamentTeamsLoaded = false;
  tournamentTeamsError = '';

  tournaments: Tournament[] = [];

  loadingTournaments = false;

  errorMessage = '';

  schedulingErrorMessage = '';

  validationSuccessMessage = '';

  // Dates managed separately from the form
  selectedDates: string[] = [];

  excludedDates: string[] = [];

  selectedDateInput = '';

  excludedDateInput = '';

  allowedDaysOfWeek: DayOfWeek[] = [];

  private readonly matchScheduleService =
  inject(MatchScheduleService);

private readonly router = inject(Router);

saving = false;


  // =====================================
  // 5. AVAILABLE WEEKDAYS
  // =====================================

  readonly weekdays: {
    value: DayOfWeek;
    label: string;
  }[] = [

    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
    { value: 'SUNDAY', label: 'Sunday' }

  ];


  // =====================================
  // 6. REACTIVE FORM
  // =====================================

  scheduleForm = this.fb.group({

    tournamentId: [
      '',
      Validators.required
    ],

    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(150),
        Validators.pattern(/.*\S.*/)
      ]
    ],

    schedulingType: [
      'DAILY',
      Validators.required
    ],

    leagueFormat: [
      'SINGLE_ROUND_ROBIN',
      Validators.required
    ],

    opponentsToSkip: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    playoffFormat: [
      'NONE',
      Validators.required
    ],

    qualifyingTeamCount: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    startDate: [
      '',
      Validators.required
    ],

    endDate: [
      '',
      Validators.required
    ],

    dailyStartTime: [
      '07:00',
      Validators.required
    ],

    dailyEndTime: [
      '18:00',
      Validators.required
    ],

    matchDurationMinutes: [
      60,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    breakBetweenMatchesMinutes: [
      5,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    minimumRestMinutes: [
      60,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    minimumMatchesBetweenAppearances: [
      1,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    maxMatchesPerTeamPerDay: [
      3,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    numberOfGrounds: [
      1,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(20)
      ]
    ],

    randomSeed: [null as number | null]

  }, {
    validators: [
      scheduleDateRangeValidator,
      scheduleTimeRangeValidator,
      leagueConfigurationValidator
    ]
  });


  // =====================================
  // 7. INITIALIZATION
  // =====================================

  ngOnInit(): void {

    this.loadTournaments();
    this.f.tournamentId.valueChanges.pipe(
      startWith(this.f.tournamentId.value),
      distinctUntilChanged(),
      switchMap(tournamentId => {
        this.activeTournamentTeams = [];
        this.tournamentTeamsLoaded = false;
        this.tournamentTeamsError = '';
        this.loadingTournamentTeams = !!tournamentId;
        this.syncOpponentSkip();
        if (!tournamentId) {
          return of({ teams: [] as TournamentTeamResponse[], loaded: false, error: '' });
        }
        return this.tournamentTeamService.getTeamsByTournament(tournamentId).pipe(
          map(teams => ({ teams, loaded: true, error: '' })),
          catchError(() => of({ teams: [] as TournamentTeamResponse[], loaded: false,
            error: 'Unable to load tournament teams. Please reselect the tournament.' }))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => {
      this.activeTournamentTeams = result.teams.filter(team => team.status === 'ACTIVE');
      this.tournamentTeamsLoaded = result.loaded;
      this.tournamentTeamsError = result.error;
      this.loadingTournamentTeams = false;
      this.syncOpponentSkip();
    });

    this.f.leagueFormat.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.onLeagueFormatChange());

  }


  get f() {
    return this.scheduleForm.controls;
  }


  get schedulingType(): SchedulingType {

    return this.f.schedulingType.value as SchedulingType;

  }


  get leagueFormat(): LeagueFormat {
    return this.f.leagueFormat.value as LeagueFormat;
  }

  get isPartialRoundRobin(): boolean {
    return this.leagueFormat === 'PARTIAL_ROUND_ROBIN';
  }

  get opponentsToSkip(): number {
    return this.f.opponentsToSkip.value ?? 0;
  }

  get activeTeamCount(): number {
    return this.activeTournamentTeams.length;
  }

  get validSkipOptions(): number[] {
    const n = this.activeTeamCount;
    return Array.from({ length: Math.max(0, n - 2) }, (_, i) => i + 1)
      .filter(skip => n * (n - 1 - skip) % 2 === 0);
  }

  get matchesPerTeam(): number | null {
    if (!this.tournamentTeamsLoaded || this.activeTeamCount < 2) return null;
    const n = this.activeTeamCount;
    if (this.isPartialRoundRobin) {
      return this.validSkipOptions.includes(this.opponentsToSkip)
        ? n - 1 - this.opponentsToSkip : null;
    }
    return this.leagueFormat === 'DOUBLE_ROUND_ROBIN' ? 2 * (n - 1) : n - 1;
  }

  get totalLeagueMatches(): number | null {
    const matches = this.matchesPerTeam;
    return matches === null ? null : this.activeTeamCount * matches / 2;
  }

  private syncOpponentSkip(): void {
    const options = this.validSkipOptions;
    const value = !this.isPartialRoundRobin ? 0
      : options.includes(this.opponentsToSkip) ? this.opponentsToSkip : (options[0] ?? 0);
    this.f.opponentsToSkip.setValue(value, { emitEvent: false });
  }

  // =====================================
  // 8. LOAD TOURNAMENTS
  // =====================================

  loadTournaments(): void {

    this.loadingTournaments = true;
    this.errorMessage = '';

    this.tournamentService
      .getAllTournaments()
      .subscribe({

        next: (response) => {

          this.tournaments = response;

          this.loadingTournaments = false;

        },

        error: (error) => {

          console.error(
            'Unable to load tournaments:',
            error
          );

          this.errorMessage =
            'Unable to load tournaments. Please try again.';

          this.loadingTournaments = false;

        }

      });

  }


  // =====================================
  // 9. SCHEDULING TYPE CHANGE
  // =====================================

  onSchedulingTypeChange(): void {

    this.allowedDaysOfWeek = [];

    this.selectedDates = [];

    this.excludedDates = [];

    this.selectedDateInput = '';

    this.excludedDateInput = '';

    this.schedulingErrorMessage = '';

    this.validationSuccessMessage = '';

  }


  // =====================================
  // LEAGUE FORMAT CHANGE
  // =====================================

  onLeagueFormatChange(): void {

    this.errorMessage = '';
    this.validationSuccessMessage = '';

    this.syncOpponentSkip();

    this.f.opponentsToSkip.markAsUntouched();
    this.scheduleForm.updateValueAndValidity();

  }

  // =====================================
  // 10. WEEKDAY SELECTION
  // =====================================

  isWeekdaySelected(day: DayOfWeek): boolean {

    return this.allowedDaysOfWeek.includes(day);

  }


  toggleWeekday(
    day: DayOfWeek,
    checked: boolean
  ): void {

    this.schedulingErrorMessage = '';
    this.validationSuccessMessage = '';

    if (checked) {

      if (!this.allowedDaysOfWeek.includes(day)) {

        this.allowedDaysOfWeek = [
          ...this.allowedDaysOfWeek,
          day
        ];

      }

    } else {

      this.allowedDaysOfWeek =
        this.allowedDaysOfWeek.filter(
          selectedDay => selectedDay !== day
        );

    }

  }


  // =====================================
  // 11. ADD SELECTED PLAYING DATE
  // =====================================

  addSelectedDate(): void {

    this.schedulingErrorMessage = '';
    this.validationSuccessMessage = '';

    const date = this.selectedDateInput;

    if (!date) {

      this.schedulingErrorMessage =
        'Please select a playing date.';

      return;

    }

    if (!this.isDateWithinRange(date)) {

      this.schedulingErrorMessage =
        'Playing date must be within the schedule date range.';

      return;

    }

    if (this.selectedDates.includes(date)) {

      this.schedulingErrorMessage =
        'This playing date has already been selected.';

      return;

    }

    if (this.excludedDates.includes(date)) {

      this.schedulingErrorMessage =
        'This date is already excluded. Remove the exclusion first.';

      return;

    }

    if (
      this.schedulingType === 'TWO_DAY' &&
      this.selectedDates.length >= 2
    ) {

      this.schedulingErrorMessage =
        'TWO_DAY scheduling allows exactly 2 playing dates.';

      return;

    }

    if (
      this.schedulingType === 'THREE_DAY' &&
      this.selectedDates.length >= 3
    ) {

      this.schedulingErrorMessage =
        'THREE_DAY scheduling allows exactly 3 playing dates.';

      return;

    }

    this.selectedDates = [
      ...this.selectedDates,
      date
    ].sort();

    this.selectedDateInput = '';

  }


  // =====================================
  // 12. REMOVE SELECTED DATE
  // =====================================

  removeSelectedDate(date: string): void {

    this.selectedDates =
      this.selectedDates.filter(
        selectedDate => selectedDate !== date
      );

    this.schedulingErrorMessage = '';
    this.validationSuccessMessage = '';

  }


  // =====================================
  // 13. ADD EXCLUDED DATE
  // =====================================

  addExcludedDate(): void {

    this.schedulingErrorMessage = '';
    this.validationSuccessMessage = '';

    const date = this.excludedDateInput;

    if (!date) {

      this.schedulingErrorMessage =
        'Please select an excluded date.';

      return;

    }

    if (!this.isDateWithinRange(date)) {

      this.schedulingErrorMessage =
        'Excluded date must be within the schedule date range.';

      return;

    }

    if (this.excludedDates.includes(date)) {

      this.schedulingErrorMessage =
        'This date has already been excluded.';

      return;

    }

    if (this.selectedDates.includes(date)) {

      this.schedulingErrorMessage =
        'This date is selected as a playing date. Remove it from selected dates first.';

      return;

    }

    this.excludedDates = [
      ...this.excludedDates,
      date
    ].sort();

    this.excludedDateInput = '';

  }


  // =====================================
  // 14. REMOVE EXCLUDED DATE
  // =====================================

  removeExcludedDate(date: string): void {

    this.excludedDates =
      this.excludedDates.filter(
        excludedDate => excludedDate !== date
      );

    this.schedulingErrorMessage = '';
    this.validationSuccessMessage = '';

  }


  // =====================================
  // 15. DATE RANGE CHECK
  // =====================================

  isDateWithinRange(date: string): boolean {

    const startDate = this.f.startDate.value;
    const endDate = this.f.endDate.value;

    if (!startDate || !endDate) {
      return false;
    }

    return date >= startDate && date <= endDate;

  }


  // =====================================
  // 16. PLAYING DATE VALIDATION
  // =====================================

  validateSchedulingConfiguration(): boolean {

    this.schedulingErrorMessage = '';

    const type = this.schedulingType;

    if (type === 'WEEKLY' || type === 'WEEKEND') {

      if (this.allowedDaysOfWeek.length === 0) {

        this.schedulingErrorMessage =
          'Please select at least one playing weekday.';

        return false;

      }

    }

    if (type === 'WEEKEND') {

      const invalidDays =
        this.allowedDaysOfWeek.some(
          day =>
            day !== 'SATURDAY' &&
            day !== 'SUNDAY'
        );

      if (invalidDays) {

        this.schedulingErrorMessage =
          'Weekend scheduling only allows Saturday and Sunday.';

        return false;

      }

    }

    if (
      type === 'TWO_DAY' &&
      this.selectedDates.length !== 2
    ) {

      this.schedulingErrorMessage =
        'Please select exactly 2 playing dates.';

      return false;

    }

    if (
      type === 'THREE_DAY' &&
      this.selectedDates.length !== 3
    ) {

      this.schedulingErrorMessage =
        'Please select exactly 3 playing dates.';

      return false;

    }

    if (
      type === 'CUSTOM' &&
      this.selectedDates.length === 0
    ) {

      this.schedulingErrorMessage =
        'Please select at least one playing date.';

      return false;

    }

    const datesToCheck = [
      ...this.selectedDates,
      ...this.excludedDates
    ];

    if (
      datesToCheck.some(
        date => !this.isDateWithinRange(date)
      )
    ) {

      this.schedulingErrorMessage =
        'All selected and excluded dates must be within the schedule date range.';

      return false;

    }

    if (
      this.selectedDates.some(
        date => this.excludedDates.includes(date)
      )
    ) {

      this.schedulingErrorMessage =
        'A playing date cannot also be excluded.';

      return false;

    }

    // Verify that the scheduling rules leave
    // at least one available playing date.
    const startDate = this.f.startDate.value;
    const endDate = this.f.endDate.value;

    if (!startDate || !endDate) {
      return false;
    }

    const excluded = new Set(this.excludedDates);
    let availableDates = 0;

    if (
      type === 'TWO_DAY' ||
      type === 'THREE_DAY' ||
      type === 'CUSTOM'
    ) {

      availableDates = this.selectedDates.filter(
        date => !excluded.has(date)
      ).length;

    } else {

      const current = new Date(`${startDate}T00:00:00`);
      const last = new Date(`${endDate}T00:00:00`);

      const jsWeekdays: DayOfWeek[] = [
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY'
      ];

      while (current <= last) {

        const date =
          `${current.getFullYear()}-` +
          `${String(current.getMonth() + 1).padStart(2, '0')}-` +
          `${String(current.getDate()).padStart(2, '0')}`;

        const day = jsWeekdays[current.getDay()];

        const dayAllowed =
          type === 'DAILY' ||
          this.allowedDaysOfWeek.includes(day);

        if (dayAllowed && !excluded.has(date)) {
          availableDates++;
          break;
        }

        current.setDate(current.getDate() + 1);

      }

    }

    if (availableDates === 0) {

      this.schedulingErrorMessage =
        'No available playing dates remain after applying scheduling rules and exclusions.';

      return false;

    }

    return true;

  }


  // =====================================
  // 17. BUILD API REQUEST
  // =====================================

  buildCreateRequest(): MatchScheduleCreateRequest {

    const form = this.scheduleForm.getRawValue();

    return {

      tournamentId: form.tournamentId!,

      name: form.name!.trim(),

      schedulingType:
        form.schedulingType as SchedulingType,

      leagueFormat: form.leagueFormat!,

      opponentsToSkip:
        form.leagueFormat === 'PARTIAL_ROUND_ROBIN'
          ? form.opponentsToSkip!
          : 0,

      playoffFormat: form.playoffFormat!,

      qualifyingTeamCount:
        form.qualifyingTeamCount!,

      startDate: form.startDate!,

      endDate: form.endDate!,

      allowedDaysOfWeek:
        [...this.allowedDaysOfWeek],

      selectedDates:
        [...this.selectedDates],

      excludedDates:
        [...this.excludedDates],

      dailyStartTime:
        `${form.dailyStartTime!}:00`,

      dailyEndTime:
        `${form.dailyEndTime!}:00`,

      matchDurationMinutes:
        form.matchDurationMinutes!,

      breakBetweenMatchesMinutes:
        form.breakBetweenMatchesMinutes!,

      minimumRestMinutes:
        form.minimumRestMinutes!,

      minimumMatchesBetweenAppearances:
        form.minimumMatchesBetweenAppearances!,

      maxMatchesPerTeamPerDay:
        form.maxMatchesPerTeamPerDay!,

      numberOfGrounds:
        form.numberOfGrounds!,

      randomSeed:
        form.randomSeed ?? null

    };

  }


  // =====================================
  // 18. VALIDATE FORM
  // =====================================

  
createSchedule(): void {

  if (this.saving) {
    return;
  }

  this.errorMessage = '';
  this.schedulingErrorMessage = '';
  this.validationSuccessMessage = '';

  // =====================================
  // 1. VALIDATE REACTIVE FORM
  // =====================================

  if (this.isPartialRoundRobin) {
    if (this.loadingTournamentTeams || !this.tournamentTeamsLoaded) {
      this.errorMessage = this.tournamentTeamsError || 'Select a tournament and wait for its teams to load.';
      return;
    }
    if (!this.validSkipOptions.includes(this.opponentsToSkip)) {
      this.errorMessage = 'No valid opponent skip selection for the active tournament teams.';
      return;
    }
  }

  if (this.scheduleForm.invalid) {

    this.scheduleForm.markAllAsTouched();

    this.errorMessage =
      'Please correct the highlighted form fields.';

    return;
  }

  // =====================================
  // 2. VALIDATE SCHEDULING CONFIGURATION
  // =====================================

  if (!this.validateSchedulingConfiguration()) {
    return;
  }

  // =====================================
  // 3. BUILD CREATE REQUEST
  // =====================================

  const request = this.buildCreateRequest();

  console.log(
    'Creating Match Schedule:',
    request
  );

  // =====================================
  // 4. CALL SPRING BOOT API
  // =====================================

  this.saving = true;

  this.matchScheduleService
    .createSchedule(request)
    .subscribe({

      next: (response) => {

        this.saving = false;

        console.log(
          'Match Schedule Created Successfully:',
          response
        );

        this.router.navigate(
          ['/match-schedules'],
          {
            queryParams: {
              tournamentId: response.tournamentId
            }
          }
        );

      },

      error: (error: HttpErrorResponse) => {

        this.saving = false;

        console.error(
          'Failed to create Match Schedule:',
          error
        );

        if (error.status === 400) {

          this.errorMessage =
            error.error?.message ||
            'Invalid match schedule configuration.';

        } else if (error.status === 401) {

          this.errorMessage =
            'Your session has expired. Please log in again.';

        } else if (error.status === 403) {

          this.errorMessage =
            'You do not have permission to create a match schedule.';

        } else if (error.status === 409) {

          this.errorMessage =
            error.error?.message ||
            'A conflicting match schedule already exists.';

        } else {

          this.errorMessage =
            'Unable to create match schedule. Please try again.';

        }

      }

    });

}


}
