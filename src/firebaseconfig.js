// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7TPmmcfYzTtWjnBBbVlJcs17eqIVoWGg",
  authDomain: "chitty-c4c48.firebaseapp.com",
  projectId: "chitty-c4c48",
  storageBucket: "chitty-c4c48.appspot.com",
  messagingSenderId: "1070065495758",
  appId: "1:1070065495758:web:f4f9ba0d14d7e761cb2a9f",
  measurementId: "G-9TRCFDY6SY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);