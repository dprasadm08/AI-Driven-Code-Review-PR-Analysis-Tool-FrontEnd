import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WebhookService } from '../../core/services/webhook.service';
import { RepositoryService } from '../../core/services/repository.service';
import {
  Webhook,
  WebhookStats,
  WebhookStatus,
  WebhookSetupInstructions,
  WebhookConfig,
  WebhookEvent
} from '../../core/models/webhook.model';
import { Repository } from '../../core/models/repository.model';

@Component({
  selector: 'app-webhook-status',
  templateUrl: './webhook-status.component.html',
  styleUrls: ['./webhook-status.component.css']
})
export class WebhookStatusComponent implements OnInit, OnDestroy {
  webhooks: Webhook[] = [];
  repositories: Repository[] = [];
  stats: WebhookStats | null = null;
  setupInstructions: WebhookSetupInstructions | null = null;
  
  isLoading = false;
  isSyncing = false;
  isTesting = false;
  errorMessage = '';
  successMessage = '';
  
  selectedRepository = '';
  showSetupInstructions = false;
  testingWebhookId: string | null = null;
  
  private destroy$ = new Subject<void>();

  // Webhook status enum for template
  WebhookStatus = WebhookStatus;

  constructor(
    private webhookService: WebhookService,
    private repositoryService: RepositoryService
  ) {}

  ngOnInit(): void {
    this.loadRepositories();
    this.loadWebhooks();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load repositories
   */
  loadRepositories(): void {
    this.repositoryService.getRepositories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (repositories) => {
          this.repositories = repositories;
        },
        error: (error) => {
          console.error('Failed to load repositories:', error);
        }
      });
  }

  /**
   * Load webhooks
   */
  loadWebhooks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.webhookService.getWebhooks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (webhooks) => {
          this.webhooks = webhooks;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load webhooks';
          this.isLoading = false;
          this.webhooks = [];
        }
      });
  }

  /**
   * Load webhook statistics
   */
  loadStats(): void {
    this.webhookService.getWebhookStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Failed to load webhook stats:', error);
        }
      });
  }

  /**
   * Sync webhooks with GitHub
   */
  syncWebhooks(): void {
    this.isSyncing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.webhookService.syncWebhooks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (webhooks) => {
          this.webhooks = webhooks;
          this.isSyncing = false;
          this.successMessage = `Successfully synced ${webhooks.length} webhooks`;
          this.loadStats();
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to sync webhooks';
          this.isSyncing = false;
        }
      });
  }

  /**
   * Test webhook
   */
  testWebhook(webhook: Webhook): void {
    this.testingWebhookId = webhook.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.webhookService.testWebhook(webhook.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.testingWebhookId = null;
          if (result.success) {
            this.successMessage = `Webhook test successful! Response time: ${result.responseTime}ms`;
          } else {
            this.errorMessage = `Webhook test failed: ${result.message}`;
          }
          
          setTimeout(() => {
            this.successMessage = '';
            this.errorMessage = '';
          }, 5000);
        },
        error: (error) => {
          this.testingWebhookId = null;
          this.errorMessage = `Webhook test failed: ${error.message}`;
        }
      });
  }

  /**
   * Show setup instructions
   */
  showSetup(repositoryId: string): void {
    this.selectedRepository = repositoryId;
    this.showSetupInstructions = true;
    
    this.webhookService.getSetupInstructions(repositoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (instructions) => {
          this.setupInstructions = instructions;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load setup instructions';
          this.showSetupInstructions = false;
        }
      });
  }

  /**
   * Close setup instructions
   */
  closeSetup(): void {
    this.showSetupInstructions = false;
    this.setupInstructions = null;
    this.selectedRepository = '';
  }

  /**
   * Copy to clipboard
   */
  copyToClipboard(text: string, label: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.successMessage = `${label} copied to clipboard!`;
      setTimeout(() => {
        this.successMessage = '';
      }, 2000);
    }).catch(err => {
      this.errorMessage = 'Failed to copy to clipboard';
    });
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: WebhookStatus): string {
    switch (status) {
      case WebhookStatus.ACTIVE:
        return 'status-active';
      case WebhookStatus.INACTIVE:
        return 'status-inactive';
      case WebhookStatus.ERROR:
        return 'status-error';
      case WebhookStatus.PENDING:
        return 'status-pending';
      default:
        return '';
    }
  }

  /**
   * Format date
   */
  formatDate(date?: Date): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  }

  /**
   * Format time ago
   */
  formatTimeAgo(date?: Date): string {
    if (!date) return 'Never';
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  /**
   * Get repository name
   */
  getRepositoryName(repositoryId: string): string {
    const repo = this.repositories.find(r => r.id === repositoryId);
    return repo ? `${repo.owner}/${repo.name}` : repositoryId;
  }
}
