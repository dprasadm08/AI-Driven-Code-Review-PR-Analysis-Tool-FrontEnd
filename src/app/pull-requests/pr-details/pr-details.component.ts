import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pr-details',
  templateUrl: './pr-details.component.html',
  styleUrls: ['./pr-details.component.css']
})
export class PrDetailsComponent implements OnInit {
  prId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.prId = this.route.snapshot.paramMap.get('id');
    // TODO: Load PR details from service
  }
}
