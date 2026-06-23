# Global Error Handling Architecture

## Overview
This document describes the global error handling system implemented in the Angular frontend. It provides centralized error management, consistent error UI patterns, and comprehensive error recovery strategies.

## Architecture

### Components & Services

1. **ErrorService** (`src/app/core/services/error.service.ts`)
   - Centralized service for managing all application errors
   - Maintains error state via BehaviorSubjects
   - Auto-dismisses errors after 8 seconds (configurable)
   - Generates unique error IDs for tracking

2. **ErrorInterceptor** (`src/app/core/interceptors/error.interceptor.ts`)
   - Global HTTP error handler
   - Automatically publishes errors to ErrorService
   - Implements retry logic (retries non-4xx errors once)
   - Provides user-friendly error messages by status code

3. **HttpErrorComponent** (`src/app/shared/http-error/`)
   - Reusable error display component
   - Shows different layouts based on error type
   - Supports expandable error details
   - Includes retry and dismiss actions

4. **ErrorNotificationComponent** (`src/app/shared/error-notification/`)
   - Global error notification container
   - Displays all active errors from ErrorService
   - Auto-scrolls when multiple errors accumulate
   - Positioned at top of viewport (z-index: 9500)

## Error Model

```typescript
interface AppError {
  id?: string;
  status: number;
  statusText: string;
  message: string;
  type: ErrorType;
  timestamp: Date;
  url?: string;
  details?: any;
  dismissible?: boolean;
  retryable?: boolean;
}

type ErrorType = 
  | 'network'      // Status 0, connection errors
  | 'timeout'      // Status 408, 504
  | 'unauthorized' // Status 401
  | 'forbidden'    // Status 403
  | 'notfound'     // Status 404
  | 'conflict'     // Status 409
  | 'validation'   // Status 422
  | 'server'       // Status 500+
  | 'unknown';     // Default
```

## Usage Patterns

### 1. Automatic HTTP Error Handling (Most Common)
Errors are automatically caught by the ErrorInterceptor and displayed globally.

```typescript
// In any service that makes HTTP calls
this.http.get('/api/data').subscribe(
  (data) => { /* ... */ },
  (error) => { /* Already handled by ErrorInterceptor */ }
);
```

The error will automatically appear in the global error notification container.

### 2. Manual Error Publishing
For non-HTTP errors, publish them directly to ErrorService:

```typescript
constructor(private errorService: ErrorService) {}

someMethod() {
  try {
    // Some operation that might fail
  } catch (error: any) {
    this.errorService.addError({
      status: 500,
      statusText: 'Error',
      message: `Failed to process data: ${error.message}`,
      type: 'server',
      timestamp: new Date(),
      retryable: true
    });
  }
}
```

### 3. Custom Error Handling in Components
If a component needs custom error handling alongside global notifications:

```typescript
import { ErrorService } from '../../core/services/error.service';

export class MyComponent implements OnInit {
  @Input() error: AppError | null = null;
  
  constructor(private errorService: ErrorService) {}

  ngOnInit() {
    this.errorService.getCurrentError()
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error?.type === 'unauthorized') {
          // Redirect to login
          this.router.navigate(['/login']);
        }
      });
  }
}
```

### 4. Error Dismissal
Errors can be dismissed programmatically:

```typescript
// Clear a specific error
this.errorService.dismissError(errorId);

// Clear all errors
this.errorService.clearErrors();
```

## Error Type Reference

| Type | Status Code | Example | Retryable |
|------|------------|---------|-----------|
| `network` | 0 | Connection refused | ✅ Yes |
| `timeout` | 408, 504 | Request timeout | ✅ Yes |
| `unauthorized` | 401 | Invalid token | ❌ No |
| `forbidden` | 403 | Insufficient permissions | ❌ No |
| `notfound` | 404 | Resource deleted | ❌ No |
| `conflict` | 409 | Duplicate entry | ❌ No |
| `validation` | 422 | Invalid input | ❌ No |
| `server` | 500+ | Server error | ✅ Yes |

