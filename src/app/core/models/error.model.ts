/**
 * Error model for standardized error handling across the application
 */
export interface AppError {
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

export type ErrorType = 
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'notfound'
  | 'conflict'
  | 'validation'
  | 'server'
  | 'unknown';

export interface ErrorContext {
  timestamp: Date;
  url: string;
  method: string;
  status: number;
  statusText: string;
}
