/**
 * AI Provider model interfaces
 */

export interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  isActive: boolean;
  apiKeyRequired: boolean;
  configUrl?: string;
  features: string[];
  supportedModels: AIModel[];
  rateLimit?: number;
  costPerRequest?: number;
}

export interface AIModel {
  id: string;
  name: string;
  displayName: string;
  capabilities: ModelCapability[];
  maxTokens?: number;
  costPer1kTokens?: number;
}

export enum ModelCapability {
  CODE_REVIEW = 'CODE_REVIEW',
  SECURITY_ANALYSIS = 'SECURITY_ANALYSIS',
  PERFORMANCE_ANALYSIS = 'PERFORMANCE_ANALYSIS',
  BEST_PRACTICES = 'BEST_PRACTICES',
  DOCUMENTATION = 'DOCUMENTATION',
  TEST_GENERATION = 'TEST_GENERATION',
  COMPLEXITY_ANALYSIS = 'COMPLEXITY_ANALYSIS'
}

export enum AIProviderType {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  GOOGLE = 'GOOGLE',
  AZURE = 'AZURE',
  CUSTOM = 'CUSTOM'
}

export interface ProviderConfig {
  providerId: string;
  modelId: string;
  apiKey: string;
  apiUrl?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderSelection {
  activeProvider: AIProvider;
  selectedModel: AIModel;
  config: ProviderConfig;
}

export interface ProviderStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  averageResponseTime: number;
  lastUsedAt?: Date;
}
