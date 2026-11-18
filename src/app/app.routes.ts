
import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layout/main-layout/main-layout';

import { Login } from './features/auth/login/login';

import { DashboardComponent } from './features/dashboard/dashboard';

import { Tournaments } from './features/tournaments/tournaments';
import { TournamentCreate } from './features/tournaments/tournament-create/tournament-create';
import { TournamentDetails } from './features/tournaments/tournament-details/tournament-details';

import { CricketGroups } from './features/cricket-groups/cricket-groups';
import { CricketGroupCreate } from './features/cricket-groups/cricket-group-create/cricket-group-create';
import { CricketGroupDetails } from './features/cricket-groups/cricket-group-details/cricket-group-details';

import { Players } from './features/players/players';
import { PlayerCreate } from './features/players/player-create/player-create';
import { PlayerDetails } from './features/players/player-details/player-details';
import { PlayerEdit } from './features/players/player-edit/player-edit';

import { Teams } from './features/teams/teams';
import { TeamCreate } from './features/teams/team-create/team-create';
import { TeamDetails } from './features/teams/team-details/team-details';
import { TeamEdit } from './features/teams/team-edit/team-edit';

import { Auctions } from './features/auctions/auctions';
import { AuctionCreate } from './features/auctions/auction-create/auction-create';
import { AuctionDetails } from './features/auctions/auction-details/auction-details';
import { AuctionEdit } from './features/auctions/auction-edit/auction-edit';



import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [

  // =====================================
  // Public Authentication Route
  // =====================================

  {
    path: 'login',
    component: Login
  },

  // =====================================
  // Main Application Layout
  // =====================================

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

      // =====================================
      // Dashboard
      // =====================================

      {
        path: 'dashboard',
        component: DashboardComponent
      },

      // =====================================
      // Tournaments
      // =====================================

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

      // =====================================
      // Cricket Groups
      // =====================================

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

      // =====================================
      // Players
      // =====================================

      {
        path: 'players/create',
        component: PlayerCreate
      },

      {
        path: 'players/:id/edit',
        component: PlayerEdit
      },

      {
        path: 'players/:id',
        component: PlayerDetails
      },

      {
        path: 'players',
        component: Players
      },

      // =====================================
      // Teams
      // =====================================


      {
        path: 'teams/create',
        component: TeamCreate
      },

      {
        path: 'teams/:id/edit',
        component: TeamEdit
      },

      {
        path: 'teams/:id',
        component: TeamDetails
      },

      {
        path: 'teams',
        component: Teams
      },


      // =====================================
      // Auctions
      // =====================================

      
      {
        path: 'auctions',
        component: Auctions
      },
      {
        path: 'auctions/create',
        component: AuctionCreate
      },
      {
        path: 'auctions/:id/edit',
        component: AuctionEdit
      },
      {
        path: 'auctions/:id',
        component: AuctionDetails
      }

    ]
  },

  // =====================================
  // Fallback Route
  // =====================================

  {
    path: '**',
    redirectTo: 'dashboard'
  }

];
