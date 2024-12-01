import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../firebase.service';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import {ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  showSplash = true;
  email = '';
  password = '';
  isPasswordVisible: boolean = false;
  appVersion: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private platform: Platform,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.platform.ready().then(() => {
      this.getAppVersion();
    });
    setTimeout(() => {
      this.showSplash = false;
    }, 3000); 
  }
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',  
    });
    toast.present();
  }

  validateEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return regex.test(email);
  }
  
   loginuser() {

  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  loginUser() {
    if (!this.validateEmail(this.email)) {
      this.presentToast('Invalid Email');
      return;
    }
    else{
      this.authService.loginUser(this.email, this.password);
    }
  }

  async getAppVersion() {
    const info = await App.getInfo();
    this.appVersion = info.version;
    console.log('App Version:', this.appVersion); 
  }
}
