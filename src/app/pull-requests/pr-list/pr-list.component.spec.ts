import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { PrListComponent } from './pr-list.component';
import { PullRequestService } from '../../core/services/pull-request.service';
import { RepositoryService } from '../../core/services/repository.service';
import {
  PullRequest,
  PRState,
  ReviewStatus,
  AnalysisStatus,
  FetchPullRequestsResponse
} from '../../core/models/pull-request.model';
import { Repository } from '../../core/models/repository.model';

describe('PrListComponent', () => {
  let component: PrListComponent;
  let fixture: ComponentFixture<PrListComponent>;
  let pullRequestServiceSpy: jasmine.SpyObj<PullRequestService>;
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
      defaultBranch: 'main'
    }
  ];

  const mockPullRequests: PullRequest[] = [
    {
      id: 'pr-1',
      number: 101,
      title: 'Add auth tests',
      state: PRState.OPEN,
      author: 'alice',
      repositoryId: 'repo-1',
      repositoryName: 'frontend',
      repositoryOwner: 'org',
      sourceBranch: 'feature/tests',
      targetBranch: 'main',
      createdAt: new Date('2026-07-01T10:00:00Z'),
      updatedAt: new Date('2026-07-01T10:05:00Z'),
      url: 'https://github.com/org/frontend/pull/101',
      additions: 120,
      deletions: 20,
      changedFiles: 6,
      commits: 2,
      comments: 3,
      reviewStatus: ReviewStatus.PENDING,
      aiAnalysisStatus: AnalysisStatus.PENDING
    },
    {
      id: 'pr-2',
      number: 99,
      title: 'Refactor repository list',
      state: PRState.MERGED,
      author: 'bob',
      repositoryId: 'repo-1',
      repositoryName: 'frontend',
      repositoryOwner: 'org',
      sourceBranch: 'refactor/list',
      targetBranch: 'main',
      createdAt: new Date('2026-06-25T09:00:00Z'),
      updatedAt: new Date('2026-06-25T10:00:00Z'),
      url: 'https://github.com/org/frontend/pull/99',
      additions: 200,
      deletions: 90,
      changedFiles: 12,
      commits: 5,
      comments: 8,
      reviewStatus: ReviewStatus.APPROVED,
      aiAnalysisStatus: AnalysisStatus.COMPLETED,
      aiScore: 88
    }
  ];

  beforeEach(async () => {
    pullRequestServiceSpy = jasmine.createSpyObj<PullRequestService>('PullRequestService', [
      'getPullRequests',
      'fetchPullRequests',
      'triggerAnalysis'
    ]);
    repositoryServiceSpy = jasmine.createSpyObj<RepositoryService>('RepositoryService', ['getRepositories']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    pullRequestServiceSpy.getPullRequests.and.returnValue(of(mockPullRequests));
    pullRequestServiceSpy.fetchPullRequests.and.returnValue(
      of({ pullRequests: mockPullRequests, total: 2, page: 1, pageSize: 20 } as FetchPullRequestsResponse)
    );
    pullRequestServiceSpy.triggerAnalysis.and.returnValue(
      of({ id: 'analysis-1', pullRequestId: 'pr-1', score: 76 } as any)
    );
    repositoryServiceSpy.getRepositories.and.returnValue(of(mockRepositories));

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [PrListComponent],
      providers: [
        { provide: PullRequestService, useValue: pullRequestServiceSpy },
        { provide: RepositoryService, useValue: repositoryServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PrListComponent);
    component = fixture.componentInstance;
  });

  it('should load repositories and pull requests on init', () => {
    fixture.detectChanges();

    expect(repositoryServiceSpy.getRepositories).toHaveBeenCalled();
    expect(pullRequestServiceSpy.getPullRequests).toHaveBeenCalled();
    expect(component.repositories.length).toBe(1);
    expect(component.filteredPullRequests.length).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should build and send selected filters while loading pull requests', () => {
    component.selectedRepository = 'repo-1';
    component.selectedState = PRState.OPEN;
    component.selectedReviewStatus = ReviewStatus.PENDING;
    component.selectedAnalysisStatus = AnalysisStatus.PENDING;
    component.searchTerm = 'auth';

    component.loadPullRequests();

    expect(pullRequestServiceSpy.getPullRequests).toHaveBeenCalledWith({
      repositoryId: 'repo-1',
      state: PRState.OPEN,
      reviewStatus: ReviewStatus.PENDING,
      analysisStatus: AnalysisStatus.PENDING,
      searchTerm: 'auth'
    });
  });

  it('should clear filters and reload list', () => {
    spyOn(component, 'loadPullRequests').and.callThrough();
    component.searchTerm = 'abc';
    component.selectedRepository = 'repo-1';
    component.selectedState = PRState.CLOSED;
    component.selectedReviewStatus = ReviewStatus.COMMENTED;
    component.selectedAnalysisStatus = AnalysisStatus.FAILED;

    component.clearFilters();

    expect(component.searchTerm).toBe('');
    expect(component.selectedRepository).toBe('');
    expect(component.selectedState).toBe('');
    expect(component.selectedReviewStatus).toBe('');
    expect(component.selectedAnalysisStatus).toBe('');
    expect(component.loadPullRequests).toHaveBeenCalled();
  });

  it('should fetch pull requests and show success message', fakeAsync(() => {
    component.selectedRepository = 'repo-1';

    component.fetchPullRequests();

    expect(pullRequestServiceSpy.fetchPullRequests).toHaveBeenCalledWith('repo-1');
    expect(component.isFetching).toBeFalse();
    expect(component.successMessage).toContain('Successfully fetched 2 pull requests');

    tick(3000);
    expect(component.successMessage).toBe('');
  }));

  it('should trigger analysis and update status and score on success', fakeAsync(() => {
    const pr = { ...mockPullRequests[0] };

    component.triggerAnalysis(pr);

    expect(pr.aiAnalysisStatus).toBe(AnalysisStatus.COMPLETED);
    expect(pr.aiScore).toBe(76);
    expect(component.successMessage).toContain('Analysis completed for PR #101');

    tick(3000);
    expect(component.successMessage).toBe('');
  }));

  it('should set failed status and error message when analysis fails', () => {
    const pr = { ...mockPullRequests[0] };
    pullRequestServiceSpy.triggerAnalysis.and.returnValue(throwError(() => new Error('analysis down')));

    component.triggerAnalysis(pr);

    expect(pr.aiAnalysisStatus).toBe(AnalysisStatus.FAILED);
    expect(component.errorMessage).toContain('Failed to analyze PR: analysis down');
  });

  it('should navigate to PR details', () => {
    component.viewDetails(mockPullRequests[0]);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pull-requests', 'pr-1']);
  });

  it('should return correct helper classes', () => {
    expect(component.getStateClass(PRState.OPEN)).toBe('state-open');
    expect(component.getReviewClass(ReviewStatus.APPROVED)).toBe('review-approved');
    expect(component.getAnalysisClass(AnalysisStatus.FAILED)).toBe('analysis-failed');
    expect(component.getScoreClass(82)).toBe('score-high');
    expect(component.getScoreClass(65)).toBe('score-medium');
    expect(component.getScoreClass(40)).toBe('score-low');
  });

  it('should render rows for pull requests', () => {
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tr.table-row');
    expect(rows.length).toBe(2);
  });

  it('should show empty state when pull request list is empty', () => {
    pullRequestServiceSpy.getPullRequests.and.returnValue(of([]));
    fixture.detectChanges();

    const emptyTitle = fixture.nativeElement.querySelector('.empty-state h2')?.textContent;
    expect(emptyTitle).toContain('No Pull Requests Found');
  });
});
