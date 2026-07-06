import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { AnalysisDashboardComponent } from './analysis-dashboard.component';
import { AnalysisService } from '../../core/services/analysis.service';
import { CombinedAnalysisResponse } from '../../core/models/combined-analysis.model';

describe('AnalysisDashboardComponent', () => {
  let component: AnalysisDashboardComponent;
  let fixture: ComponentFixture<AnalysisDashboardComponent>;
  let analysisServiceSpy: jasmine.SpyObj<AnalysisService>;

  const completedAnalysis: CombinedAnalysisResponse = {
    analysisId: 'analysis-1',
    repositoryId: 'repo-1',
    pullRequestId: 'pr-1',
    status: 'completed',
    triggeredAt: new Date(),
    analyzedAt: new Date('2026-07-06T09:00:00Z'),
    completedAt: new Date('2026-07-06T09:05:00Z'),
    findings: {
      bugs: [
        {
          id: 'b1',
          title: 'Bug 1',
          description: 'desc',
          severity: 'HIGH' as any,
          type: 'BUG' as any,
          file: 'a.ts',
          lineNumber: 1,
          detectedAt: new Date(),
          status: 'open' as any
        }
      ],
      security: [],
      performance: { issues: [], metrics: [] },
      codeQuality: [],
      tests: { cases: [], recommendations: [] }
    },
    summary: {
      overallScore: 80,
      riskLevel: 'low',
      criticalIssues: 0,
      highIssues: 1,
      mediumIssues: 0,
      lowIssues: 0,
      recommendation: 'ok'
    }
  };

  beforeEach(async () => {
    analysisServiceSpy = jasmine.createSpyObj<AnalysisService>('AnalysisService', [
      'getCurrentAnalysis',
      'getIsAnalyzing',
      'getAnalysis',
      'triggerAnalysis',
      'setIsAnalyzing',
      'pollAnalysisStatus'
    ]);

    analysisServiceSpy.getCurrentAnalysis.and.returnValue(of(null));
    analysisServiceSpy.getIsAnalyzing.and.returnValue(of(false));
    analysisServiceSpy.getAnalysis.and.returnValue(of(completedAnalysis));
    analysisServiceSpy.triggerAnalysis.and.returnValue(
      of({ analysisId: 'analysis-2', status: 'queued', estimatedDuration: 30 } as any)
    );
    analysisServiceSpy.pollAnalysisStatus.and.returnValue(of(completedAnalysis));

    await TestBed.configureTestingModule({
      declarations: [AnalysisDashboardComponent],
      providers: [{ provide: AnalysisService, useValue: analysisServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalysisDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should render dashboard header UI', () => {
    spyOn<any>(component, 'loadMockData').and.stub();
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h1')?.textContent;
    const subtitle = fixture.nativeElement.querySelector('.subtitle')?.textContent;

    expect(title).toContain('Analysis Dashboard');
    expect(subtitle).toContain('AI review insights');
  });

  it('should show idle status when no analysis and not triggering', () => {
    component.currentAnalysis = null;
    component.isTriggering = false;

    expect(component.getAutoAnalysisStatusLabel()).toBe('Idle');
    expect(component.getAutoAnalysisStatusClass()).toBe('status-idle');
    expect(component.getAutoAnalysisStatusIcon()).toBe('🟡');
  });

  it('should show healthy status for completed analysis', () => {
    component.currentAnalysis = completedAnalysis;

    expect(component.getAutoAnalysisStatusLabel()).toBe('Healthy');
    expect(component.getAutoAnalysisStatusClass()).toBe('status-healthy');
    expect(component.getAutoAnalysisStatusIcon()).toBe('✅');
  });

  it('should trigger analysis and poll completion on success', fakeAsync(() => {
    spyOn<any>(component, 'loadMockData').and.stub();
    fixture.detectChanges();

    component.repositoryId = 'repo-1';
    component.pullRequestId = 'pr-1';

    component.triggerAnalysis();

    expect(analysisServiceSpy.setIsAnalyzing).toHaveBeenCalledWith(true);
    expect(analysisServiceSpy.triggerAnalysis).toHaveBeenCalled();
    expect(analysisServiceSpy.pollAnalysisStatus).toHaveBeenCalledWith('analysis-2', 60, 2000);

    expect(component.isTriggering).toBeFalse();
    expect(component.successMessage).toContain('Analysis completed successfully');

    tick(5000);
    expect(component.successMessage).toBe('');
  }));

  it('should set trigger error when triggerAnalysis fails', fakeAsync(() => {
    analysisServiceSpy.triggerAnalysis.and.returnValue(throwError(() => new Error('backend unavailable')));
    spyOn<any>(component, 'loadMockData').and.stub();
    fixture.detectChanges();

    component.triggerAnalysis();

    expect(component.isTriggering).toBeFalse();
    expect(analysisServiceSpy.setIsAnalyzing).toHaveBeenCalledWith(false);
    expect(component.triggerErrorMessage).toContain('backend unavailable');

    tick(1000);
    expect((component as any).loadMockData).toHaveBeenCalled();
  }));

  it('should render empty state when no findings and no error', () => {
    spyOn<any>(component, 'loadMockData').and.stub();
    fixture.detectChanges();

    component.isLoading = false;
    component.errorMessage = '';
    component.bugFindings = [];
    component.isBugFindingsLoading = false;
    fixture.detectChanges();

    const emptyTitle = fixture.nativeElement.querySelector('.empty-state h2')?.textContent;
    expect(emptyTitle).toContain('No analysis results yet');
  });
});
