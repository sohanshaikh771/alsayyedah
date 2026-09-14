"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Package, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";

interface OrderItem {
  name: string;
  qty: number;
  size: string;
  color: string;
  price?: number;
}

interface Order {
  id: string;
  userId?: string;
  status?: string;
  total?: number;
  totalAmount?: number;
  totalPrice?: number;
  items?: OrderItem[];
  createdAt?: unknown;
}

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const currentUserId = user.uid;
    let isMounted = true;

    async function fetchOrders() {
      try {
        setFetchingOrders(true);
        setOrdersError(null);

        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", currentUserId)
        );

        const snapshot = await getDocs(ordersQuery);
        const orderList: Order[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (isMounted) {
          setOrders(orderList);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (isMounted) {
          setOrdersError("Could not load orders");
        }
      } finally {
        if (isMounted) {
          setFetchingOrders(false);
        }
      }
    }

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const formatDate = (createdAt: unknown) => {
    if (!createdAt) return "N/A";
    if (
      typeof createdAt === "object" &&
      createdAt !== null &&
      "toDate" in createdAt &&
      typeof (createdAt as { toDate: () => Date }).toDate === "function"
    ) {
      return (createdAt as { toDate: () => Date })
        .toDate()
        .toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
    }
    if (createdAt instanceof Date) {
      return createdAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    if (typeof createdAt === "string" || typeof createdAt === "number") {
      const parsed = new Date(createdAt);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    }
    return String(createdAt);
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || "PENDING").toUpperCase();
    switch (s) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-taupe">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-12 flex items-center justify-center">
          <p className="text-center font-serif text-2xl text-taupe">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        {/* Header row */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-4xl text-taupe">My Account</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="border border-taupe text-taupe px-4 py-2 rounded-md hover:bg-taupe hover:text-cream transition flex items-center gap-2 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Profile card */}
        <div className="bg-beige p-6 rounded-md mb-8 flex items-center gap-4 sm:gap-6">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User avatar"}
              className="w-16 h-16 rounded-full object-cover border border-sand flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-taupe text-cream flex items-center justify-center font-serif text-2xl font-semibold flex-shrink-0">
              {(user.displayName || user.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-serif text-xl text-taupe truncate">
              {user.displayName || "Valued Customer"}
            </h2>
            <p className="text-sm text-taupe/60 truncate">{user.email}</p>
          </div>
        </div>

        {/* Orders section */}
        <div>
          <h2 className="font-serif text-2xl text-taupe mb-4">Order History</h2>

          {fetchingOrders ? (
            <div className="bg-beige p-8 rounded-md text-center text-sm text-taupe/60">
              Loading orders...
            </div>
          ) : ordersError ? (
            <div className="bg-beige p-8 rounded-md text-center text-sm text-red-600">
              {ordersError}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-beige p-8 rounded-md text-center">
              <Package className="w-12 h-12 mx-auto text-taupe/40" />
              <p className="font-serif text-lg text-taupe mt-4">
                No orders yet
              </p>
              <Link
                href="/shop"
                className="inline-block mt-2 text-sm font-medium text-taupe hover:text-gold underline underline-offset-4 transition"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = (order.status || "PENDING").toUpperCase();
                const total =
                  order.total ?? order.totalAmount ?? order.totalPrice ?? 0;
                const items = Array.isArray(order.items) ? order.items : [];

                return (
                  <div
                    key={order.id}
                    className="bg-beige p-4 rounded-md mb-4 space-y-2.5 border border-sand/40"
                  >
                    {/* Row 1: Order ID + Status badge */}
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs text-taupe/60">
                        #{order.id}
                      </span>
                      <span
                        className={`border px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadge(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>

                    {/* Row 2: Total amount */}
                    <div className="font-semibold text-taupe text-base">
                      ₹{Number(total).toLocaleString("en-IN")}
                    </div>

                    {/* Row 3: Items list */}
                    {items.length > 0 && (
                      <div className="text-xs text-taupe/80 space-y-1">
                        {items.map((item, idx) => (
                          <div key={idx}>
                            {item.name} x{item.qty} ({item.size}, {item.color})
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Row 4: Date formatted */}
                    <div className="text-xs text-taupe/60 pt-1 border-t border-sand/30">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
