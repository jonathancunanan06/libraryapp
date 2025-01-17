import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signOut } from 'firebase/auth';
import { Platform } from '@ionic/angular';
import { AuthService } from '../firebase.service';
import { ActionSheetController,ToastController,AlertController } from '@ionic/angular';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
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
  friends: { name: string }[] = [];
  username: string = '';
  users:{name:string}[]=[
  ]
  messages: { sender: string; text: string }[] = [];
  chatMessage: string = ''; 
  filteredUsers: { name: string }[] = [];
  searchQuery: string = '';
  sharedFiles: { sender: string; receiver: string; fileName: string; timestamp: Date }[] = [];



  constructor(private router:Router,private platform:Platform,private authService: AuthService,private actionSheetController: ActionSheetController,private toastController:ToastController,private alertController:AlertController) { 
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
    
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      console.log('current user',this.currentUser);
    });

    const savedFriends = localStorage.getItem('friends');
    if (savedFriends) {
      this.friends = JSON.parse(savedFriends);
    }

    this.getUsersFromFirestore();
    this.listenForMessages();
    this.listenForSharedFiles(); 

  }

  listenForSharedFiles() {
  const sharedFilesRef = collection(this.db, 'sharedFiles');
  const q = query(sharedFilesRef, orderBy('timestamp', 'desc'));

  onSnapshot(q, (querySnapshot) => {
    this.sharedFiles = [];
    querySnapshot.forEach((doc) => {
      const fileData = doc.data() as { sender: string; receiver: string; fileName: string; timestamp: Date };
      if (fileData.receiver === this.currentUser?.displayName) {
        this.sharedFiles.push(fileData);
      }
    });
    console.log('Shared Files:', this.sharedFiles);
  });
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
      this.filteredUsers = [...this.users]; 
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
    this.filteredUsers = [...this.users];
  }

  closeChatModal() {
    this.isChatModalOpen = false;
  }
  
  closeUsersModal() {
    this.isUsersModalOpen = false;
    this.searchQuery = '';
  }

  filterUsers() {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredUsers = this.users.filter((user) =>
      user.name.toLowerCase().includes(query)
    );
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
          text: 'Pin account',
          icon: 'pin-outline',
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
      console.log(`${name} added to pin list.`);
      this.saveFriendsToLocalStorage()
      this.presentToast(`${name} has been added`)
    } else {
      console.log(`${name} is already in the pin list.`);
      this.presentToast(`${name} has already been added`)
    }
  }

  saveFriendsToLocalStorage() {
    localStorage.setItem('friends', JSON.stringify(this.friends));
  }

  sendMessages() {
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

  async removepin(name: string) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Remove Pin',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Unpin account',
          icon: 'close-circle-outline',
          cssClass: 'custom-action-button',
          handler: () => {
            this.removeFriend(name);
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

  removeFriend(name: string) {
    const friendIndex = this.friends.findIndex((friend) => friend.name === name);
    if (friendIndex !== -1) {
      this.friends.splice(friendIndex, 1);
      this.saveFriendsToLocalStorage();
      this.presentToast(`${name} has been unpinned`);
      console.log(`${name} removed from pin list.`);
    } else {
      console.log(`${name} is not in the pin list.`);
      this.presentToast(`${name} is not pinned`);
    }
  }
  
  async sendFiles() {
    const alert = await this.alertController.create({
      header: 'Choose Files',
      message: `Choose from your list of files.`,
      cssClass:'confirm',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });
    await alert.present();
  }

listenForMessages() {
  const messagesRef = collection(this.db, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(50));

  onSnapshot(q, (querySnapshot) => {
    this.messages = []; 
    querySnapshot.forEach((doc) => {
      const messageData = doc.data() as { sender: string; text: string; receiver: string };
      if ((messageData.receiver === this.currentUser?.displayName || messageData.sender === this.currentUser?.displayName) && messageData.text) {
        this.messages.push(messageData);
      }
    });
    console.log('Messages:', this.messages);
  });
}


  sendMessage() {
    if (this.chatMessage.trim() !== '') {
      addDoc(collection(this.db, 'messages'), {
        sender: this.currentUser?.displayName || 'You',
        receiver: this.username, 
        text: this.chatMessage.trim(),
        timestamp: new Date(),
      })
      .then(() => {
        console.log('Message sent successfully');
      })
      .catch((error) => {
        console.error('Error sending message: ', error);
      });
      

      this.chatMessage = ''; 
    } else {
      console.log('Message is empty');
    }
  }

  getMessageClass(sender: string) {
    return sender === this.currentUser?.displayName ? 'message-sent' : 'message-received';
  }
  
  
}
  

