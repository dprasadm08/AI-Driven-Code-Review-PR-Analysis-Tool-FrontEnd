import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-analysis-details',
  templateUrl: './analysis-details.component.html',
  styleUrls: ['./analysis-details.component.css']
})
export class AnalysisDetailsComponent implements OnInit {
  analysisId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.analysisId = this.route.snapshot.paramMap.get('id');
    // TODO: Load analysis details from service
  }
}
