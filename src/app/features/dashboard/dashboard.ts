
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DashboardService } from '../../core/services/dashboard';
import { DashboardSummary } from '../../core/models/dashboard/dashboard-summary.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {

  private dashboardService = inject(DashboardService);

  dashboardSummary: DashboardSummary | null = null;

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDashboardSummary();
  }

  loadDashboardSummary(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboardSummary().subscribe({

      next: (response) => {
        this.dashboardSummary = response;
        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error loading dashboard summary:', error);

        this.errorMessage = 'Unable to load dashboard statistics. Please try again.';
        this.isLoading = false;
      }

    });
  }

}
