export interface FirebaseLoginDto {
  token: string;
}
export interface EmailandPasswordDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist';
}
