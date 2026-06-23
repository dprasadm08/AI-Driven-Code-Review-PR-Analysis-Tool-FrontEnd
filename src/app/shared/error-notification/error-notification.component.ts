import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ErrorService } from '../../core/services/error.service';
import { AppError } from '../../core/models/error.model';

/**
 * Global error notification container component
 * Displays errors as notifications/toasts at the top/bottom of the page
 * Place this component once in app.component.html
 */
@Component({
  selector: 'app-error-notification',
  templateUrl: './error-notification.component.html',
  styleUrls: ['./error-notification.component.css']
})
export class ErrorNotificationComponent implements OnInit, OnDestroy {
  errors: AppError[] = [];
  private destroy$ = new Subject<void>();

  constructor(private errorService: ErrorService) {}

  ngOnInit(): void {
    this.errorService.getErrors()
      .pipe(takeUntil(this.destroy$))
      .subscribe(errors => {
        this.errors = errors;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismissError(errorId: string): void {
    this.errorService.dismissError(errorId);
  }

  retryError(error: AppError): void {
    // Dispatch retry event - parent component should handle
    console.log('Retry requested for error:', error);
  }

  trackByErrorId(index: number, error: AppError): string {
    return error.id || index.toString();
  }
}
