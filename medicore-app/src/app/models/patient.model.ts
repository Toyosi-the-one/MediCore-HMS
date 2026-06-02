export interface Patient {
  id?: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  diagnosis: string;
  prescription: string;
  createdAt?: Date;
  updatedAt?: Date;
}
