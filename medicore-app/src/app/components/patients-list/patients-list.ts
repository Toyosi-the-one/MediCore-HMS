import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { FirestoreService } from '../../services/firestore-service/firestore.service';
import { Observable } from 'rxjs';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [AgGridAngular, AsyncPipe],
  templateUrl: './patients-list.html',
})
export class PatientsList {
  columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      sortable: true,
      filter: true,
      flex: 1,
      valueGetter: (p) =>
        (p.data?.name ?? `${p.data?.firstName ?? ''} ${p.data?.lastName ?? ''}`.trim()) || 'N/A',
    },
    {
      headerName: 'Age',
      sortable: true,
      width: 90,
      valueGetter: (p) => p.data?.age ?? 'N/A',
    },
    {
      headerName: 'Diagnosis',
      filter: true,
      flex: 1,
      valueGetter: (p) => p.data?.diagnosis ?? 'N/A',
    },
    {
      headerName: 'Prescription',
      flex: 2,
      valueGetter: (p) => p.data?.prescription ?? 'N/A',
    },
  ];

  defaultColDef: ColDef = { resizable: true };
  patients$: Observable<any[]>;

  constructor(private firestore: FirestoreService) {
    this.patients$ = this.firestore.patients$;
  }
}
