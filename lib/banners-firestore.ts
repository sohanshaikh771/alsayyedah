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
} from "firebase/firestore";
import { db } from "./firebase";

export type Banner = {
  id: string;
  text: string;
  buttonText?: string;
  link: string;
  bgColor: string;       // hex
  textColor: string;     // hex
  position: "top" | "hero";
  startDate: string;     // ISO string
  endDate: string;       // ISO string
  active: boolean;
  createdAt: any;
};

export type BannerInput = Omit<Banner, "id" | "createdAt">;

export async function createBanner(data: BannerInput): Promise<string> {
  const colRef = collection(db, "banners");
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateBanner(
  id: string,
  data: Partial<BannerInput>
): Promise<void> {
  const docRef = doc(db, "banners", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBanner(id: string): Promise<void> {
  const docRef = doc(db, "banners", id);
  await deleteDoc(docRef);
}

export function listenBanners(callback: (banners: Banner[]) => void): () => void {
  const colRef = collection(db, "banners");
  const q = query(colRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const banners: Banner[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          text: d.text || "",
          buttonText: d.buttonText || "",
          link: d.link || "",
          bgColor: d.bgColor || "#C9A96E",
          textColor: d.textColor || "#FFFFFF",
          position: (d.position as "top" | "hero") || "top",
          startDate: d.startDate || "",
          endDate: d.endDate || "",
          active: typeof d.active === "boolean" ? d.active : true,
          createdAt: d.createdAt,
        };
      });
      callback(banners);
    },
    (error) => {
      console.warn("Retrying listenBanners without orderBy due to index or permission:", error);
      const fallbackQuery = query(colRef);
      return onSnapshot(fallbackQuery, (snapshot) => {
        const banners: Banner[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            text: d.text || "",
            buttonText: d.buttonText || "",
            link: d.link || "",
            bgColor: d.bgColor || "#C9A96E",
            textColor: d.textColor || "#FFFFFF",
            position: (d.position as "top" | "hero") || "top",
            startDate: d.startDate || "",
            endDate: d.endDate || "",
            active: typeof d.active === "boolean" ? d.active : true,
            createdAt: d.createdAt,
          };
        });
        callback(banners);
      });
    }
  );
}
