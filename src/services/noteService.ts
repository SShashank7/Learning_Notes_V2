import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { Note } from "../types";

const NOTE_COLLECTION = "notes";

// 🔥 FIXED ADD
export const addNoteToDB = async (note: Omit<Note, "id">) => {
  const docRef = await addDoc(collection(db, NOTE_COLLECTION), note);

  return {
    ...note,
    id: docRef.id, // 🔥 Firebase ID
  };
};

// Get
export const getNotesFromDB = async () => {
  const snapshot = await getDocs(collection(db, NOTE_COLLECTION));
  return snapshot.docs.map((d) => ({
    ...d.data(),
    id: d.id,
  })) as Note[];
};

// Update
export const updateNoteInDB = async (id: string, data: Partial<Note>) => {
  await updateDoc(doc(db, NOTE_COLLECTION, id), data);
};

// Delete
export const deleteNoteFromDB = async (id: string) => {
  await deleteDoc(doc(db, NOTE_COLLECTION, id));
};