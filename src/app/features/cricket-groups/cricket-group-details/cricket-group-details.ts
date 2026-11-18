
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CricketGroupService } from '../../../core/services/cricket-group';
import { CricketGroupPlayerService } from '../../../core/services/cricket-group-player';
import { PlayerService } from '../../../core/services/player';

import { CricketGroup } from '../../../core/models/cricket-group/cricket-group.model';
import { CricketGroupPlayer } from '../../../core/models/cricket-group-player/cricket-group-player.model';
import { Player } from '../../../core/models/player/player.model';

@Component({
  selector: 'app-cricket-group-details',
  standalone: true,
  imports: [RouterLink, DatePipe, ReactiveFormsModule],
  templateUrl: './cricket-group-details.html',
  styleUrl: './cricket-group-details.scss'
})
export class CricketGroupDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  private cricketGroupService = inject(CricketGroupService);
  private cricketGroupPlayerService = inject(CricketGroupPlayerService);
  private playerService = inject(PlayerService);

  cricketGroup: CricketGroup | null = null;
  cricketGroupPlayers: CricketGroupPlayer[] = [];

  availablePlayers: Player[] = [];

  groupId = '';

  isLoading = false;
  isPlayersLoading = false;
  isAvailablePlayersLoading = false;
  isAddingPlayer = false;

  // Membership status update
  updatingMembershipPlayerId: string | null = null;
  membershipErrorMessage = '';
  membershipSuccessMessage = '';

  errorMessage = '';
  playersErrorMessage = '';
  addPlayerErrorMessage = '';
  addPlayerSuccessMessage = '';

  addPlayerForm = this.fb.nonNullable.group({
    playerId: ['', Validators.required]
  });

  ngOnInit(): void {

    this.groupId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.groupId) {
      this.errorMessage = 'Invalid cricket group ID.';
      return;
    }

    this.loadCricketGroup();
    this.loadCricketGroupPlayers();
    this.loadAvailablePlayers();
  }

  loadCricketGroup(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.cricketGroupService.getCricketGroupById(this.groupId).subscribe({
      next: (response) => {
        this.cricketGroup = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cricket group details:', error);

        this.errorMessage =
          'Unable to load cricket group details. Please try again.';

        this.isLoading = false;
      }
    });
  }

  loadCricketGroupPlayers(): void {

    this.isPlayersLoading = true;
    this.playersErrorMessage = '';

    this.cricketGroupPlayerService.getGroupPlayers(this.groupId).subscribe({
      next: (response) => {
        this.cricketGroupPlayers = response;
        this.isPlayersLoading = false;
      },
      error: (error) => {
        console.error('Error loading cricket group players:', error);

        this.playersErrorMessage =
          'Unable to load cricket group players. Please try again.';

        this.isPlayersLoading = false;
      }
    });
  }

  loadAvailablePlayers(): void {

    this.isAvailablePlayersLoading = true;

    this.playerService.getAllPlayers('ACTIVE').subscribe({
      next: (response) => {
        this.availablePlayers = response;
        this.isAvailablePlayersLoading = false;
      },
      error: (error) => {
        console.error('Error loading available players:', error);

        this.addPlayerErrorMessage =
          'Unable to load available players. Please try again.';

        this.isAvailablePlayersLoading = false;
      }
    });
  }

  
get playersNotInGroup(): Player[] {

  // Exclude all existing group members,
  // including active and inactive memberships.
  const existingPlayerIds = new Set(
    this.cricketGroupPlayers.map(
      groupPlayer => groupPlayer.playerId
    )
  );

  return this.availablePlayers.filter(
    player => !existingPlayerIds.has(player.id)
  );
}


  addPlayerToGroup(): void {

    if (this.addPlayerForm.invalid || this.isAddingPlayer) {
      this.addPlayerForm.markAllAsTouched();
      return;
    }

    const playerId = this.addPlayerForm.getRawValue().playerId;

    if (!this.playersNotInGroup.some(player => player.id === playerId)) {
      this.addPlayerErrorMessage =
        'Please select an available player.';
      return;
    }

    this.isAddingPlayer = true;
    this.addPlayerErrorMessage = '';
    this.addPlayerSuccessMessage = '';

    this.cricketGroupPlayerService.addPlayerToGroup(
      this.groupId,
      { playerId }
    ).subscribe({
      next: () => {

        this.isAddingPlayer = false;
        this.addPlayerSuccessMessage =
          'Player added to cricket group successfully.';

        this.addPlayerForm.reset();
        this.loadCricketGroupPlayers();
      },
      error: (error) => {

        console.error('Error adding player to cricket group:', error);

        this.addPlayerErrorMessage =
          error.error?.message ||
          'Unable to add player to cricket group. Please try again.';

        this.isAddingPlayer = false;
      }
    });
  }

  // =====================================
  // Deactivate / Reactivate Membership
  // =====================================

  toggleMembershipStatus(groupPlayer: CricketGroupPlayer): void {

    if (this.updatingMembershipPlayerId !== null) {
      return;
    }

    const isActive = groupPlayer.active;
    const action = isActive ? 'deactivate' : 'reactivate';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${groupPlayer.playerDisplayName} in this cricket group?`
    );

    if (!confirmed) {
      return;
    }

    this.updatingMembershipPlayerId = groupPlayer.playerId;

    this.membershipErrorMessage = '';
    this.membershipSuccessMessage = '';

    const request$ = isActive
      ? this.cricketGroupPlayerService.deactivatePlayer(
          this.groupId,
          groupPlayer.playerId
        )
      : this.cricketGroupPlayerService.reactivatePlayer(
          this.groupId,
          groupPlayer.playerId
        );

    request$.subscribe({
      next: () => {

        this.updatingMembershipPlayerId = null;

        this.membershipSuccessMessage = isActive
          ? `${groupPlayer.playerDisplayName} deactivated from this cricket group successfully.`
          : `${groupPlayer.playerDisplayName} reactivated in this cricket group successfully.`;

        this.loadCricketGroupPlayers();
      },
      error: (error) => {

        console.error('Error updating cricket group membership:', error);

        this.membershipErrorMessage =
          error.error?.message ||
          'Unable to update cricket group membership. Please try again.';

        this.updatingMembershipPlayerId = null;
      }
    });
  }

}
