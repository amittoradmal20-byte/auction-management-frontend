
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  NavigationEnd
} from '@angular/router';
import { filter, Subscription } from 'rxjs';

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

  private routerSubscription?: Subscription;

  constructor(private router: Router) {

  }

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

  ngOnDestroy(): void {

    this.routerSubscription?.unsubscribe();

  }

}
