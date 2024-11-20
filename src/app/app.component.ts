import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  
  private auth = getAuth(initializeApp(environment.firebase));
  isDarkMode: boolean = false;

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
  }

  
}
