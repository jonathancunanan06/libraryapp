import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signOut } from 'firebase/auth';
import { Platform } from '@ionic/angular';
import { AuthService } from '../firebase.service';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-message',
  templateUrl: './message.page.html',
  styleUrls: ['./message.page.scss'],
})
export class MessagePage implements OnInit {

  auth=getAuth()
  isDarkMode: boolean =false;
  currentUser: any = null;

  constructor(private router:Router,private platform:Platform,private authService: AuthService,private actionSheetController: ActionSheetController) { 
    this.isDarkMode = document.body.classList.contains('dark');
  }
  

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
      this.isDarkMode = true;
    } else {
      document.body.classList.remove('dark');
      this.isDarkMode = false;
    }
    //para makuha yung info ng current user
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      console.log(this.currentUser);
    });
    
  }

  toggleTheme() {
    // pag iba kung light o dark
    if (this.isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme','dark')
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme','light')
    }
  }
  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Action',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'new message',
          icon: 'mail-open-outline',
          cssClass: 'custom-action-button',
          handler: () => {
            console.log('new message');
          }
        },
        {
          text: 'archive',
          icon: 'archive-outline',
          cssClass: 'custom-action-button',
          handler: () => {
            console.log('archive');

          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'custom-action-button',
          handler: () => {
            console.log('Action Sheet closed');
          }
        }
      ]
    });
    await actionSheet.present();
  }

}
