import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pr-list',
  templateUrl: './pr-list.component.html',
  styleUrls: ['./pr-list.component.css']
})
export class PrListComponent implements OnInit {
  pullRequests: any[] = [];

  ngOnInit(): void {
    // TODO: Load pull requests from service
  }
}
