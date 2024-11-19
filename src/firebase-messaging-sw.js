importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBM-ZG0pNynRJhlVYxGLuri1UShVKYnyf0",
    authDomain: "appreport-6ee8a.firebaseapp.com",
    databaseURL: "https://appreport-6ee8a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "appreport-6ee8a",
    storageBucket: "appreport-6ee8a.appspot.com",
    messagingSenderId: "1082846384172",
    appId: "1:1082846384172:web:8a9cedb35ce83481334189",
    measurementId: "G-YPECLSPHQZ",
    vapidKey:"BEj3dws7rqVg8zevl1CMHIEmmqLiLiKDnaX1VTxNd01xupwNfTsVL4htBLC0Z4QO5Jz9YEgdev-nnG_lASIavwc"
});

const messaging = firebase.messaging();

