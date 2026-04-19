import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

const notesCollection = collection(db, "notes");

// Add note
export const addNoteToDB = async (note: any) => {
  await addDoc(notesCollection, note);
};

// Get all notes
export const getNotesFromDB = async () => {
  const snapshot = await getDocs(notesCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};