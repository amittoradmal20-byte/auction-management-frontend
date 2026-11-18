
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { CricketGroupService } from '../../../core/services/cricket-group';
import { CricketGroupPlayerService } from '../../../core/services/cricket-group-player';

import { CricketGroup } from '../../../core/models/cricket-group/cricket-group.model';
import { CricketGroupPlayer } from '../../../core/models/cricket-group-player/cricket-group-player.model';

@Component({
  selector: 'app-cricket-group-details',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './cricket-group-details.html',
  styleUrl: './cricket-group-details.scss'
})
export class CricketGroupDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private cricketGroupService = inject(CricketGroupService);
  private cricketGroupPlayerService = inject(CricketGroupPlayerService);

  cricketGroup: CricketGroup | null = null;
  cricketGroupPlayers: CricketGroupPlayer[] = [];

  groupId = '';

  isLoading = false;
  isPlayersLoading = false;

  errorMessage = '';
  playersErrorMessage = '';

  ngOnInit(): void {

    this.groupId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.groupId) {
      this.errorMessage = 'Invalid cricket group ID.';
      return;
    }

    this.loadCricketGroup();
    this.loadCricketGroupPlayers();
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

}
