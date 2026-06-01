import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-cards',
  imports: [],
  templateUrl: './dashboard-cards.html',
  styleUrl: './dashboard-cards.scss',
})
export class DashboardCards {
  @Input() title = '';
  @Input() value = 0;
  @Input() category = '';
  @Input() emptyText =''
  @Input() fullText =''
}
