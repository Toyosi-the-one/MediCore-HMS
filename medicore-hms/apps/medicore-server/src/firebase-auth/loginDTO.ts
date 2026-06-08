export interface FirebaseLoginDto {
  token: string;
}
export interface EmailandPasswordDto {
  displayName: string;
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist';
}
