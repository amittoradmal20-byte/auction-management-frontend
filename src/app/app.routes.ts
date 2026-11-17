
import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layout/main-layout/main-layout';

import { Login } from './features/auth/login/login';

import { DashboardComponent } from './features/dashboard/dashboard';
import { Tournaments } from './features/tournaments/tournaments';
import { CricketGroups } from './features/cricket-groups/cricket-groups';
import { Players } from './features/players/players';
import { Teams } from './features/teams/teams';
import { Auctions } from './features/auctions/auctions';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [

  // Public authentication route
  {
    path: 'login',
    component: Login
  },

  // Main application layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        component: DashboardComponent
      },

      {
        path: 'tournaments',
        component: Tournaments
      },

      {
        path: 'cricket-groups',
        component: CricketGroups
      },

      {
        path: 'players',
        component: Players
      },

      {
        path: 'teams',
        component: Teams
      },

      {
        path: 'auctions',
        component: Auctions
      }

    ]
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }

];
