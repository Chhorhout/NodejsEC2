// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAcNQdk9ZeX2mvXiNE95FJmkW7UrGHUxs",
  authDomain: "crud-cloud-b0236.firebaseapp.com",
  projectId: "crud-cloud-b0236",
  storageBucket: "crud-cloud-b0236.firebasestorage.app",
  messagingSenderId: "154913455264",
  appId: "1:154913455264:web:c3a5e4c0419f8e34d89dc5",
  measurementId: "G-C4LX4M49GQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase initialized successfully');

// Initialize Firestore
const db = getFirestore(app);
console.log('Firestore initialized successfully');

export { db };

