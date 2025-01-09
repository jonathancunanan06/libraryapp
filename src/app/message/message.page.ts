import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signOut } from 'firebase/auth';
import { Platform } from '@ionic/angular';
import { AuthService } from '../firebase.service';
import { ActionSheetController,ToastController } from '@ionic/angular';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-message',
  templateUrl: './message.page.html',
  styleUrls: ['./message.page.scss'],
})
export class MessagePage implements OnInit {

  oApp = initializeApp(environment.firebase);
  db = getFirestore(this.oApp);

  auth=getAuth()
  isDarkMode: boolean =false;
  currentUser: any = null;
  friends: { name: string }[] = [

  ];
  username: string = '';
  users:{name:string}[]=[
  ]
  messages: { sender: string; text: string }[] = [];
  chatMessage: string = ''; 

  constructor(private router:Router,private platform:Platform,private authService: AuthService,private actionSheetController: ActionSheetController,private toastController:ToastController) { 
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
    console.log(this.friends);
    
    //para makuha yung info ng current user
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      console.log('current user',this.currentUser);
         if (this.currentUser) {
          if (!this.friends.some(friend => friend.name === this.currentUser.displayName)) {
            this.friends.unshift({ name: 'Self' });
            console.log('Added current user to friends:', this.friends);
            this.saveFriendsToLocalStorage();
          }
        }
    });

    const savedFriends = localStorage.getItem('friends');
    if (savedFriends) {
      this.friends = JSON.parse(savedFriends);
    }

    this.getUsersFromFirestore();
  }

  async getUsersFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(this.db, 'users'));
      this.users = [];  
  
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData['displayName'] !== this.currentUser?.displayName) {
          this.users.push({
            name: userData['displayName'], 
          });
        }
      });
      console.log('Users fetched successfully:', this.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
  

  isChatModalOpen = false;
  isUsersModalOpen = false;

  openChatModal(username: string) {
    this.username = username;
    const selectedFolder = this.friends.find(f => f.name === username);
    this.isChatModalOpen = true;
  }

  openUsersModal() {
    this.isUsersModalOpen = true;
  }

  closeChatModal() {
    this.isChatModalOpen = false;
  }
  
  closeUsersModal() {
    this.isUsersModalOpen = false;
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
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

  async presentActionSheetAddfriend(name: string) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Action',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Add Friend',
          icon: 'person-add-outline',
          cssClass: 'custom-action-button',
          handler: () => {
            this.addFriend(name);
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
  
  addFriend(name: string) {
    const isAlreadyFriend = this.friends.some((friend) => friend.name === name);
    if (!isAlreadyFriend) {
      this.friends.push({ name });
      console.log(`${name} added to friends list.`);
      this.saveFriendsToLocalStorage()
      this.presentToast(`${name} has been added`)
    } else {
      console.log(`${name} is already in the friends list.`);
      this.presentToast(`${name} has already been added`)
    }
  }

  saveFriendsToLocalStorage() {
    localStorage.setItem('friends', JSON.stringify(this.friends));
  }

  sendMessage() {
    if (this.chatMessage.trim() !== '') {
      this.messages.push({
        sender: this.currentUser?.displayName || 'You', 
        text: this.chatMessage.trim(),
      });
      this.chatMessage = '';
    } else {
      console.log('Message is empty');
    }
  }
  
}
  

