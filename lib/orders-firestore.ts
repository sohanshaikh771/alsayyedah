import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  size: string;
  color: string;
  image?: string;
};

export type OrderAddress = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  altPhone?: string;
  line1?: string;
  line2?: string;
  landmark?: string;
  notes?: string;
};

export type Order = {
  id: string;
  orderRef?: string;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  paymentMethod: "COD" | "ONLINE" | "WHATSAPP";
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
  address?: OrderAddress;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createOrder(orderData: any) {
  // Recursive cleaner: replaces undefined with empty string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function cleanUndefined(obj: any): any {
    if (obj === null) return null;
    if (Array.isArray(obj)) {
      return obj.map(cleanUndefined);
    }
    if (typeof obj === "object" && obj.constructor === Object) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleaned: any = {};
      Object.keys(obj).forEach((key) => {
        const val = obj[key];
        if (val === undefined) {
          cleaned[key] = "";
        } else if (val === null) {
          cleaned[key] = null;
        } else if (typeof val === "object" && !Array.isArray(val)) {
          cleaned[key] = cleanUndefined(val);
        } else {
          cleaned[key] = val;
        }
      });
      return cleaned;
    }
    return obj;
  }

  const cleanData = cleanUndefined(orderData);

  return await addDoc(collection(db, "orders"), {
    ...cleanData,
    status: "PENDING",
    createdAt: serverTimestamp(),
  });
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const docRef = doc(db, "orders", orderId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"]
) {
  await updateDoc(doc(db, "orders", orderId), { status });
}

export async function deleteOrder(orderId: string) {
  await deleteDoc(doc(db, "orders", orderId));
}

export { onSnapshot };
