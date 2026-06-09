import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService } from '../../services/pharmacy.service';
import { Drug } from '../../models/drug.model';
import { Subscription } from 'rxjs';
//import { SideBarComponent } from "../sideBar/sideBar.component";

@Component({
  selector: 'app-pharmacy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pharmacy.component.html',
  styleUrl: './pharmacy.component.css'
})
export class PharmacyComponent implements OnInit, OnDestroy {
  drugs: Drug[] = [];
  filtered: Drug[] = [];
  searchTerm = '';
  showModal = false;
  isEditing = false;
  saving = false;

  form: Omit<Drug, 'id'> = this.emptyForm();
  private editId: string | null = null;
  private sub = new Subscription();

  categories = ['Antibiotic', 'Antihypertensive', 'Antidiabetic', 'Analgesic', 'Antiviral', 'Bronchodilator', 'NSAID', 'Proton Pump Inhibitor', 'Antimigraine', 'Statin', 'Antihistamine', 'Other'];

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.sub.add(this.pharmacyService.getAll().subscribe(d => {
      this.drugs = d;
      this.applyFilter();
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  emptyForm(): Omit<Drug, 'id'> {
    return { name: '', quantity: 0, price: 0, expiryDate: '', category: 'Other', manufacturer: '', description: '' };
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filtered = term
      ? this.drugs.filter(d =>
          d.name.toLowerCase().includes(term) ||
          d.category.toLowerCase().includes(term) ||
          (d.manufacturer || '').toLowerCase().includes(term)
        )
      : [...this.drugs];
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.isEditing = false;
    this.editId = null;
    this.showModal = true;
  }

  openEdit(drug: Drug): void {
    this.form = { name: drug.name, quantity: drug.quantity, price: drug.price, expiryDate: drug.expiryDate, category: drug.category, manufacturer: drug.manufacturer || '', description: drug.description || '' };
    this.isEditing = true;
    this.editId = drug.id!;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  async save(): Promise<void> {
    if (!this.form.name.trim()) return;
    this.saving = true;
    try {
      if (this.isEditing && this.editId) {
        await this.pharmacyService.update(this.editId, this.form);
      } else {
        await this.pharmacyService.add(this.form);
      }
      this.showModal = false;
    } finally {
      this.saving = false;
    }
  }

  async delete(id: string): Promise<void> {
    if (confirm('Delete this drug from inventory?')) {
      await this.pharmacyService.delete(id);
    }
  }

  isExpiringSoon(expiryDate: string): boolean {
    const exp = new Date(expiryDate);
    const now = new Date();
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 90 && diff > 0;
  }

  isExpired(expiryDate: string): boolean {
    return new Date(expiryDate) < new Date();
  }

  isLowStock(quantity: number): boolean {
    return quantity < 100;
  }

  get lowStockCount(): number {
    return this.drugs.filter(d => this.isLowStock(d.quantity)).length;
  }

  get expiryAlertCount(): number {
    return this.drugs.filter(d => this.isExpired(d.expiryDate) || this.isExpiringSoon(d.expiryDate)).length;
  }
}
