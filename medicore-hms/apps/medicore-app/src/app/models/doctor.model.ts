export interface Doctor {
  id?: string;
  name: string;
  title: string;
  specialization: string;
  sex: string;
  phone: string;
  email: string;
  license: string;
  address: string;
  about: string;
  experience: number;
  patientsManaged: number;
  createdAt?: Date;
  updatedAt?: Date;
}
