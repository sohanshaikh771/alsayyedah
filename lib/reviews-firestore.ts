import { collection, addDoc, updateDoc, deleteDoc, doc, 
  getDocs, query, where, orderBy, onSnapshot, serverTimestamp } 
  from "firebase/firestore";
import { db } from "./firebase";

export type Review = {
  id: string;
  productId: string;
  productSlug: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;       // 1-5
  title?: string;
  comment: string;
  images?: string[];
  approved: boolean;    // admin approval
  createdAt: any;
};

export async function createReview(data: Omit<Review, "id" | "createdAt" | "approved">) {
  return await addDoc(collection(db, "reviews"), {
    ...data,
    approved: false,   // default: pending admin approval
    createdAt: serverTimestamp(),
  });
}

export async function updateReview(id: string, data: Partial<Review>) {
  await updateDoc(doc(db, "reviews", id), data);
}

export async function deleteReview(id: string) {
  await deleteDoc(doc(db, "reviews", id));
}

export function listenReviewsByProduct(
  productId: string, 
  callback: (reviews: Review[]) => void,
  onError?: (error: any) => void
) {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    where("approved", "==", true),
    orderBy("createdAt", "desc")
  );

  let fallbackUnsubscribe: (() => void) | undefined;

  const unsubscribe = onSnapshot(
    q, 
    (snap) => {
      const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
      callback(reviews);
    },
    (err) => {
      console.warn("listenReviewsByProduct failed (likely missing composite index), attempting fallback query:", err);
      try {
        const fallbackQ = query(
          collection(db, "reviews"),
          where("productId", "==", productId)
        );
        fallbackUnsubscribe = onSnapshot(
          fallbackQ,
          (snap) => {
            const reviews = snap.docs
              .map((d) => ({ id: d.id, ...d.data() } as Review))
              .filter((r) => r.approved !== false)
              .sort((a, b) => {
                const timeA = a.createdAt?.toMillis?.() || 0;
                const timeB = b.createdAt?.toMillis?.() || 0;
                return timeB - timeA;
              });
            callback(reviews);
          },
          (fallbackErr) => {
            console.error("listenReviewsByProduct fallback query failed:", fallbackErr);
            callback([]);
            if (onError) onError(fallbackErr);
          }
        );
      } catch (fallbackException) {
        console.error("listenReviewsByProduct exception in fallback:", fallbackException);
        callback([]);
        if (onError) onError(fallbackException);
      }
    }
  );

  return () => {
    unsubscribe();
    if (fallbackUnsubscribe) {
      fallbackUnsubscribe();
    }
  };
}

export function listenAllReviews(callback: (reviews: Review[]) => void) {
  const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
    callback(reviews);
  });
}
