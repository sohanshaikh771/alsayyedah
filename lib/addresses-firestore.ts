import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export type Address = {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
};

export type SavedAddress = Address;
export type SavedAddressInput = Omit<Address, "id" | "createdAt">;

/**
 * Save a new address for a user.
 * If marked default or if it's their first address, unset other defaults.
 */
export async function saveAddress(
  userId: string,
  data: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }
): Promise<string> {
  const existing = await getUserAddresses(userId);
  if (existing.length >= 2) {
    throw new Error("Maximum 2 addresses allowed. Delete one first.");
  }

  const addressesRef = collection(db, "addresses");
  const isFirstAddress = existing.length === 0;
  const shouldBeDefault = data.isDefault ?? isFirstAddress;

  if (shouldBeDefault && existing.length > 0) {
    const batch = writeBatch(db);
    existing.forEach((addr) => {
      if (addr.isDefault) {
        batch.update(doc(db, "addresses", addr.id), { isDefault: false });
      }
    });
    await batch.commit();
  }

  const docRef = await addDoc(addressesRef, {
    userId,
    fullName: data.fullName.trim(),
    phone: data.phone.replace(/\D/g, ""),
    address: data.address.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    pincode: data.pincode.replace(/\D/g, ""),
    isDefault: shouldBeDefault,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Add address alias for compatibility
 */
export async function addAddress(
  data: SavedAddressInput
): Promise<string> {
  return await saveAddress(data.userId, {
    fullName: data.fullName,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    isDefault: data.isDefault,
  });
}

/**
 * Update an existing address.
 * If setting isDefault to true, unsets all other defaults for this user.
 */
export async function updateAddress(
  id: string,
  data: Partial<Omit<Address, "id" | "createdAt">> & { isDefault?: boolean },
  userId?: string
): Promise<void> {
  if (data.isDefault) {
    let targetUserId = userId;
    if (!targetUserId) {
      const docSnap = await getDoc(doc(db, "addresses", id));
      if (docSnap.exists()) {
        targetUserId = docSnap.data()?.userId;
      }
    }

    if (targetUserId) {
      const addressesRef = collection(db, "addresses");
      const existingSnap = await getDocs(
        query(addressesRef, where("userId", "==", targetUserId))
      );
      const batch = writeBatch(db);
      existingSnap.docs.forEach((d) => {
        if (d.id !== id && d.data().isDefault) {
          batch.update(d.ref, { isDefault: false });
        }
      });
      await batch.commit();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePayload: Record<string, any> = {};
  if (data.fullName !== undefined) updatePayload.fullName = data.fullName.trim();
  if (data.phone !== undefined) updatePayload.phone = data.phone.replace(/\D/g, "");
  if (data.address !== undefined) updatePayload.address = data.address.trim();
  if (data.city !== undefined) updatePayload.city = data.city.trim();
  if (data.state !== undefined) updatePayload.state = data.state.trim();
  if (data.pincode !== undefined) updatePayload.pincode = data.pincode.replace(/\D/g, "");
  if (data.isDefault !== undefined) updatePayload.isDefault = data.isDefault;

  await updateDoc(doc(db, "addresses", id), updatePayload);
}

/**
 * Delete an address by ID
 */
export async function deleteAddress(id: string): Promise<void> {
  await deleteDoc(doc(db, "addresses", id));
}

/**
 * Set an address as default and remove default from others.
 * Supports both (userId, addressId) and (addressId, userId) for compatibility.
 */
export async function setDefaultAddress(
  arg1: string,
  arg2: string
): Promise<void> {
  const addressesRef = collection(db, "addresses");

  let qSnap = await getDocs(query(addressesRef, where("userId", "==", arg1)));
  let addressId = arg2;

  if (qSnap.empty) {
    const altSnap = await getDocs(query(addressesRef, where("userId", "==", arg2)));
    if (!altSnap.empty) {
      qSnap = altSnap;
      addressId = arg1;
    }
  }

  const batch = writeBatch(db);
  qSnap.docs.forEach((d) => {
    if (d.id === addressId) {
      batch.update(d.ref, { isDefault: true });
    } else if (d.data().isDefault) {
      batch.update(d.ref, { isDefault: false });
    }
  });

  await batch.commit();
}

/**
 * Get all addresses for a user
 */
export async function getUserAddresses(
  userId: string
): Promise<Address[]> {
  const q = query(
    collection(db, "addresses"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const list: Address[] = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Address, "id">),
  }));

  list.sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getMillis = (ts: any) => {
      if (!ts) return 0;
      if (typeof ts.toMillis === "function") return ts.toMillis();
      if (typeof ts.seconds === "number") return ts.seconds * 1000;
      if (ts instanceof Date) return ts.getTime();
      return new Date(ts).getTime() || 0;
    };
    return getMillis(b.createdAt) - getMillis(a.createdAt);
  });

  return list;
}

/**
 * Real-time subscription to a user's saved addresses
 */
export function subscribeUserAddresses(
  userId: string,
  onUpdate: (addresses: Address[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(
    collection(db, "addresses"),
    where("userId", "==", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Address[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Address, "id">),
      }));

      // Sort: default address first, then newer addresses
      list.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getMillis = (ts: any) => {
          if (!ts) return 0;
          if (typeof ts.toMillis === "function") return ts.toMillis();
          if (typeof ts.seconds === "number") return ts.seconds * 1000;
          if (ts instanceof Date) return ts.getTime();
          return new Date(ts).getTime() || 0;
        };
        return getMillis(b.createdAt) - getMillis(a.createdAt);
      });

      onUpdate(list);
    },
    (err) => {
      console.error("Error subscribing to addresses:", err);
      if (onError) onError(err);
    }
  );
}
