import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RepositoryService } from '../../core/services/repository.service';
import { Repository, RepositoryFilters, RepositoryStatus } from '../../core/models/repository.model';

@Component({
  selector: 'app-repository-list',
  templateUrl: './repository-list.component.html',
  styleUrls: ['./repository-list.component.css']
})
export class RepositoryListComponent implements OnInit, OnDestroy {
  repositories: Repository[] = [];
  filteredRepositories: Repository[] = [];
  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  selectedStatus: RepositoryStatus | '' = '';
  
  // Confirmation dialog
  showDeleteDialog = false;
  repositoryToDelete: Repository | null = null;
  
  private destroy$ = new Subject<void>();

  // Status options
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: RepositoryStatus.ACTIVE, label: 'Active' },
    { value: RepositoryStatus.INACTIVE, label: 'Inactive' },
    { value: RepositoryStatus.ANALYZING, label: 'Analyzing' },
    { value: RepositoryStatus.ERROR, label: 'Error' }
  ];

  constructor(
    private repositoryService: RepositoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRepositories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load repositories from API
   */
  loadRepositories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters: RepositoryFilters = {
      status: this.selectedStatus || undefined,
      searchTerm: this.searchTerm || undefined
    };

    this.repositoryService.getRepositories(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (repositories) => {
          this.repositories = repositories;
          this.filteredRepositories = repositories;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load repositories';
          this.isLoading = false;
          this.repositories = [];
          this.filteredRepositories = [];
        }
      });
  }

  /**
   * Filter repositories
   */
  applyFilters(): void {
    this.loadRepositories();
  }

  /**
   * Search repositories
   */
  onSearch(): void {
    this.loadRepositories();
  }

  /**
   * Clear filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.loadRepositories();
  }

  /**
   * Navigate to add repository page
   */
  addRepository(): void {
    this.router.navigate(['/repositories/add']);
  }

  /**
   * Sync repository
   */
  syncRepository(repo: Repository): void {
    repo.status = RepositoryStatus.ANALYZING;
    
    this.repositoryService.syncRepository(repo.id).subscribe({
      next: (updatedRepo) => {
        const index = this.repositories.findIndex(r => r.id === repo.id);
        if (index !== -1) {
          this.repositories[index] = updatedRepo;
          this.applyFilters();
        }
      },
      error: (error) => {
        this.errorMessage = `Failed to sync repository: ${error.message}`;
        repo.status = RepositoryStatus.ERROR;
      }
    });
  }

  /**
   * Show delete confirmation
   */
  confirmDelete(repo: Repository): void {
    this.repositoryToDelete = repo;
    this.showDeleteDialog = true;
  }

  /**
   * Delete repository
   */
  deleteRepository(): void {
    if (!this.repositoryToDelete) return;

    const repoId = this.repositoryToDelete.id;
    
    this.repositoryService.deleteRepository(repoId).subscribe({
      next: () => {
        this.repositories = this.repositories.filter(r => r.id !== repoId);
        this.applyFilters();
        this.showDeleteDialog = false;
        this.repositoryToDelete = null;
      },
      error: (error) => {
        this.errorMessage = `Failed to delete repository: ${error.message}`;
        this.showDeleteDialog = false;
        this.repositoryToDelete = null;
      }
    });
  }

  /**
   * Cancel delete
   */
  cancelDelete(): void {
    this.showDeleteDialog = false;
    this.repositoryToDelete = null;
  }

  /**
   * Get status badge class
   */
  getStatusClass(status?: RepositoryStatus): string {
    switch (status) {
      case RepositoryStatus.ACTIVE:
        return 'status-active';
      case RepositoryStatus.INACTIVE:
        return 'status-inactive';
      case RepositoryStatus.ANALYZING:
        return 'status-analyzing';
      case RepositoryStatus.ERROR:
        return 'status-error';
      default:
        return 'status-default';
    }
  }

  /**
   * Format date
   */
  formatDate(date?: Date): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  }
}

