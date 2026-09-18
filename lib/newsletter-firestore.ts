import { collection, addDoc, getDocs, query, where, 
  serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type Subscriber = {
  id: string;
  email: string;
  source?: string;
  createdAt: any;
};

export async function subscribeToNewsletter(email: string, source: string = "footer") {
  const emailLower = email.toLowerCase().trim();
  
  // Check if already subscribed
  const q = query(
    collection(db, "subscribers"), 
    where("email", "==", emailLower)
  );
  const existing = await getDocs(q);
  
  if (!existing.empty) {
    return { success: false, error: "You're already subscribed!" };
  }
  
  await addDoc(collection(db, "subscribers"), {
    email: emailLower,
    source,
    createdAt: serverTimestamp(),
  });
  
  return { success: true };
}
