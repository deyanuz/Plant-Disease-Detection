// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9jTYBJD6jIEVxZT7E0ZJLflehatd5lks",
  authDomain: "plant-disease-detection-7b840.firebaseapp.com",
  projectId: "plant-disease-detection-7b840",
  storageBucket: "plant-disease-detection-7b840.firebasestorage.app",
  messagingSenderId: "386674414161",
  appId: "1:386674414161:web:1ee220c852097a6ce7de70",
  measurementId: "G-4RN5G2EPMK",
};

// Initialize Firebase
const FIREBASE = initializeApp(firebaseConfig);
const FIREBASE_AUTH = getAuth(FIREBASE);
module.exports = { FIREBASE_AUTH };
