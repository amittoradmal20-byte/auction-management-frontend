
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss'
})
export class PageHeaderComponent {

  @Input() title = '';

  @Input() description = '';

  @Input() breadcrumb = '';

  @Input() actionLabel = '';

  @Input() actionIcon = '';

  @Input() actionLink = '';

}
