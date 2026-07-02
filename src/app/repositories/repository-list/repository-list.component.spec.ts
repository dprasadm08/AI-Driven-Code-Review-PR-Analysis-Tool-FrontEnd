import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { RepositoryListComponent } from './repository-list.component';
import { RepositoryService } from '../../core/services/repository.service';
import { Repository, RepositoryStatus } from '../../core/models/repository.model';

describe('RepositoryListComponent', () => {
  let component: RepositoryListComponent;
  let fixture: ComponentFixture<RepositoryListComponent>;
  let repositoryServiceSpy: jasmine.SpyObj<RepositoryService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockRepositories: Repository[] = [
    {
      id: 'repo-1',
      name: 'frontend',
      fullName: 'org/frontend',
      url: 'https://github.com/org/frontend',
      owner: 'org',
      isPrivate: false,
      defaultBranch: 'main',
      language: 'TypeScript',
      stars: 12,
      forks: 3,
      status: RepositoryStatus.ACTIVE
    },
    {
      id: 'repo-2',
      name: 'backend',
      fullName: 'org/backend',
      url: 'https://github.com/org/backend',
      owner: 'org',
      isPrivate: true,
      defaultBranch: 'develop',
      language: 'Java',
      stars: 7,
      forks: 2,
      status: RepositoryStatus.ERROR
    }
  ];

  beforeEach(async () => {
    repositoryServiceSpy = jasmine.createSpyObj<RepositoryService>('RepositoryService', [
      'getRepositories',
      'syncRepository',
      'deleteRepository'
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    repositoryServiceSpy.getRepositories.and.returnValue(of(mockRepositories));
    repositoryServiceSpy.syncRepository.and.returnValue(of(mockRepositories[0]));
    repositoryServiceSpy.deleteRepository.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [RepositoryListComponent],
      providers: [
        { provide: RepositoryService, useValue: repositoryServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RepositoryListComponent);
    component = fixture.componentInstance;
  });

  it('should load repositories on init', () => {
    fixture.detectChanges();

    expect(repositoryServiceSpy.getRepositories).toHaveBeenCalled();
    expect(component.repositories.length).toBe(2);
    expect(component.filteredRepositories.length).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should pass filters when loading repositories', () => {
    component.searchTerm = 'front';
    component.selectedStatus = RepositoryStatus.ACTIVE;

    component.loadRepositories();

    expect(repositoryServiceSpy.getRepositories).toHaveBeenCalledWith({
      status: RepositoryStatus.ACTIVE,
      searchTerm: 'front'
    });
  });

  it('should clear filters and reload', () => {
    spyOn(component, 'loadRepositories').and.callThrough();
    component.searchTerm = 'x';
    component.selectedStatus = RepositoryStatus.ERROR;

    component.clearFilters();

    expect(component.searchTerm).toBe('');
    expect(component.selectedStatus).toBe('');
    expect(component.loadRepositories).toHaveBeenCalled();
  });

  it('should toggle view mode', () => {
    expect(component.viewMode).toBe('table');

    component.toggleViewMode();
    expect(component.viewMode).toBe('cards');

    component.toggleViewMode();
    expect(component.viewMode).toBe('table');
  });

  it('should fetch repositories and show success message', fakeAsync(() => {
    repositoryServiceSpy.getRepositories.and.returnValue(of(mockRepositories));

    component.fetchRepositories();

    expect(component.isFetching).toBeFalse();
    expect(component.successMessage).toContain('Successfully fetched 2 repositories');

    tick(3000);
    expect(component.successMessage).toBe('');
  }));

  it('should sync repository and reapply filters', () => {
    const repo = { ...mockRepositories[0] };
    const updatedRepo = { ...repo, status: RepositoryStatus.ACTIVE, stars: 50 };
    repositoryServiceSpy.syncRepository.and.returnValue(of(updatedRepo));
    spyOn(component, 'applyFilters');
    component.repositories = [repo];

    component.syncRepository(repo);

    expect(repositoryServiceSpy.syncRepository).toHaveBeenCalledWith('repo-1');
    expect(component.repositories[0].stars).toBe(50);
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should confirm and delete repository', () => {
    fixture.detectChanges();
    const repo = mockRepositories[0];
    component.confirmDelete(repo);

    expect(component.showDeleteDialog).toBeTrue();
    expect(component.repositoryToDelete?.id).toBe('repo-1');

    component.deleteRepository();

    expect(repositoryServiceSpy.deleteRepository).toHaveBeenCalledWith('repo-1');
    expect(component.repositories.find((r) => r.id === 'repo-1')).toBeUndefined();
    expect(component.showDeleteDialog).toBeFalse();
    expect(component.repositoryToDelete).toBeNull();
  });

  it('should show error when load fails', () => {
    repositoryServiceSpy.getRepositories.and.returnValue(throwError(() => new Error('Load failed')));

    component.loadRepositories();

    expect(component.errorMessage).toBe('Load failed');
    expect(component.repositories).toEqual([]);
    expect(component.filteredRepositories).toEqual([]);
    expect(component.isLoading).toBeFalse();
  });

  it('should navigate to add repository', () => {
    component.addRepository();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/repositories/add']);
  });

  it('should render repository rows in table view', () => {
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tr.table-row');
    expect(rows.length).toBe(2);
  });

  it('should render empty state when no repositories', () => {
    repositoryServiceSpy.getRepositories.and.returnValue(of([]));
    fixture.detectChanges();

    const emptyTitle = fixture.nativeElement.querySelector('.empty-state h2')?.textContent;
    expect(emptyTitle).toContain('No Repositories Found');
  });
});
