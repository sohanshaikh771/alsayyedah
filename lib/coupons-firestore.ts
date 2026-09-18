import { collection, addDoc, updateDoc, deleteDoc, doc, 
  getDocs, query, where, onSnapshot, orderBy, serverTimestamp } 
  from "firebase/firestore";
import { db } from "./firebase";

export type Coupon = {
  id: string;
  code: string;           // uppercase, e.g. "EID30"
  type: "percentage" | "fixed";
  value: number;          // 30 = 30% OR ₹30 off
  minOrder: number;       // minimum order amount
  maxUses: number;        // 0 = unlimited
  usedCount: number;
  validFrom: string;      // ISO date
  validTill: string;      // ISO date
  active: boolean;
  createdAt: any;
};

export async function createCoupon(data: Omit<Coupon, "id" | "createdAt" | "usedCount">) {
  return await addDoc(collection(db, "coupons"), {
    ...data,
    usedCount: 0,
    createdAt: serverTimestamp(),
  });
}

export async function updateCoupon(id: string, data: Partial<Coupon>) {
  await updateDoc(doc(db, "coupons", id), data);
}

export async function deleteCoupon(id: string) {
  await deleteDoc(doc(db, "coupons", id));
}

export function listenCoupons(callback: (coupons: Coupon[]) => void) {
  const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const coupons = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
    callback(coupons);
  });
}

export async function validateCoupon(code: string, orderAmount: number) {
  const codeUpper = code.toUpperCase().trim();
  const q = query(collection(db, "coupons"), where("code", "==", codeUpper));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    return { valid: false, error: "Invalid coupon code" };
  }
  
  const couponData = snap.docs[0].data() as Omit<Coupon, "id">;
  const couponId = snap.docs[0].id;
  const today = new Date().toISOString().split("T")[0];
  
  if (!couponData.active) {
    return { valid: false, error: "This coupon is no longer active" };
  }
  if (today < couponData.validFrom) {
    return { valid: false, error: "This coupon is not yet valid" };
  }
  if (today > couponData.validTill) {
    return { valid: false, error: "This coupon has expired" };
  }
  if (orderAmount < couponData.minOrder) {
    return { valid: false, error: `Minimum order ₹${couponData.minOrder} required` };
  }
  if (couponData.maxUses > 0 && couponData.usedCount >= couponData.maxUses) {
    return { valid: false, error: "This coupon has reached its usage limit" };
  }
  
  // Calculate discount
  let discount = 0;
  if (couponData.type === "percentage") {
    discount = Math.round((orderAmount * couponData.value) / 100);
  } else {
    discount = couponData.value;
  }
  discount = Math.min(discount, orderAmount); // can't exceed order
  
  return { 
    valid: true, 
    coupon: { id: couponId, ...couponData }, 
    discount 
  };
}
