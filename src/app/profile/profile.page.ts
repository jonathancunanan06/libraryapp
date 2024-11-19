import { Component, OnInit } from '@angular/core';
import { getAuth, signOut, updateProfile,updateEmail, sendEmailVerification, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { AuthService } from '../firebase.service';
import { Router } from '@angular/router';
import { LoadingController,ToastController } from '@ionic/angular';
import { Firestore, doc, setDoc ,getFirestore} from 'firebase/firestore';



@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  auth = getAuth();
  db: Firestore = getFirestore(); 
  currentUser: any = null;
  displayName: string = '';
  email: string = '';
  password: string = ''; 
  showPasswordField: boolean = false; 
  creationDate: string = ''; 

  constructor(private router: Router, private authService: AuthService, private toastController: ToastController,private loadingController: LoadingController,) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (this.currentUser) {
        this.displayName = this.currentUser.displayName || '';
        this.email = this.currentUser.email || '';
        this.creationDate = this.currentUser.metadata.creationTime;
      }
    });
}

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',  
    });
    toast.present();
} 

logout() {
  this.loadingController.create({
    spinner: 'crescent', 
    duration:3000
  }).then((loading) => {
    loading.present(); 

    signOut(this.auth).then(() => {
      console.log('User signed out');
      loading.dismiss(); 
      localStorage.removeItem('currentUserId');
      this.router.navigate(['/home']);
    })
    .catch(error => {
      console.log('Error during logout:', error);
      loading.dismiss(); 
      this.presentToast(`Error: ${error.message}`);
    });
  });
}


validateDisplayName(name: string): boolean {
  const regex = /^[a-zA-Z0-9]+$/; 
  return regex.test(name);
}

async saveDisplayName() {
  if (this.currentUser && this.displayName) {
    if (!this.validateDisplayName(this.displayName)) {
     
      this.presentToast('Display name must be alphanumeric with no spaces or special characters.');
      return;
    }

    try {
      await updateProfile(this.currentUser, { displayName: this.displayName });
      console.log('Display name updated in Firebase Authentication');

      await setDoc(doc(this.db, 'users', this.currentUser.uid), {
        displayName: this.displayName,
        email: this.email,
      });
      console.log('Display name updated in Firestore');
      this.presentToast('Username Updated');
    } catch (error: any) {
      console.log('Error updating display name:', error);
      this.presentToast(`Error: ${error.message}`);
    }
  }
}

  deleteAccount() {
    if (this.currentUser) {
      this.loadingController.create({
        spinner: 'crescent',  
        duration:3000
      }).then((loading) => {
        loading.present();  

        this.currentUser.delete().then(() => {
          console.log('User account deleted');
          loading.dismiss(); 
          this.presentToast('Account deleted');
          this.router.navigate(['/home']);
        }).catch((error: any) => {
          console.log('Error deleting account:', error);
          loading.dismiss();  
          this.presentToast(`Error: ${error.message}`);
        });
      });
    }
  }
}