## UI Components

### HttpErrorComponent
Displays individual errors with context and actions.

```html
<app-http-error
  [error]="error"
  [showDetails]="true"
  (dismiss)="onDismiss()"
  (retry)="onRetry()"
></app-http-error>
```

### ErrorNotificationComponent
Automatically displays all active errors. Include once in `app.component.html`:

```html
<app-error-notification></app-error-notification>
```

## Configuration

### Auto-Dismiss Delay
Modify the delay in [ErrorService.scheduleAutoDismiss()](src/app/core/services/error.service.ts#L88):

```typescript
setTimeout(() => { /* dismiss */ }, 8000); // Change 8000 to desired milliseconds
```

### Error Messages
Customize user-friendly messages in [ErrorInterceptor.getServerErrorMessage()](src/app/core/interceptors/error.interceptor.ts#L45):

```typescript
case 404:
  return 'Custom 404 message';
```

### Error Icons & Titles
Modify mappings in [ErrorService.getErrorIcon()](src/app/core/services/error.service.ts#L120):

```typescript
getErrorIcon(type: ErrorType): string {
  const icons: Record<ErrorType, string> = {
    network: '📡',  // Change emoji as needed
    // ...
  };
}
```

## Best Practices

1. **Let the interceptor handle HTTP errors**: Don't catch HTTP errors in components if you want global handling.

2. **Use error types consistently**: Always set the correct error type for better categorization.

3. **Make errors dismissible by default**: Only set `dismissible: false` for critical errors.

4. **Implement retry logic**: Use `retryable: true` for transient errors (network, timeout, server).

5. **Clear errors on navigation**: Clear errors when users navigate to prevent stale error displays.

6. **Log errors for monitoring**: The ErrorService logs all errors to console for debugging.

7. **Test error scenarios**: Simulate network failures, timeouts, and server errors during development.

## Example: Complete Error Flow

```typescript
// 1. API call in service
getAnalysis(id: string): Observable<Analysis> {
  return this.http.get<Analysis>(`/api/analysis/${id}`);
}

// 2. ErrorInterceptor catches and publishes error
// Error → HttpErrorResponse → ErrorInterceptor
// → ErrorService.handleHttpError()
// → Error added to errors$ BehaviorSubject

// 3. ErrorNotificationComponent subscribes and displays
// errors$ → ErrorNotificationComponent
// → HttpErrorComponent (for each error)
// → User sees error notification with retry button

// 4. User clicks retry
// → Component calls service again
// → New error follows same path, or succeeds
```

## Debugging

### View Active Errors
In browser console:

```typescript
// Get all active errors
ng.getComponent(document.querySelector('app-root'))
  .errorService.errors$.value

// Get current error
ng.getComponent(document.querySelector('app-root'))
  .errorService.currentError$.value
```

### Monitor Error Emissions
Enable error logging by modifying [ErrorService.addError()](src/app/core/services/error.service.ts#L22):

```typescript
addError(error: AppError): void {
  console.log(`[ERROR ADDED] ${error.type}: ${error.message}`);
  // ...
}
```

## Future Enhancements

1. **Circuit Breaker Pattern**: Prevent cascading failures
2. **Exponential Backoff**: Improve retry timing for transient failures
3. **Error Aggregation**: Group similar errors for better UX
4. **Remote Error Logging**: Send errors to backend monitoring service
5. **Error Analytics**: Track error patterns and frequencies
6. **Error Recovery Suggestions**: Provide context-aware recovery actions
7. **Offline Error Queue**: Queue errors when offline, sync when online

## Files Modified

- `src/app/core/models/error.model.ts` - NEW
- `src/app/core/services/error.service.ts` - NEW
- `src/app/core/interceptors/error.interceptor.ts` - MODIFIED
- `src/app/shared/http-error/` - NEW
- `src/app/shared/error-notification/` - NEW
- `src/app/shared/shared.module.ts` - MODIFIED
- `src/app/app.component.html` - MODIFIED
