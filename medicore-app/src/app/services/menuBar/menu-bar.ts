import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MenuBar {
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    console.log('Sidebar toggled. Now open:', this.sidebarOpen);
    
  }
}
