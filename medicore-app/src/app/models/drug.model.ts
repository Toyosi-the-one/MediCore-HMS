export interface Drug {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  expiryDate: string;
  category: string;
  manufacturer?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
