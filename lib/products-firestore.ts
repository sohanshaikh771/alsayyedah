import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: "abaya" | "burkha" | "niqab" | "hijab";
  price: number;
  mrp?: number;
  fabric: string;
  description: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured?: boolean;
};

function mapDocToProduct(doc: QueryDocumentSnapshot<DocumentData>): Product {
  const data = doc.data();
  const images = Array.isArray(data.images)
    ? data.images
    : data.image
    ? [data.image]
    : [];

  return {
    id: doc.id,
    name: data.name || "",
    slug: data.slug || "",
    category: data.category || "abaya",
    price: typeof data.price === "number" ? data.price : Number(data.price) || 0,
    mrp:
      data.mrp !== undefined && data.mrp !== null && data.mrp !== ""
        ? Number(data.mrp)
        : undefined,
    fabric: data.fabric || "",
    description: data.description || "",
    images,
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    colors: Array.isArray(data.colors) ? data.colors : [],
    stock: typeof data.stock === "number" ? data.stock : Number(data.stock) || 0,
    featured: Boolean(data.featured),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(mapDocToProduct);
  } catch (err: unknown) {
    console.warn("getAllProducts with orderBy failed, falling back to base query:", err);
    const snap = await getDocs(collection(db, "products"));
    return snap.docs.map(mapDocToProduct);
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("featured", "==", true),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(mapDocToProduct);
  } catch (err: unknown) {
    console.warn("getFeaturedProducts with orderBy failed, falling back to query without orderBy:", err);
    const q = query(
      collection(db, "products"),
      where("featured", "==", true)
    );
    const snap = await getDocs(q);
    return snap.docs.map(mapDocToProduct);
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(mapDocToProduct);
  } catch (err: unknown) {
    console.warn(`getProductsByCategory(${category}) with orderBy failed, falling back to query without orderBy:`, err);
    const q = query(
      collection(db, "products"),
      where("category", "==", category)
    );
    const snap = await getDocs(q);
    return snap.docs.map(mapDocToProduct);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(collection(db, "products"), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return mapDocToProduct(d);
}
