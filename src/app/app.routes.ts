
import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { TournamentDetails } from './features/tournaments/tournament-details/tournament-details';

import { Login } from './features/auth/login/login';

import { DashboardComponent } from './features/dashboard/dashboard';
import { Tournaments } from './features/tournaments/tournaments';
import { CricketGroups } from './features/cricket-groups/cricket-groups';
import { Players } from './features/players/players';
import { Teams } from './features/teams/teams';
import { Auctions } from './features/auctions/auctions';
import { authGuard } from './core/guards/auth-guard';
import { TournamentCreate } from './features/tournaments/tournament-create/tournament-create';
import { CricketGroupDetails } from './features/cricket-groups/cricket-group-details/cricket-group-details';
import { CricketGroupCreate } from './features/cricket-groups/cricket-group-create/cricket-group-create';

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
        path: 'tournaments/create',
        component: TournamentCreate
      },

      {
        path: 'tournaments/:id/edit',
        component: TournamentCreate
      },

      {
        path: 'tournaments/:id',
        component: TournamentDetails
      },

      {
        path: 'tournaments',
        component: Tournaments
      },

      {
        path: 'cricket-groups/create',
        component: CricketGroupCreate
      },

      {
        path: 'cricket-groups/:id',
        component: CricketGroupDetails
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
