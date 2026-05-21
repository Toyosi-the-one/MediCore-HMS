import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//import { HeaderComponent } from './components/header-component/header-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.htmL',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('medicore-app');
}
