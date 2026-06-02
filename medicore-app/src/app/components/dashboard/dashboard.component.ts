import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import Chart from 'chart.js/auto';
import { AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { AppointmentService } from '../../services/appointment.service';
import { PharmacyService } from '../../services/pharmacy.service';
import { MedicalRecordService } from '../../services/medical-record.service';
import { Patient } from '../../models/patient.model';
import { Appointment } from '../../models/appointment.model';
import { Drug } from '../../models/drug.model';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  today = new Date();
  totalPatients = 0;
  totalAppointments = 0;
  scheduledAppointments = 0;
  totalDrugs = 0;
  totalRecords = 0;

  recentPatients: Patient[] = [];
  upcomingAppointments: Appointment[] = [];

  private sub = new Subscription();

  // Chart data (example placeholders)
  appointmentChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { data: [12, 19, 8, 15, 9, 12, 17], label: 'Appointments' }
    ]
  };

  patientGrowthChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { data: [5, 9, 7, 14, 20, 26], label: 'New Patients' }
    ]
  };

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  @ViewChild('appointmentCanvas', { static: false }) appointmentCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('patientCanvas', { static: false }) patientCanvas?: ElementRef<HTMLCanvasElement>;

  private appointmentChart?: Chart;
  private patientChart?: Chart;

  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private pharmacyService: PharmacyService,
    private recordService: MedicalRecordService
  ) {}

  ngOnInit(): void {
    this.sub.add(this.patientService.getAll().subscribe(p => {
      this.totalPatients = p.length;
      this.recentPatients = p.slice(0, 5);
    }));

    this.sub.add(this.appointmentService.getAll().subscribe(a => {
      this.totalAppointments = a.length;
      this.scheduledAppointments = a.filter(x => x.status === 'Scheduled' || x.status === 'Pending').length;
      this.upcomingAppointments = a.filter(x => x.status === 'Scheduled' || x.status === 'Pending').slice(0, 5);
    }));

    this.sub.add(this.pharmacyService.getAll().subscribe(d => {
      this.totalDrugs = d.length;
    }));

    this.sub.add(this.recordService.getAll().subscribe(r => {
      this.totalRecords = r.length;
    }));
  }

  ngAfterViewInit(): void {
    if (this.appointmentCanvas) {
      this.appointmentChart = new Chart(this.appointmentCanvas.nativeElement.getContext('2d')!, {
        type: 'line',
        data: this.appointmentChartData as any,
        options: this.chartOptions as any
      });
    }

    if (this.patientCanvas) {
      this.patientChart = new Chart(this.patientCanvas.nativeElement.getContext('2d')!, {
        type: 'bar',
        data: this.patientGrowthChartData as any,
        options: this.chartOptions as any
      });
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getBadgeClass(status: string): string {
    return 'badge badge-' + status.toLowerCase();
  }
}
