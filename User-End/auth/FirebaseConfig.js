// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdGFXIK6B_UJrt25XQvVDlaFln3RI2Fc0",
  authDomain: "plant-disease-detection-22117.firebaseapp.com",
  projectId: "plant-disease-detection-22117",
  storageBucket: "plant-disease-detection-22117.firebasestorage.app",
  messagingSenderId: "284341709761",
  appId: "1:284341709761:web:fe6085083f535237e0dd40",
  measurementId: "G-PZSGLGMDKH"
};

// Initialize Firebase
const FIREBASE = initializeApp(firebaseConfig);
const FIREBASE_AUTH = getAuth(FIREBASE);
module.exports = { FIREBASE_AUTH };
