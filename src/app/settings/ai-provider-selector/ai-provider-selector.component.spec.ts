import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { AIProviderSelectorComponent } from './ai-provider-selector.component';
import { AIProviderService } from '../../core/services/ai-provider.service';
import { AIProvider, ProviderSelection, ModelCapability } from '../../core/models/ai-provider.model';

describe('AIProviderSelectorComponent', () => {
  let component: AIProviderSelectorComponent;
  let fixture: ComponentFixture<AIProviderSelectorComponent>;
  let aiProviderServiceSpy: jasmine.SpyObj<AIProviderService>;

  const providers: AIProvider[] = [
    {
      id: 'openai',
      name: 'OpenAI',
      displayName: 'OpenAI GPT',
      description: 'Provider A',
      icon: '🤖',
      isActive: true,
      apiKeyRequired: true,
      features: ['Code Review'],
      supportedModels: [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          displayName: 'GPT-4 Turbo',
          capabilities: [ModelCapability.CODE_REVIEW],
          maxTokens: 128000
        }
      ]
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      displayName: 'Claude',
      description: 'Provider B',
      icon: '🧠',
      isActive: true,
      apiKeyRequired: true,
      features: ['Testing'],
      supportedModels: [
        {
          id: 'claude-3-sonnet',
          name: 'Claude 3 Sonnet',
          displayName: 'Claude 3 Sonnet',
          capabilities: [ModelCapability.BEST_PRACTICES],
          maxTokens: 200000
        }
      ]
    }
  ];

  const selected: ProviderSelection = {
    activeProvider: providers[0],
    selectedModel: providers[0].supportedModels[0],
    config: {
      providerId: 'openai',
      modelId: 'gpt-4',
      apiKey: 'stored-key',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };

  beforeEach(async () => {
    aiProviderServiceSpy = jasmine.createSpyObj<AIProviderService>('AIProviderService', [
      'getProviders',
      'getSelectedProvider',
      'setActiveProvider',
      'testProvider'
    ]);

    aiProviderServiceSpy.getProviders.and.returnValue(of(providers));
    aiProviderServiceSpy.getSelectedProvider.and.returnValue(of(selected));
    aiProviderServiceSpy.setActiveProvider.and.returnValue(of(selected));
    aiProviderServiceSpy.testProvider.and.returnValue(of({ success: true, message: 'Connection successful' }));

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [AIProviderSelectorComponent],
      providers: [{ provide: AIProviderService, useValue: aiProviderServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AIProviderSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should load providers and selected provider on init', () => {
    fixture.detectChanges();

    expect(aiProviderServiceSpy.getProviders).toHaveBeenCalled();
    expect(aiProviderServiceSpy.getSelectedProvider).toHaveBeenCalled();
    expect(component.providers.length).toBe(2);
    expect(component.selectedProviderId).toBe('openai');
    expect(component.selectedModelId).toBe('gpt-4');
  });

  it('should update available models when provider changes', () => {
    component.providers = providers;
    component.selectedProviderId = 'anthropic';
    component.selectedModelId = '';

    component.onProviderChange();

    expect(component.selectedModels.length).toBe(1);
    expect(component.selectedModels[0].id).toBe('claude-3-sonnet');
    expect(component.selectedModelId).toBe('claude-3-sonnet');
  });

  it('should show validation error when saving without provider/model', () => {
    component.selectedProviderId = '';
    component.selectedModelId = '';

    component.saveProvider();

    expect(component.errorMessage).toBe('Please select both provider and model');
    expect(aiProviderServiceSpy.setActiveProvider).not.toHaveBeenCalled();
  });

  it('should switch provider successfully', fakeAsync(() => {
    fixture.detectChanges();

    const switchedSelection: ProviderSelection = {
      ...selected,
      activeProvider: providers[1],
      selectedModel: providers[1].supportedModels[0],
      config: {
        ...selected.config,
        providerId: 'anthropic',
        modelId: 'claude-3-sonnet'
      }
    };

    aiProviderServiceSpy.setActiveProvider.and.returnValue(of(switchedSelection));

    component.selectedProviderId = 'anthropic';
    component.selectedModelId = 'claude-3-sonnet';
    component.apiKey = 'new-key';

    component.saveProvider();

    expect(aiProviderServiceSpy.setActiveProvider).toHaveBeenCalledWith('anthropic', 'claude-3-sonnet', 'new-key');
    expect(component.selectedProvider?.activeProvider.id).toBe('anthropic');
    expect(component.successMessage).toContain('Successfully switched to Claude');
    expect(component.apiKey).toBe('');

    tick(4000);
    expect(component.successMessage).toBe('');
  }));

  it('should test provider and show success message', fakeAsync(() => {
    fixture.detectChanges();
    component.apiKey = 'live-key';

    component.testProvider('openai');

    expect(aiProviderServiceSpy.testProvider).toHaveBeenCalledWith('openai', 'live-key');
    expect(component.testingProviderId).toBeNull();
    expect(component.successMessage).toContain('Connection successful');

    tick(4000);
    expect(component.successMessage).toBe('');
    expect(component.errorMessage).toBe('');
  }));

  it('should show error if testing provider without api key', () => {
    fixture.detectChanges();
    component.apiKey = '';
    component.selectedProvider = {
      ...selected,
      config: { ...selected.config, apiKey: '' }
    };

    component.testProvider('openai');

    expect(component.errorMessage).toBe('Please enter an API key to test');
    expect(aiProviderServiceSpy.testProvider).not.toHaveBeenCalled();
  });

  it('should show provider test error when result is unsuccessful', fakeAsync(() => {
    fixture.detectChanges();
    component.apiKey = 'key';
    aiProviderServiceSpy.testProvider.and.returnValue(of({ success: false, message: 'Invalid key' }));

    component.testProvider('openai');

    expect(component.errorMessage).toContain('Invalid key');

    tick(4000);
    expect(component.errorMessage).toBe('');
  }));

  it('should handle save provider failure', () => {
    fixture.detectChanges();
    component.selectedProviderId = 'openai';
    component.selectedModelId = 'gpt-4';
    aiProviderServiceSpy.setActiveProvider.and.returnValue(throwError(() => new Error('save failed')));

    component.saveProvider();

    expect(component.isSaving).toBeFalse();
    expect(component.errorMessage).toBe('save failed');
  });

  it('should toggle API key visibility', () => {
    expect(component.showApiKey).toBeFalse();
    component.toggleApiKeyVisibility();
    expect(component.showApiKey).toBeTrue();
  });

  it('should render provider cards', () => {
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.provider-card');
    expect(cards.length).toBe(2);
  });
});
