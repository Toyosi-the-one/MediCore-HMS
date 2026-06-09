import { Component } from '@angular/core';
import { FooterComponent } from '../../components/footer-component/footer-component';
import { HeaderComponent } from '../../components/header-component/header-component';
@Component({
  selector: 'app-homepage',
  imports: [FooterComponent,HeaderComponent],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss',
})
export class Homepage {}
