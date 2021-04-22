import Rebase from "re-base";
import firebase from "firebase/app";
import "firebase/database";

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyDclxea6ZTVkBX4PJlUJEJhSVbhpsM4PiI",
  authDomain: "anim-checker-be237.firebaseapp.com",
  databaseURL: "https://anim-checker-be237.firebaseio.com",
  projectId: "anim-checker-be237",
  storageBucket: "anim-checker-be237.appspot.com",
  messagingSenderId: "736424928339",
  appId: "1:736424928339:web:41cbf06843ba8d5602d2a6",
  measurementId: "G-QGFPS58K15",
});

const base = Rebase.createClass(firebaseApp.database());

export { firebaseApp };

export default base;
