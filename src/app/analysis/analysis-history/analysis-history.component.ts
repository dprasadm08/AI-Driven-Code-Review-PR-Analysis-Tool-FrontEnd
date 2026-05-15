import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-analysis-history',
  templateUrl: './analysis-history.component.html',
  styleUrls: ['./analysis-history.component.css']
})
export class AnalysisHistoryComponent implements OnInit {
  history: any[] = [];

  ngOnInit(): void {
    // TODO: Load history from service
  }
}
