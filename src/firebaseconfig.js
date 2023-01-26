// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getDatabase} from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWWQtYioQzMjnxA7oWcP_3yN66UtIkM2A",
  authDomain: "rmc-employee.firebaseapp.com",
  databaseURL: "https://rmc-employee-default-rtdb.firebaseio.com",
  projectId: "rmc-employee",
  storageBucket: "rmc-employee.appspot.com",
  messagingSenderId: "497961924911",
  appId: "1:497961924911:web:e177c36cdfc7d0b95c49da",
  measurementId: "G-P93E0WTJM4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
