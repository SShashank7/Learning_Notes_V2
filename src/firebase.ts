import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0TnB0Ux6SFrh3bq30r21tTSlk-UCMn3A",
  authDomain: "notes-tracker-app-31014.firebaseapp.com",
  projectId: "notes-tracker-app-31014",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);