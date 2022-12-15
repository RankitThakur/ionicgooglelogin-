import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: [],
})
export class AdminPage implements OnInit {
  @Input() users: string;
  constructor(private auth: AuthService, private router: Router) {

  }

  ngOnInit() {}

  async onLogout(){
    try{
    this.auth.logout()
    this.redirectuser()
    console.log('logout')
    }
    catch(error){
      console.log(error)
    }
  }
  
  redirectuser() {
    this.router.navigate(['login']);
  }

}
