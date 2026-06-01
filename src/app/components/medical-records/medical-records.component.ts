import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicalRecordService } from '../../services/medical-record.service';
import { MedicalRecord } from '../../models/medical-record.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medical-records.component.html',
  styleUrl: './medical-records.component.css'
})
export class MedicalRecordsComponent implements OnInit, OnDestroy {
  records: MedicalRecord[] = [];
  filtered: MedicalRecord[] = [];
  searchTerm = '';
  showModal = false;
  isEditing = false;
  saving = false;
  selectedRecord: MedicalRecord | null = null;
  showDetail = false;

  form: Omit<MedicalRecord, 'id'> = this.emptyForm();
  private editId: string | null = null;
  private sub = new Subscription();

  constructor(private recordService: MedicalRecordService) {}

  ngOnInit(): void {
    this.sub.add(this.recordService.getAll().subscribe(r => {
      this.records = r;
      this.applyFilter();
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  emptyForm(): Omit<MedicalRecord, 'id'> {
    const today = new Date().toISOString().split('T')[0];
    return { patientName: '', patientId: '', diagnosis: '', prescription: '', doctorName: 'Dr. Adams', date: today, notes: '', bloodPressure: '', heartRate: '', temperature: '', weight: '' };
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filtered = term
      ? this.records.filter(r =>
          r.patientName.toLowerCase().includes(term) ||
          r.diagnosis.toLowerCase().includes(term) ||
          r.doctorName.toLowerCase().includes(term)
        )
      : [...this.records];
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.isEditing = false;
    this.editId = null;
    this.showModal = true;
  }

  openEdit(record: MedicalRecord): void {
    this.form = { patientName: record.patientName, patientId: record.patientId || '', diagnosis: record.diagnosis, prescription: record.prescription, doctorName: record.doctorName, date: record.date, notes: record.notes || '', bloodPressure: record.bloodPressure || '', heartRate: record.heartRate || '', temperature: record.temperature || '', weight: record.weight || '' };
    this.isEditing = true;
    this.editId = record.id!;
    this.showModal = true;
  }

  viewDetail(record: MedicalRecord): void {
    this.selectedRecord = record;
    this.showDetail = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedRecord = null;
  }

  async save(): Promise<void> {
    if (!this.form.patientName.trim()) return;
    this.saving = true;
    try {
      if (this.isEditing && this.editId) {
        await this.recordService.update(this.editId, this.form);
      } else {
        await this.recordService.add(this.form);
      }
      this.showModal = false;
    } finally {
      this.saving = false;
    }
  }

  async delete(id: string): Promise<void> {
    if (confirm('Delete this medical record?')) {
      await this.recordService.delete(id);
    }
  }
}
