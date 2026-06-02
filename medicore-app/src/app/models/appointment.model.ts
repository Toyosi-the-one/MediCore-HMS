export interface Appointment {
  id?: string;
  patientName: string;
  patientId?: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Pending';
  type: string;
  notes?: string;
  createdAt?: Date;
}
