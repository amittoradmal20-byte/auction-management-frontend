
import { Component, OnInit, inject } from '@angular/core';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { CricketGroupService } from '../../core/services/cricket-group';
import { CricketGroup } from '../../core/models/cricket-group/cricket-group.model';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cricket-groups',
  standalone: true,
  imports: [PageHeaderComponent, DatePipe, RouterLink],
  templateUrl: './cricket-groups.html',
  styleUrl: './cricket-groups.scss'
})
export class CricketGroups implements OnInit {

  private cricketGroupService = inject(CricketGroupService);

  cricketGroups: CricketGroup[] = [];

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadCricketGroups();
  }

  loadCricketGroups(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.cricketGroupService.getAllCricketGroups().subscribe({

      next: (response) => {
        this.cricketGroups = response;
        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error loading cricket groups:', error);

        this.errorMessage =
          'Unable to load cricket groups. Please try again.';

        this.isLoading = false;
      }

    });

  }

}
