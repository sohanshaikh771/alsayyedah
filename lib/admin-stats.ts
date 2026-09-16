import {
  collection,
  getDocs,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Total products
    const productsSnap = await getDocs(collection(db, "products"));
    const totalProducts = productsSnap.size;

    // Total customers (users with role CUSTOMER)
    let totalCustomers = 0;
    try {
      const usersSnap = await getDocs(
        query(collection(db, "users"), where("role", "==", "CUSTOMER"))
      );
      totalCustomers = usersSnap.size;
    } catch (e) {
      console.warn("Could not fetch customers count:", e);
    }

    // All orders
    let totalOrders = 0;
    let revenue = 0;
    let pendingOrders = 0;

    try {
      const ordersSnap = await getDocs(collection(db, "orders"));
      const orders = ordersSnap.docs.map((d) => d.data() as DocumentData);

      totalOrders = orders.length;

      // Revenue: sum of total for orders with status DELIVERED, CONFIRMED, or SHIPPED
      revenue = orders
        .filter((o) =>
          ["DELIVERED", "CONFIRMED", "SHIPPED"].includes(o.status as string)
        )
        .reduce(
          (sum, o) =>
            sum + (typeof o.total === "number" ? o.total : Number(o.total) || 0),
          0
        );

      // Pending orders
      pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    } catch (e) {
      console.warn("Could not fetch orders count:", e);
    }

    return {
      totalProducts,
      totalCustomers,
      totalOrders,
      revenue,
      pendingOrders,
    };
  } catch (err) {
    console.error("Error in getDashboardStats:", err);
    return {
      totalProducts: 0,
      totalCustomers: 0,
      totalOrders: 0,
      revenue: 0,
      pendingOrders: 0,
    };
  }
}
