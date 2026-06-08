import { Injectable } from '@angular/core';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

@Injectable({ providedIn: 'root' })
export class SeedService {
  async seedIfEmpty(): Promise<void> {
    const patientsSnap = await getDocs(collection(db, 'patients'));
    if (!patientsSnap.empty) return;

    const patients = [
      { name: 'Sarah Johnson', age: 34, gender: 'Female', phone: '555-0101', address: '12 Oak Street, Boston', diagnosis: 'Hypertension', prescription: 'Lisinopril 10mg daily' },
      { name: 'Michael Chen', age: 52, gender: 'Male', phone: '555-0102', address: '45 Maple Ave, Chicago', diagnosis: 'Type 2 Diabetes', prescription: 'Metformin 500mg twice daily' },
      { name: 'Emily Rodriguez', age: 28, gender: 'Female', phone: '555-0103', address: '7 Pine Road, Houston', diagnosis: 'Asthma', prescription: 'Albuterol inhaler as needed' },
      { name: 'Robert Williams', age: 67, gender: 'Male', phone: '555-0104', address: '89 Elm Street, Phoenix', diagnosis: 'Arthritis', prescription: 'Ibuprofen 400mg three times daily' },
      { name: 'Amanda Foster', age: 41, gender: 'Female', phone: '555-0105', address: '23 Cedar Lane, Seattle', diagnosis: 'Migraine', prescription: 'Sumatriptan 50mg as needed' },
      { name: 'James Park', age: 59, gender: 'Male', phone: '555-0106', address: '56 Birch Blvd, Denver', diagnosis: 'GERD', prescription: 'Omeprazole 20mg once daily' },
    ];

    const appointments = [
      { patientName: 'Sarah Johnson', doctorName: 'Dr. Adams', date: '2026-05-26', time: '09:00', status: 'Scheduled', type: 'Follow-up', notes: 'Blood pressure check' },
      { patientName: 'Michael Chen', doctorName: 'Dr. Smith', date: '2026-05-26', time: '10:30', status: 'Scheduled', type: 'Routine Checkup', notes: 'HbA1c test results review' },
      { patientName: 'Emily Rodriguez', doctorName: 'Dr. Adams', date: '2026-05-27', time: '14:00', status: 'Pending', type: 'Consultation', notes: 'Breathing difficulty assessment' },
      { patientName: 'Robert Williams', doctorName: 'Dr. Lee', date: '2026-05-28', time: '11:00', status: 'Scheduled', type: 'Follow-up', notes: 'Joint pain evaluation' },
      { patientName: 'Amanda Foster', doctorName: 'Dr. Smith', date: '2026-05-24', time: '15:30', status: 'Completed', type: 'Consultation', notes: 'Migraine frequency review' },
    ];

    const drugs = [
      { name: 'Lisinopril 10mg', quantity: 500, price: 0.25, expiryDate: '2027-06-30', category: 'Antihypertensive', manufacturer: 'Pfizer' },
      { name: 'Metformin 500mg', quantity: 1200, price: 0.15, expiryDate: '2027-12-31', category: 'Antidiabetic', manufacturer: 'Merck' },
      { name: 'Albuterol Inhaler', quantity: 85, price: 45.0, expiryDate: '2026-09-15', category: 'Bronchodilator', manufacturer: 'GSK' },
      { name: 'Ibuprofen 400mg', quantity: 2000, price: 0.1, expiryDate: '2028-01-01', category: 'NSAID', manufacturer: 'Johnson & Johnson' },
      { name: 'Sumatriptan 50mg', quantity: 150, price: 8.5, expiryDate: '2027-03-20', category: 'Antimigraine', manufacturer: 'AstraZeneca' },
      { name: 'Omeprazole 20mg', quantity: 750, price: 0.35, expiryDate: '2027-08-10', category: 'Proton Pump Inhibitor', manufacturer: 'Novartis' },
      { name: 'Amoxicillin 250mg', quantity: 600, price: 0.5, expiryDate: '2026-11-30', category: 'Antibiotic', manufacturer: 'Cipla' },
      { name: 'Atorvastatin 20mg', quantity: 400, price: 1.2, expiryDate: '2027-05-15', category: 'Statin', manufacturer: 'Pfizer' },
    ];

    const medicalRecords = [
      { patientName: 'Sarah Johnson', patientId: '', diagnosis: 'Hypertension Stage 1', prescription: 'Lisinopril 10mg daily, low-sodium diet', doctorName: 'Dr. Adams', date: '2026-05-10', bloodPressure: '145/92', heartRate: '78', temperature: '98.6', weight: '68kg', notes: 'Patient advised lifestyle changes' },
      { patientName: 'Michael Chen', patientId: '', diagnosis: 'Type 2 Diabetes - Controlled', prescription: 'Metformin 500mg twice daily', doctorName: 'Dr. Smith', date: '2026-05-12', bloodPressure: '130/85', heartRate: '82', temperature: '98.4', weight: '82kg', notes: 'HbA1c 7.2% - good control' },
      { patientName: 'Emily Rodriguez', patientId: '', diagnosis: 'Moderate Persistent Asthma', prescription: 'Albuterol inhaler PRN, Fluticasone 100mcg BID', doctorName: 'Dr. Adams', date: '2026-05-15', bloodPressure: '118/76', heartRate: '88', temperature: '98.8', weight: '58kg', notes: 'Spirometry scheduled' },
    ];

    for (const p of patients) {
      await addDoc(collection(db, 'patients'), { ...p, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
    for (const a of appointments) {
      await addDoc(collection(db, 'appointments'), { ...a, createdAt: serverTimestamp() });
    }
    for (const d of drugs) {
      await addDoc(collection(db, 'pharmacy'), { ...d, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
    for (const r of medicalRecords) {
      await addDoc(collection(db, 'medicalRecords'), { ...r, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
  }
}
