// public/firebase-messaging-sw.js

// Import Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.17.1/firebase-messaging-compat.js");

// Your Firebase config (same as in your app)
firebase.initializeApp({
  apiKey: "AIzaSyD8yzAsqcwv1IQC7hYmo1G45u8Z9tyPHtc",
  authDomain: "rental-host-f33a1.firebaseapp.com",
  projectId: "rental-host-f33a1",
  storageBucket: "rental-host-f33a1.firebasestorage.app",
  messagingSenderId: "985464173945",
  appId: "1:985464173945:web:00c7f47440248a73ca2ba8",
});

// Initialize messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message:", payload);

  const notificationTitle = payload.notification?.title || "Background Notification";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/firebase-logo.png", // optional, add icon in public/
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
