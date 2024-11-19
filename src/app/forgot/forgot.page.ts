import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getAuth,sendPasswordResetEmail} from "firebase/auth";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.page.html',
  styleUrls: ['./forgot.page.scss'],
})
export class ForgotPage implements OnInit {

   oApp = initializeApp(environment.firebase);
   oAuth = getAuth(this.oApp);
 
   email = '';

  constructor(private router:Router) { }

  ngOnInit() {
  }

  resetPassword() {
    sendPasswordResetEmail(this.oAuth, this.email)
      .then(() => {
        console.log("Password reset email sent!");
        this.router.navigate(['/home'])
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.log(errorMessage);
      });
  }

}
