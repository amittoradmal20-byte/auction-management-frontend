
import { Component, OnDestroy, OnInit } from '@angular/core';

import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  NavigationEnd
} from '@angular/router';

import { filter, Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  pageTitle = 'Dashboard';

  isLoggingOut = false;

  isTestingTokenRefresh = false;

  tokenRefreshTestMessage = ''; 

  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.updatePageTitle(this.router.url);

    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {

        this.updatePageTitle(event.urlAfterRedirects);

      });

  }

  private updatePageTitle(url: string): void {

    const route = url.split('?')[0].split('#')[0];

    const pageTitles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/tournaments': 'Tournaments',
      '/cricket-groups': 'Cricket Groups',
      '/players': 'Players',
      '/teams': 'Teams',
      '/auctions': 'Auctions'
    };

    this.pageTitle = pageTitles[route] ?? 'Dashboard';

  }

  logout(): void {

    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;

    this.authService.logout().subscribe({

      next: () => {
        this.isLoggingOut = false;
        this.router.navigate(['/login']);
      },

      error: () => {
        // Local tokens are cleared by AuthService even if
        // the backend logout request fails.
        this.isLoggingOut = false;
        this.router.navigate(['/login']);
      }

    });

  }

  ngOnDestroy(): void {

    this.routerSubscription?.unsubscribe();

  }

}
