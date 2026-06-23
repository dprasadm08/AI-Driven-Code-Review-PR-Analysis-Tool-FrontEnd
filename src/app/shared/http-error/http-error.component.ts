import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppError } from '../../core/models/error.model';
import { ErrorService } from '../../core/services/error.service';

/**
 * Specialized error display component for HTTP errors
 * Shows different layouts based on error status code
 */
@Component({
  selector: 'app-http-error',
  templateUrl: './http-error.component.html',
  styleUrls: ['./http-error.component.css']
})
export class HttpErrorComponent {
  @Input() error: AppError | null = null;
  @Input() showDetails = false;
  @Output() retry = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();

  constructor(private errorService: ErrorService) {}

  get errorTitle(): string {
    return this.error ? this.errorService.getErrorTitle(this.error.type) : 'Error';
  }

  get errorIcon(): string {
    return this.error ? this.errorService.getErrorIcon(this.error.type) : '❓';
  }

  get showRetry(): boolean {
    return this.error?.retryable || false;
  }

  onRetry(): void {
    this.retry.emit();
  }

  onDismiss(): void {
    if (this.error?.dismissible) {
      this.dismiss.emit();
    }
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }
}
