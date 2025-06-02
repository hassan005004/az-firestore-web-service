// firebase.js
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGzT23BoUvpykzpZHFbwWGhVb9y8rqSPc",
  authDomain: "az-firestore.firebaseapp.com",
  projectId: "az-firestore",
  storageBucket: "az-firestore.firebasestorage.app",
  messagingSenderId: "956359292074",
  appId: "1:956359292074:web:a7b6b594f3d7d8a6e54cd3"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

export { db, auth, firebase };
