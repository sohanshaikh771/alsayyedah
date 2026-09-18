import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

export type Category = {
  id: string;
  name: string;          // "Abaya", "Khimar"
  slug: string;          // "abaya", "khimar" (lowercase, hyphens)
  description?: string;  // short subtitle
  image?: string;        // Cloudinary URL
  icon?: string;         // optional icon name
  order: number;         // display order
  active: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createCategory(data: any) {
  return await addDoc(collection(db, "categories"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateCategory(id: string, data: any) {
  await updateDoc(doc(db, "categories", id), data);
}

export async function deleteCategory(id: string) {
  await deleteDoc(doc(db, "categories", id));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function listenCategories(callback: (categories: any[]) => void) {
  const q = query(collection(db, "categories"), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => {
    const categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(categories);
  });
}

export async function getActiveCategories() {
  const q = query(collection(db, "categories"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((c: any) => c.active !== false);
}
