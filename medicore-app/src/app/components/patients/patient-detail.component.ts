import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <a routerLink="/patients" class="btn btn-outline">Back</a>
      <h1>Patient Details</h1>
      <div *ngIf="patient; else loading">
        <h2>{{ patient.name }}</h2>
        <p><strong>Age:</strong> {{ patient.age }}</p>
        <p><strong>Gender:</strong> {{ patient.gender }}</p>
        <p><strong>Phone:</strong> {{ patient.phone }}</p>
        <h3>Medical History</h3>
        <div *ngIf="patient.history?.length; else none"> 
          <ul>
            <li *ngFor="let h of patient.history">{{ h }}</li>
          </ul>
        </div>
        <ng-template #none><p>No history available</p></ng-template>
      </div>
      <ng-template #loading><p>Loading...</p></ng-template>
    </div>
  `
})
export class PatientDetailComponent implements OnInit {
  patient: any | null = null;

  constructor(private route: ActivatedRoute, private ps: PatientService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.ps.getById(id).then(p => this.patient = p).catch(() => this.patient = null);
  }
}
