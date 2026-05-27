/**
 * Webhook model interface
 */
export interface Webhook {
  id: string;
  repositoryId: string;
  repositoryName: string;
  repositoryOwner: string;
  webhookUrl: string;
  secret: string;
  events: WebhookEvent[];
  isActive: boolean;
  status: WebhookStatus;
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Webhook status enum
 */
export enum WebhookStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  PENDING = 'PENDING'
}

/**
 * Webhook event types
 */
export enum WebhookEvent {
  PULL_REQUEST_OPENED = 'PULL_REQUEST_OPENED',
  PULL_REQUEST_UPDATED = 'PULL_REQUEST_UPDATED',
  PULL_REQUEST_CLOSED = 'PULL_REQUEST_CLOSED',
  PULL_REQUEST_MERGED = 'PULL_REQUEST_MERGED',
  PUSH = 'PUSH',
  COMMIT_COMMENT = 'COMMIT_COMMENT'
}

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  repositoryId: string;
  events: WebhookEvent[];
  secret?: string;
}

/**
 * Webhook statistics
 */
export interface WebhookStats {
  totalWebhooks: number;
  activeWebhooks: number;
  inactiveWebhooks: number;
  errorWebhooks: number;
  totalEvents: number;
  lastEventAt?: Date;
}

/**
 * Webhook setup instructions
 */
export interface WebhookSetupInstructions {
  webhookUrl: string;
  contentType: string;
  secret: string;
  events: string[];
  sslVerification: boolean;
}

/**
 * Webhook test result
 */
export interface WebhookTestResult {
  success: boolean;
  message: string;
  statusCode?: number;
  responseTime?: number;
}
