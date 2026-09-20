"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Order,
  updateOrderStatus,
  deleteOrder,
} from "@/lib/orders-firestore";
import {
  Phone,
  MessageCircle,
  Trash2,
  Search,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_FILTERS = [
  "All",
  "Today",
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function formatOrderDate(createdAt: unknown): string {
  if (!createdAt) return "Just now";
  let date: Date | null = null;

  const ts = createdAt as { toDate?: () => Date; seconds?: number } | null;

  if (typeof ts === "object" && ts !== null) {
    if (typeof ts.toDate === "function") {
      date = ts.toDate();
    } else if (typeof ts.seconds === "number") {
      date = new Date(ts.seconds * 1000);
    }
  } else if (createdAt instanceof Date) {
    date = createdAt;
  } else if (typeof createdAt === "string" || typeof createdAt === "number") {
    date = new Date(createdAt);
  }

  if (!date || isNaN(date.getTime())) return "Just now";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOrderInLast24Hours(createdAt: unknown): boolean {
  if (!createdAt) return false;
  let timeMs = 0;
  const ts = createdAt as { toDate?: () => Date; seconds?: number } | null;
  if (typeof ts === "object" && ts !== null) {
    if (typeof ts.toDate === "function") {
      timeMs = ts.toDate().getTime();
    } else if (typeof ts.seconds === "number") {
      timeMs = ts.seconds * 1000;
    }
  } else if (createdAt instanceof Date) {
    timeMs = createdAt.getTime();
  } else if (typeof createdAt === "string" || typeof createdAt === "number") {
    timeMs = new Date(createdAt).getTime();
  }

  if (!timeMs || isNaN(timeMs)) return false;
  const now = Date.now();
  const diff = now - timeMs;
  return diff >= 0 && diff <= 24 * 60 * 60 * 1000;
}

function getStatusColorClasses(status: string | undefined): string {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "SHIPPED":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "CANCELLED":
      return "bg-rose-100 text-rose-800 border-rose-300";
    default:
      return "bg-beige text-taupe border-sand";
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Order[];
        setOrders(items);
        setLoading(false);
      },
      (err) => {
        console.warn("Ordered onSnapshot error, fallback without orderBy:", err);
        const unsubFallback = onSnapshot(ordersRef, (fallbackSnap) => {
          const items = fallbackSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Order[];

          items.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });

          setOrders(items);
          setLoading(false);
        });
        return unsubFallback;
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(orderId);
        toast("Order deleted", { icon: "🗑️" });
      } catch (err) {
        console.error("Failed to delete order:", err);
        toast.error("Failed to delete order. Please try again.");
      }
    }
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success("Status updated");
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = orders.filter((order) => {
    // 1. Status / Time Filter
    let matchesStatus = true;
    if (statusFilter === "Today") {
      matchesStatus = isOrderInLast24Hours(order.createdAt);
    } else if (statusFilter !== "All") {
      matchesStatus =
        order.status?.toUpperCase() === statusFilter.toUpperCase();
    }

    // 2. Search Filter (by order ID, customer name, or phone)
    const cleanQuery = searchQuery.trim().toLowerCase();
    const shortId = order.id.slice(-6).toLowerCase();
    const matchesSearch =
      !cleanQuery ||
      order.id.toLowerCase().includes(cleanQuery) ||
      `als${shortId}`.includes(cleanQuery) ||
      (order.orderRef && order.orderRef.toLowerCase().includes(cleanQuery)) ||
      (order.customerName &&
        order.customerName.toLowerCase().includes(cleanQuery)) ||
      (order.address?.fullName &&
        order.address.fullName.toLowerCase().includes(cleanQuery)) ||
      (order.customerPhone && order.customerPhone.includes(cleanQuery)) ||
      (order.address?.phone && order.address.phone.includes(cleanQuery));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl text-taupe tracking-tight">
          Orders
        </h1>
        <p className="text-sm text-taupe/70 mt-1">
          Review customer orders, delivery addresses, and payment breakdowns.
        </p>
      </div>

      {/* Search Bar & Filter Pills */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-taupe/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, customer name, or phone..."
            className="w-full pl-10 pr-10 py-2.5 bg-cream border border-sand rounded-md text-sm text-taupe placeholder:text-taupe/40 focus:outline-none focus:border-gold transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-taupe/50 hover:text-taupe transition-colors px-1 py-0.5"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-b border-sand/40 pb-4">
          {STATUS_FILTERS.map((f) => {
            const isActive = statusFilter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-taupe text-cream shadow-2xs"
                    : "border border-sand text-taupe hover:border-gold hover:text-gold bg-cream"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Content */}
      {loading ? (
        <div className="bg-cream border border-sand rounded-md p-12 text-center text-taupe font-serif">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        /* Empty State: No orders placed yet */
        <div className="bg-cream border border-sand rounded-lg p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-sand/40 flex items-center justify-center mx-auto text-taupe/50">
            <Package className="w-7 h-7 text-taupe/60" />
          </div>
          <h3 className="font-serif text-xl text-taupe font-medium">
            No orders yet
          </h3>
          <p className="text-sm text-taupe/60 max-w-sm mx-auto font-sans">
            Orders will appear here when customers checkout
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Empty State for Filter/Search */
        <div className="bg-cream border border-sand rounded-lg p-10 text-center space-y-2 shadow-xs">
          <p className="font-serif text-lg text-taupe">
            No matching orders found
          </p>
          <p className="text-xs text-taupe/60 font-sans">
            Try adjusting your search query or status filter.
          </p>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const shortId = order.id.slice(-6).toUpperCase();
            const recipientName =
              order.address?.fullName || order.customerName || "Customer";
            const rawPhone = order.address?.phone || order.customerPhone || "";
            const cleanPhone = rawPhone.replace(/\D/g, "");

            // Pre-filled WhatsApp message
            const waMessage = encodeURIComponent(
              `Hi ${recipientName}, regarding your ALSayyedah order #ALS${shortId}...`
            );
            const waUrl = cleanPhone
              ? `https://wa.me/91${
                  cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10)
                }?text=${waMessage}`
              : `https://wa.me/?text=${waMessage}`;

            // Address construction
            const streetAddress =
              order.address?.address ||
              [
                order.address?.line1,
                order.address?.line2,
                order.address?.landmark,
              ]
                .filter(Boolean)
                .join(", ") ||
              "";

            const cityStatePin = [
              [order.address?.city, order.address?.state]
                .filter(Boolean)
                .join(", "),
              order.address?.pincode,
            ]
              .filter(Boolean)
              .join(" — ");

            // Calculated financial numbers
            const subtotal =
              order.subtotal !== undefined
                ? order.subtotal
                : order.items?.reduce(
                    (acc, item) => acc + (item.price || 0) * (item.qty || 1),
                    0
                  ) || 0;

            const shippingFee =
              order.shipping !== undefined
                ? order.shipping
                : subtotal >= 1999
                ? 0
                : 99;

            const codFee =
              order.codCharges !== undefined
                ? order.codCharges
                : order.paymentMethod === "COD"
                ? 49
                : 0;

            return (
              <div
                key={order.id}
                className="bg-cream border border-sand rounded-lg p-5 shadow-xs transition-colors hover:border-gold/50"
              >
                {/* ROW 1 — Header */}
                <div className="flex items-center justify-between gap-2 border-b border-sand/40 pb-2.5 mb-3">
                  <span className="font-mono text-sm text-taupe/60 font-medium">
                    Order #ALS{shortId}
                  </span>
                  <span className="text-xs text-taupe/60">
                    {formatOrderDate(order.createdAt)}
                  </span>
                </div>

                {/* ROW 2 — Customer info */}
                <div className="bg-beige rounded-md p-3 mb-3 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-taupe">
                      {recipientName}
                    </span>
                    {cleanPhone ? (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="font-mono text-xs text-taupe hover:text-gold transition-colors underline underline-offset-2"
                      >
                        +91 {cleanPhone}
                      </a>
                    ) : (
                      <span className="font-mono text-xs text-taupe/50">
                        No phone
                      </span>
                    )}
                  </div>
                  {streetAddress && (
                    <p className="whitespace-pre-line text-sm text-taupe/80 leading-relaxed">
                      {streetAddress}
                    </p>
                  )}
                  {cityStatePin && (
                    <p className="text-sm text-taupe/70">{cityStatePin}</p>
                  )}
                </div>

                {/* ROW 3 — Items list */}
                <div className="space-y-2 mb-3">
                  {order.items?.map((item, idx) => {
                    const itemTotal = (item.price || 0) * (item.qty || 1);
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded bg-sand shrink-0 overflow-hidden flex items-center justify-center">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-12 object-cover rounded bg-sand"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-taupe/30" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-taupe truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-taupe/60">
                            {item.size || "Free Size"} •{" "}
                            {item.color || "Standard"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-taupe/60 mr-2">
                            x{item.qty || 1}
                          </span>
                          <span className="font-semibold text-sm text-taupe">
                            ₹{itemTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ROW 4 — Payment summary */}
                <div className="bg-cream border border-sand rounded-md p-3 mb-3 text-sm space-y-1.5">
                  <div className="flex justify-between text-taupe/80">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {order.coupon && order.coupon.code && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Coupon ({order.coupon.code})</span>
                      <span>
                        -₹{(order.coupon.discount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-taupe/80">
                    <span>Shipping</span>
                    <span>
                      {shippingFee === 0
                        ? "FREE"
                        : `₹${shippingFee.toLocaleString("en-IN")}`}
                    </span>
                  </div>

                  {order.paymentMethod === "COD" && (
                    <div className="flex justify-between text-taupe/80">
                      <span>COD Charges</span>
                      <span>₹{codFee.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="border-t border-sand my-2" />

                  <div className="flex justify-between font-semibold text-taupe">
                    <span>Total</span>
                    <span>
                      ₹{(order.total || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* ROW 5 — Status + Actions */}
                <div className="flex flex-wrap justify-between items-center gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status || "PENDING"}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id,
                          e.target.value as Order["status"]
                        )
                      }
                      className={`text-xs px-3 py-1.5 rounded-md border font-semibold focus:outline-none transition-colors cursor-pointer ${getStatusColorClasses(
                        order.status
                      )}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {cleanPhone && (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-sand text-taupe bg-cream hover:bg-beige hover:border-gold hover:text-gold rounded-md transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Customer</span>
                      </a>
                    )}

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDelete(order.id)}
                      className="p-1.5 text-taupe/50 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      title="Delete order"
                      aria-label="Delete order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
