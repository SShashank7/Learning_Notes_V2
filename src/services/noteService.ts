import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

import { Note } from "../types";

const NOTE_COLLECTION = "notes";

// ✅ Add Note (Firebase ID use hoga)
export const addNoteToDB = async (note: Omit<Note, "id">) => {
  const docRef = await addDoc(collection(db, NOTE_COLLECTION), note);

  return {
    ...note,
    id: docRef.id,
  };
};

// ✅ Get Notes
export const getNotesFromDB = async (): Promise<Note[]> => {
  const snapshot = await getDocs(collection(db, NOTE_COLLECTION));

  return snapshot.docs.map((d) => ({
    ...d.data(),
    id: d.id,
  })) as Note[];
};

// ✅ Update Note
export const updateNoteInDB = async (
  id: string,
  data: Partial<Note>
): Promise<void> => {
  await updateDoc(doc(db, NOTE_COLLECTION, id), data);
};

// ✅ Delete Single Note
export const deleteNoteFromDB = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, NOTE_COLLECTION, id));
};

// 🔥🔥 IMPORTANT: Delete all notes of a category (CASCADE DELETE)
export const deleteNotesByCategoryId = async (
  categoryId: string
): Promise<void> => {
  const q = query(
    collection(db, NOTE_COLLECTION),
    where("categoryId", "==", categoryId)
  );

  const snapshot = await getDocs(q);

  const deletePromises = snapshot.docs.map((d) =>
    deleteDoc(doc(db, NOTE_COLLECTION, d.id))
  );

  await Promise.all(deletePromises);
};