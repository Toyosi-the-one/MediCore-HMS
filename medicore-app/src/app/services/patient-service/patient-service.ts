import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class PatientService {
  patients: any[] = [];
  constructor(private http: HttpClient) {}
  async getPatients() {
    // this.patients = await this.http.get('http://localhost:3000/firestore/patients');
    // const patientnumber = patients.length;
  }
}
