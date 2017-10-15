import firebase from "firebase";
import firestore from "firebase/firestore";

// Initialize Firebase
const config = {
  apiKey: "Your Settings..",
  authDomain: "xxxxxxxxxxxxxxxxxxxxx",
  databaseURL: "xxxxxxxxxxxxxxxxxxxxxxxxx",
  projectId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  storageBucket: "xxxxxxxxxxxxxxxxxxxxxxxx",
  messagingSenderId: "xxxxxxxxxxxxxxxxxx"
};
firebase.initializeApp(config);
let db = firebase.firestore();

export default db;