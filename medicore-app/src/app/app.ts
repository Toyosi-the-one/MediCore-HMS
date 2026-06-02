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
