import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword  } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';
import { Observable,BehaviorSubject } from 'rxjs';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements CanActivate {

  private oApp = initializeApp(environment.firebase);
  private oAuth = getAuth(this.oApp);
  private userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);


  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    onAuthStateChanged(this.oAuth, (user) => {
      if (user) {
        this.userSubject.next(user);
      }
    });
  }

    //method para kunin ang current user
    getCurrentUser() {
      return this.userSubject.asObservable();
    }
  
  // AuthGuard para ma check kung logged in ang user
  canActivate(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      onAuthStateChanged(this.oAuth, (user) => {
        if (user) {
          observer.next(true); //oo naka log in at allowed sa mga route
          
        } else {
          observer.next(false); //hindi logged in kaya blocked ka sa mga route
          this.router.navigate(['/home']); 
        }
      });
    });
  }

  // method ng pa log in
  async loginUser(email: string, password: string): Promise<void> {
    const loading = await this.loadingController.create({
      spinner: 'crescent',
    });
    await loading.present();

    signInWithEmailAndPassword(this.oAuth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        if (user.emailVerified) {
          // true yung account at verified to
          loading.dismiss();
          console.log('Logged in successfully');
          this.userSubject.next(user); //pag update ng user state
          this.router.navigate(['/tabs']);
        } else {
          // hindi verified
          loading.dismiss();
          this.presentToast('Account is not verified');
          console.log('Verify your account first');
        }
      })
      .catch((error) => {
        loading.dismiss();
        const errorMessage = error.message;
        console.log('Login failed:', errorMessage);
        this.presentToast('Login failed: ' + errorMessage);
      });
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  // Logout ito
  async logoutUser(): Promise<void> {
    const loading = await this.loadingController.create({
      spinner: 'crescent',
    });
    await loading.present();

    const auth = getAuth();
    auth.signOut()
      .then(() => {
        loading.dismiss();
        this.userSubject.next(null); //mag clear ng user state
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        loading.dismiss();
        console.log('Logout failed:', error);
      });
  }

}
