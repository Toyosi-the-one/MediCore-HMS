export interface MedicalRecord {
  id?: string;
  patientId: string;
  patientName: string;
  diagnosis: string;
  prescription: string;
  doctorName: string;
  date: string;
  notes?: string;
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  weight?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
