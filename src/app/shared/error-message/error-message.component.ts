import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css']
})
export class ErrorMessageComponent {
  @Input() message: string = '';
  @Input() type: 'error' | 'warning' | 'info' = 'error';
  @Input() showRetry = false;
  @Input() retryText = 'Try Again';
  @Input() retrying = false;

  @Output() retry = new EventEmitter<void>();
}
