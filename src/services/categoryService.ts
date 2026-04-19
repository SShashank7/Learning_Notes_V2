import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { Category } from "../types";

const CATEGORY_COLLECTION = "categories";

// ✅ Get
export const getCategoriesFromDB = async () => {
  const snapshot = await getDocs(collection(db, CATEGORY_COLLECTION));
  return snapshot.docs.map((d) => ({
    ...d.data(),
    id: d.id, // 🔥 Firebase ID
  })) as Category[];
};

// ✅ Add (🔥 FIXED)
export const addCategoryToDB = async (category: Omit<Category, "id">) => {
  const docRef = await addDoc(collection(db, CATEGORY_COLLECTION), category);

  return {
    ...category,
    id: docRef.id, // 🔥 return Firebase ID
  };
};

// Update
export const updateCategoryInDB = async (
  id: string,
  data: Partial<Category>
) => {
  await updateDoc(doc(db, CATEGORY_COLLECTION, id), data);
};

// Delete
export const deleteCategoryFromDB = async (id: string) => {
  await deleteDoc(doc(db, CATEGORY_COLLECTION, id));
};