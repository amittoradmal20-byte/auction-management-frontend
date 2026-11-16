
import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layout/main-layout/main-layout';

import { DashboardComponent } from './features/dashboard/dashboard';
import { Tournaments } from './features/tournaments/tournaments';
import { CricketGroups } from './features/cricket-groups/cricket-groups';
import { Players } from './features/players/players';
import { Teams } from './features/teams/teams';
import { Auctions } from './features/auctions/auctions';

export const routes: Routes = [

  {
    path: '',
    component: MainLayoutComponent,
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
