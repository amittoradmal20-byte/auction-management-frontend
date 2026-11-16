
import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './players.html',
  styleUrl: './players.scss'
})
export class Players {

}
