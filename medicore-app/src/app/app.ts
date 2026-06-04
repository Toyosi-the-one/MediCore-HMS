<<<<<<< HEAD
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './core/components/toast/toast.component';

//import { HeaderComponent } from './components/header-component/header-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,ToastContainerComponent],
  templateUrl: './app.htmL',
  styleUrl: './app.scss',

})
  export class App {
  protected readonly title = 'MediCore HMS';
  }


// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet, ],
//   templateUrl: './app.html',
//   styleUrl: './app.scss'
// })
=======
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
>>>>>>> 3f8422f65d94c599d895ecf7d7ad39de852615c6
