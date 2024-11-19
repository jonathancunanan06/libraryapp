import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../firebase.service';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  email = '';
  password = '';
  isPasswordVisible: boolean = false;
  appVersion: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.platform.ready().then(() => {
      this.getAppVersion();
    });
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  loginUser() {
    this.authService.loginUser(this.email, this.password);
  }

  async getAppVersion() {
    const info = await App.getInfo();
    this.appVersion = info.version;
    console.log('App Version:', this.appVersion); 
  }
}
