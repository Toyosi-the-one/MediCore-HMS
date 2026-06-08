import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-sideBar',
  templateUrl: './sideBar.component.html',
  styleUrls: ['./sideBar.component.scss'],
  imports: [RouterLink]
})
export class SideBarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
