
import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { PlayerService } from '../../core/services/player';
import { Player } from '../../core/models/player/player.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [
  PageHeaderComponent, DatePipe,  RouterLink],
  templateUrl: './players.html',
  styleUrl: './players.scss'
})
export class Players implements OnInit {

  private playerService = inject(PlayerService);

  players: Player[] = [];

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.playerService.getAllPlayers().subscribe({
      next: (response) => {
        this.players = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading players:', error);

        this.errorMessage =
          'Unable to load players. Please try again.';

        this.isLoading = false;
      }
    });
  }

}
