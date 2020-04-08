import firebase from "firebase";
import "firebase/firestore";

// Initialize Firebase
const config = {
  apiKey: "",
  authDomain: "react-firestore.firebaseapp.com",
  databaseURL: "https://react-firestore.firebaseio.com",
  projectId: "react-firestore",
  storageBucket: "react-firestore.appspot.com",
  messagingSenderId: "288797015510"
};
firebase.initializeApp(config);
let db = firebase.firestore();
let storage = firebase.storage();

export {db,storage};
