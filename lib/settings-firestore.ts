import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export type StoreSettings = {
  storeName: string;
  tagline: string;
  phone: string;
  email: string;
  instagramUrl: string;
  whatsappNumber: string;
  facebookUrl: string;
  freeShippingAbove: number;
  shippingCharge: number;
  codCharge: number;
};

export const defaultSettings: StoreSettings = {
  storeName: "ALSayyedah",
  tagline: "Your Modest Identity",
  phone: "+91 99258 37795",
  email: "hello@alsayyedah.in",
  instagramUrl: "https://www.instagram.com/alsayyedah.in/",
  whatsappNumber: "919925837795",
  facebookUrl: "",
  freeShippingAbove: 1999,
  shippingCharge: 99,
  codCharge: 49,
};

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const snap = await getDoc(doc(db, "settings", "store"));
    if (!snap.exists()) return defaultSettings;
    return { ...defaultSettings, ...snap.data() } as StoreSettings;
  } catch (err) {
    console.error("Failed to fetch settings:", err);
    return defaultSettings;
  }
}

export function listenStoreSettings(callback: (settings: StoreSettings) => void) {
  try {
    return onSnapshot(
      doc(db, "settings", "store"),
      (snap) => {
        const data = snap.exists()
          ? { ...defaultSettings, ...snap.data() }
          : defaultSettings;
        callback(data as StoreSettings);
      },
      (err) => {
        console.error("Error listening to store settings:", err);
        callback(defaultSettings);
      }
    );
  } catch (err) {
    console.error("Failed to set up store settings listener:", err);
    callback(defaultSettings);
    return () => {};
  }
}

export async function updateStoreSettings(
  settings: Partial<StoreSettings>
): Promise<void> {
  await setDoc(doc(db, "settings", "store"), settings, { merge: true });
}
