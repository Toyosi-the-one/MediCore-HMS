import { Component } from '@angular/core';
import { MenuBar } from '../../services/menuBar/menu-bar';
import { UserDetails } from '../../services/userDetails/user-details';
import { UserDetailsStore } from '../../store/userDetails.store';
import { NgOptimizedImage } from "@angular/common";
// import { TextInput } from "../text-input/text-input";
@Component({
  selector: 'app-header2',
  imports: [NgOptimizedImage],
  templateUrl: './header2.html',
  styleUrl: './header2.scss',
})
export class Header2 {
  userDetails: any;
  constructor(
    public menu: MenuBar,
    public user: UserDetails,
    public store: UserDetailsStore,
  ) {
    this.userDetails = this.store.userDetails;
    console.log(this.userDetails());
  }

  toggleMenu() {
    this.menu.toggleSidebar();
    document.body.classList.toggle('no-scroll', this.menu.sidebarOpen);
  }
  // async ngOnInit() {
  //   this.userDetails = await this.user.getUserDetails();
  //   console.log(this.userDetails);
  //   if (!this.userDetails) {
  //     return;
  //   }
  // }
}
