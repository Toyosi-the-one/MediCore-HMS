import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { PatientSessionService } from '../../core/services/patient-session.service';

@Component({
  selector: 'app-patient-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UpperCasePipe],
  templateUrl: './patient-layout.component.html',
  styleUrl: './patient-layout.component.scss'
})
export class PatientLayoutComponent {
  private session = inject(PatientSessionService);
  private router = inject(Router);

  patient = this.session.currentPatient;

  constructor() {
    // If no patient is set, boot them back to the login screen
    if (!this.session.currentPatientId()) {
      this.router.navigate(['/patient']);
    }
  }

  logout() {
    this.session.clearPatient();
    this.router.navigate(['/patient']);
  }
}
