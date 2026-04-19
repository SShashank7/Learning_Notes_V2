import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Note } from "../types";

const NOTE_COLLECTION = "notes";

// existing
export const addNoteToDB = async (note: Note) => {
  await addDoc(collection(db, NOTE_COLLECTION), note);
};

export const getNotesFromDB = async () => {
  const snapshot = await getDocs(collection(db, NOTE_COLLECTION));
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Note[];
};

// 🔥 NEW: UPDATE NOTE
export const updateNoteInDB = async (id: string, data: Partial<Note>) => {
  await updateDoc(doc(db, NOTE_COLLECTION, id), data);
};

// 🔥 NEW: DELETE NOTE
export const deleteNoteFromDB = async (id: string) => {
  await deleteDoc(doc(db, NOTE_COLLECTION, id));
};