import { Controller, Get } from '@nestjs/common';
import { FirestoreService } from './firestore.service';

@Controller('firestore')
export class FirestoreController {
  constructor(private readonly firestoreService: FirestoreService) {}

  @Get('patients')
  async getPatients() {
    const patients = await this.firestoreService.getPatientsCollection();
    return patients;
  }
}
