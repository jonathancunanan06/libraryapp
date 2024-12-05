import { Component ,OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController,ToastController } from '@ionic/angular';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth ,  createUserWithEmailAndPassword,sendEmailVerification,updateProfile} from "firebase/auth";
import { environment } from 'src/environments/environment';




@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  isPasswordVisible: boolean=false;

  oApp = initializeApp(environment.firebase);
  oAuth = getAuth(this.oApp);
  db = getFirestore(this.oApp);
  
   
  email=""
  password=""
  username=""
  
  constructor(private router:Router,
              private loadingController: LoadingController,
              private toastController: ToastController) { }

  ngOnInit() {
  }

  //eto yung notification allert sa baba ng screen
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',  
    });
    toast.present();
  }

  
 
  validateUsername(username: string): boolean {
    const regex = /^[a-zA-Z0-9]+$/;  
    return regex.test(username);
  }

  validatePassword(password: string): boolean {
    const regex = /^[a-zA-Z0-9]{8,15}$/;
    return regex.test(password);
  }
  validateEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return regex.test(email);
  }
  
  async signUser() {

    if (!this.username.trim()) {
      this.presentToast('Please enter a username');
      return;
    }
    if (!this.validateUsername(this.username)) {
      this.presentToast('Username must be alphanumeric with no spaces or special characters.');
      return;
    }
    if (!this.email.trim()) {
      this.presentToast('Please enter email');
      return;
    }
    if (!this.validateEmail(this.email)) {
      this.presentToast('Invalid Email');
      return;
    }
    if (!this.validatePassword(this.password)) {
      this.presentToast('Password must atleat 8 alphanumeric characters');
      return;
    }

    const loading = await this.loadingController.create({
      spinner: 'crescent'
    });
    await loading.present();
  try {
  
    const userCredential = await createUserWithEmailAndPassword(this.oAuth, this.email, this.password);
    const user = userCredential.user;

     await updateProfile(user, { displayName: this.username });

    //para sa verification ng account
    await sendEmailVerification(user);
    this.presentToast('Verification link is sent to your email');

    // wag ilagay sa firestore unless verified
    this.presentToast('Please verify your email to complete signup');
    this.router.navigate(['/home']);

     //pag store ng username under sa id ng user
     await setDoc(doc(this.db, "users", user.uid), {
      displayName: this.username,
      email: this.email,
    });
 
  } catch (error: any) {
    this.presentToast(error.message);
    console.log('Error:', error.code, error.message);
  } finally {
    loading.dismiss();
  }
  }

    //para mag show ang password
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
  