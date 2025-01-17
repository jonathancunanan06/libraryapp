import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signOut } from 'firebase/auth';
import { Platform } from '@ionic/angular';
import { AuthService } from '../firebase.service';
import { ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-inside',
  templateUrl: './inside.page.html',
  styleUrls: ['./inside.page.scss'],
})
export class InsidePage implements OnInit {

  auth = getAuth();
  isDarkMode: boolean = false;
  currentUser: any = null;
  folders: { name: string, files: any[] }[] = []; 
  selectedFolderName: string = '';
  selectedFile: File | null = null;  
  folderFiles: any[] = []; 
  pinnedUsers: { id: number, name: string, email: string }[] = [];
  friends: any[] = [];

 
  db: any;  

  constructor(private router: Router, private platform: Platform, private authService: AuthService, private actionSheetController: ActionSheetController, private alertController: AlertController, private toastController: ToastController,) {
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

    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      console.log(this.currentUser);
    });

    const savedFolders = localStorage.getItem('folders');
    if (savedFolders) {
      this.folders = JSON.parse(savedFolders);
    } else {
      this.folders = [];
      this.saveFoldersToLocalStorage();
    }

    
    const storedFriends = localStorage.getItem('friends');
    this.friends = storedFriends ? JSON.parse(storedFriends) : [];
  }

  isFolderModalOpen = false;

  openFolderModal(folderName: string) {
    this.selectedFolderName = folderName;
    const selectedFolder = this.folders.find(f => f.name === folderName);
    this.folderFiles = selectedFolder ? selectedFolder.files : [];
    this.isFolderModalOpen = true;
  }

  closeFolderModal() {
    this.isFolderModalOpen = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];  
    if (file) {
      this.selectedFile = file;
    }
  }

  selectFile() {
    const inputElement: HTMLInputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = '.jpg, .jpeg, .png, .pdf, .docx'; 
    inputElement.click();

    inputElement.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        console.log('Selected file:', this.selectedFile);
        this.uploadFile();
      }
    };
  }

  uploadFile() {
    if (this.selectedFile && this.selectedFolderName) {
      const selectedFolder = this.folders.find(f => f.name === this.selectedFolderName);
  
      if (selectedFolder) {
        if (!selectedFolder.files) {
          selectedFolder.files = [];
        }
  
        selectedFolder.files.push({ name: this.selectedFile?.name, file: this.selectedFile });
        this.saveFoldersToLocalStorage();
        this.presentToast(`File "${this.selectedFile.name}" uploaded to "${this.selectedFolderName}"`);
        this.selectedFile = null;
      } else {

        console.error(`Folder "${this.selectedFolderName}" not found`);
        this.presentToast('Folder not found!');
      }
    }
  }
  
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  async presentActionSheetFolder() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Action',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Add Folder',
          icon: 'folder-open-outline',
          cssClass: 'custom-action-button',
          handler: () => {
            this.addFolder();
          }
        },
        {
          text: 'Delete all',
          icon: 'trash-outline',
          cssClass: 'custom-action-button',
          handler: () => {
            this.clearAllFolders();
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

  clearAllFolders() {
    localStorage.removeItem('folders');
    this.folders = []; 
    this.presentToast('All folders have been deleted'); 
  }
  

  async presentActionSheetFile() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Action',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Add File',
          icon: 'document-text-outline',
          cssClass: 'custom-action-button',
          handler: () => {
            this.selectFile();
            console.log('Add File clicked');
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

  async addFolder() {
    const alert = await this.alertController.create({
      header: 'New Folder',
      cssClass:'confirm',
      inputs: [
        {
          name: 'folderName',
          type: 'text',
          placeholder: 'Enter folder name',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Add Folder canceled');
          }
        },
        {
          text: 'Add',
          handler: (data: any) => {
            if (data.folderName) {
              this.folders.push({ name: data.folderName, files: [] });
              this.saveFoldersToLocalStorage();
              console.log(`Folder "${data.folderName}" added`);
              this.presentToast(`Folder "${data.folderName}" added`);
            } else {
              console.log('No folder name provided');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async manageFolder(folderName: string) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Manage Folder',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Rename',
          icon: 'create-outline',
          handler: () => {
            this.renameFolder(folderName);
          }
        },
        {
          text: 'Delete',
          icon: 'trash-outline',
          handler: () => {
            this.confirmDeleteFolder(folderName);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Action Sheet closed');
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async renameFolder(folderName: string) {
    const alert = await this.alertController.create({
      header: 'Rename Folder',
      cssClass:'confirm',
      inputs: [
        {
          name: 'newFolderName',
          type: 'text',
          placeholder: 'Enter new folder name',
          value: folderName
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Rename canceled');
          }
        },
        {
          text: 'Rename',
          handler: (data: any) => {
            const folder = this.folders.find(f => f.name === folderName);
            if (folder && data.newFolderName) {
              folder.name = data.newFolderName;
              this.saveFoldersToLocalStorage();
              this.presentToast(`Folder renamed to "${data.newFolderName}"`);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmDeleteFolder(folderName: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete the folder "${folderName}"? This action cannot be undone.`,
      cssClass:'confirm',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Deletion canceled');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            this.deleteFolder(folderName);
          }
        }
      ]
    });
    await alert.present();
  }

  deleteFolder(folderName: string) {
    this.folders = this.folders.filter(folder => folder.name !== folderName);
    this.saveFoldersToLocalStorage();
    this.presentToast(`Folder "${folderName}" deleted`);
  }

  async manageFile(fileName: string) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Manage File',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Share',
          icon: 'share-outline',
          handler: () => {
            this.shareFriends();
          }
        },
        {
          text: 'Delete',
          icon: 'trash-outline',
          handler: () => {
            this.confirmDeleteFile(fileName);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });
    await actionSheet.present();
  }

  async shareFriends() {

    const buttons = this.friends.map(friend => ({
      text: `${friend.name}`,
      handler: () => {
        this.presentToast(`Shared file with ${friend.name}`);
      },
    }));
    const alert = await this.alertController.create({
      header: 'Share to Pinned Users',
      message: 'Choose a user to share the file with:',
      cssClass: 'confirm',
      buttons: buttons,
    });

    await alert.present();
  }

  async confirmDeleteFile(fileName: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete the file "${fileName}"? This action cannot be undone.`,
      cssClass:'confirm',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: () => {
            this.deleteFile(fileName);
            
          }
        }
      ]
    });
    await alert.present();
  }

  deleteFile(fileName: string) {
    const selectedFolder = this.folders.find(f => f.name === this.selectedFolderName);
    if (selectedFolder) {
      selectedFolder.files = selectedFolder.files.filter(file => file.name !== fileName);
      this.saveFoldersToLocalStorage();
      this.closeFolderModal();
      this.openFolderModal(this.selectedFolderName); 
      this.presentToast(`File "${fileName}" deleted`);
    }
  }
  

  saveFoldersToLocalStorage() {
    localStorage.setItem('folders', JSON.stringify(this.folders));
  }
}
