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

// 🔥 Get all categories
export const getCategoriesFromDB = async () => {
  const snapshot = await getDocs(collection(db, CATEGORY_COLLECTION));
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Category[];
};

// 🔥 Add category
export const addCategoryToDB = async (category: Category) => {
  await addDoc(collection(db, CATEGORY_COLLECTION), category);
};

// 🔥 Update category
export const updateCategoryInDB = async (
  id: string,
  data: Partial<Category>
) => {
  await updateDoc(doc(db, CATEGORY_COLLECTION, id), data);
};

// 🔥 Delete category
export const deleteCategoryFromDB = async (id: string) => {
  await deleteDoc(doc(db, CATEGORY_COLLECTION, id));
};