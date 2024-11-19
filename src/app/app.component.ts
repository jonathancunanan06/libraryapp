import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { PushNotifications } from '@capacitor/push-notifications'; 


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  
  private auth = getAuth(initializeApp(environment.firebase));
  isDarkMode: boolean = false;
  title = 'fcm-angular';
  message: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');  
      this.isDarkMode = true;
    } else {
      document.body.classList.remove('dark');  
      this.isDarkMode = false;
    }

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        if (user.emailVerified) {
          this.router.navigate(['/tabs']);  
        } else {
          this.router.navigate(['/home']); 
        }
      } else {
        this.router.navigate(['/home']);
      }
    });

    this.requestPermission();
    this.listen();
  }

  async requestPermission() {
    try {
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive === 'granted') {
        console.log('Notification permission granted');
        this.getToken();
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting permission', error);
    }
  }

  getToken() {
    const messaging = getMessaging();
    getToken(messaging, {
      vapidKey: environment.firebase.vapidKey,
    })
      .then((currentToken) => {
        if (currentToken) {
          console.log('Your token is: ', currentToken);
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      })
      .catch((error) => {
        console.error('An error occurred while retrieving token.', error);
      });
  }
  listen() {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      console.log('Message received: ', payload);
      this.message = payload;
    });
  }
}
