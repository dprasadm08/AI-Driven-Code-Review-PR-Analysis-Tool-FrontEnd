import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.css']
})
export class EmptyStateComponent {
  @Input() icon = 'ℹ️';
  @Input() title = 'No data available';
  @Input() description = 'There is nothing to display right now.';
}
