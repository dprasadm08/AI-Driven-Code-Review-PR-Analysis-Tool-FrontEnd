import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AIProviderService } from '../../core/services/ai-provider.service';
import { AIProvider, AIModel, ProviderSelection } from '../../core/models/ai-provider.model';

@Component({
  selector: 'app-ai-provider-selector',
  templateUrl: './ai-provider-selector.component.html',
  styleUrls: ['./ai-provider-selector.component.css']
})
export class AIProviderSelectorComponent implements OnInit, OnDestroy {
  providers: AIProvider[] = [];
  selectedProvider: ProviderSelection | null = null;
  selectedModels: AIModel[] = [];
  
  isLoading = false;
  isSaving = false;
  isTesting = false;
  testingProviderId: string | null = null;
  
  errorMessage = '';
  successMessage = '';
  
  selectedProviderId: string = '';
  selectedModelId: string = '';
  apiKey: string = '';
  showApiKey = false;
  
  private destroy$ = new Subject<void>();

  constructor(private aiProviderService: AIProviderService) {}

  ngOnInit(): void {
    this.loadProviders();
    this.loadSelectedProvider();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load available providers
   */
  loadProviders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.aiProviderService.getProviders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (providers) => {
          this.providers = providers;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load providers';
          this.isLoading = false;
        }
      });
  }

  /**
   * Load currently selected provider
   */
  loadSelectedProvider(): void {
    this.aiProviderService.getSelectedProvider()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (selection) => {
          if (selection) {
            this.selectedProvider = selection;
            this.selectedProviderId = selection.activeProvider.id;
            this.selectedModelId = selection.selectedModel.id;
            this.updateAvailableModels();
          }
        },
        error: (error) => {
          console.error('Failed to load selected provider:', error);
        }
      });
  }

  /**
   * Update available models when provider changes
   */
  onProviderChange(): void {
    this.selectedModelId = '';
    this.updateAvailableModels();
  }

  /**
   * Update available models list
   */
  updateAvailableModels(): void {
    const provider = this.providers.find(p => p.id === this.selectedProviderId);
    if (provider) {
      this.selectedModels = provider.supportedModels;
      // Set first model as default if not already selected
      if (!this.selectedModelId && this.selectedModels.length > 0) {
        this.selectedModelId = this.selectedModels[0].id;
      }
    }
  }

  /**
   * Save provider selection
   */
  saveProvider(): void {
    if (!this.selectedProviderId || !this.selectedModelId) {
      this.errorMessage = 'Please select both provider and model';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.aiProviderService.setActiveProvider(this.selectedProviderId, this.selectedModelId, this.apiKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (selection) => {
          this.isSaving = false;
          this.selectedProvider = selection;
          this.successMessage = `Successfully switched to ${selection.activeProvider.displayName}!`;
          this.apiKey = '';
          
          setTimeout(() => {
            this.successMessage = '';
          }, 4000);
        },
        error: (error) => {
          this.isSaving = false;
          this.errorMessage = error.message || 'Failed to save provider selection';
        }
      });
  }

  /**
   * Test provider connection
   */
  testProvider(providerId: string): void {
    if (!this.apiKey && !this.selectedProvider?.config.apiKey) {
      this.errorMessage = 'Please enter an API key to test';
      return;
    }

    this.testingProviderId = providerId;
    const key = this.apiKey || this.selectedProvider?.config.apiKey || '';

    this.aiProviderService.testProvider(providerId, key)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.testingProviderId = null;
          if (result.success) {
            this.successMessage = `✅ ${result.message}`;
          } else {
            this.errorMessage = `❌ ${result.message}`;
          }
          
          setTimeout(() => {
            this.successMessage = '';
            this.errorMessage = '';
          }, 4000);
        },
        error: (error) => {
          this.testingProviderId = null;
          this.errorMessage = error.message || 'Connection test failed';
        }
      });
  }

  /**
   * Get provider display info
   */
  getProviderInfo(providerId: string): AIProvider | undefined {
    return this.providers.find(p => p.id === providerId);
  }

  /**
   * Get selected model info
   */
  getSelectedModelInfo(): AIModel | undefined {
    const provider = this.getProviderInfo(this.selectedProviderId);
    return provider?.supportedModels.find(m => m.id === this.selectedModelId);
  }

  /**
   * Toggle API key visibility
   */
  toggleApiKeyVisibility(): void {
    this.showApiKey = !this.showApiKey;
  }
}
