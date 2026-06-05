import { Component, computed, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './core/components/toast/toast.component';
// import { Component, OnInit } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';
import { ToastComponent } from './shared/toast/toast.component';
import { SeedService } from './services/seed.service';
import { filter } from 'rxjs';
//import { HeaderComponent } from './components/header-component/header-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, ToastComponent, SidebarComponent],
  templateUrl: './app.htmL',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  david = false;

  constructor(
    private router: Router,
    private seedService: SeedService,
  ) {
    this.updateRouteFlag();

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateRouteFlag();
    });
  }

  private updateRouteFlag() {
    this.david =
      this.router.url.startsWith('/pharmacy') ||
      this.router.url.startsWith('/medical-records') ||
      this.router.url.startsWith('/appointments');
    }

  ngOnInit(): void {
    this.seedService.seedIfEmpty().catch(console.error);
  }
  // export class App implements OnInit {

  // }

  // @Component({
  //   selector: 'app-root',
  //   imports: [RouterOutlet, ],
  //   templateUrl: './app.html',
  //   styleUrl: './app.scss'
  // })

  // @Component({
  //   selector: 'app-root',
  //   standalone: true,
  //   imports: [RouterOutlet, , ],
  //   templateUrl: './app.html',
  //   styleUrl: './app.css'
  // })
}
function toSignal(arg0: any, arg1: { initialValue: null }) {
  throw new Error('Function not implemented.');
}
