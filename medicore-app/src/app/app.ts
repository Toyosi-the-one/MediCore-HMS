import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';
import { ToastComponent } from './shared/toast/toast.component';
import { SeedService } from './services/seed.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(private seedService: SeedService) {}

  ngOnInit(): void {
    this.seedService.seedIfEmpty().catch(console.error);
  }
}
