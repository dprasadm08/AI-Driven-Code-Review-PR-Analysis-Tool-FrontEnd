/**
 * Repository model interface
 */
export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  url: string;
  owner: string;
  isPrivate: boolean;
  defaultBranch: string;
  language?: string;
  stars?: number;
  forks?: number;
  openIssues?: number;
  createdAt?: Date;
  updatedAt?: Date;
  lastAnalyzedAt?: Date;
  status?: RepositoryStatus;
}

/**
 * Repository status enum
 */
export enum RepositoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ANALYZING = 'ANALYZING',
  ERROR = 'ERROR'
}

/**
 * Add repository request
 */
export interface AddRepositoryRequest {
  url: string;
  accessToken?: string;
  branch?: string;
}

/**
 * Add repository response
 */
export interface AddRepositoryResponse {
  message: string;
  repository: Repository;
}

/**
 * Repository list filters
 */
export interface RepositoryFilters {
  status?: RepositoryStatus;
  language?: string;
  searchTerm?: string;
  sortBy?: 'name' | 'createdAt' | 'stars' | 'lastAnalyzedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Repository statistics
 */
export interface RepositoryStats {
  totalRepositories: number;
  activeRepositories: number;
  totalPullRequests: number;
  totalAnalyses: number;
  lastSyncDate?: Date;
}
