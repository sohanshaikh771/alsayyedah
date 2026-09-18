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
  Trash2,
  MapPin,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const STATUS_FILTERS = [
  "All",
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
  }

  if (!date) return "Just now";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");
  const [expandedAddresses, setExpandedAddresses] = useState<Record<string, boolean>>({});

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

  const toggleAddress = (orderId: string) => {
    setExpandedAddresses((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(orderId);
      } catch (err) {
        console.error("Failed to delete order:", err);
        alert("Failed to delete order. Please try again.");
      }
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "All" ||
      order.status?.toUpperCase() === statusFilter.toUpperCase();

    const orderPayment = (order.paymentMethod || "COD").toUpperCase();
    const matchesPayment =
      paymentFilter === "All" || orderPayment === paymentFilter.toUpperCase();

    return matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl text-taupe tracking-tight">
          Orders Manager
        </h1>
        <p className="text-sm text-taupe/70 mt-1">
          Track and manage orders, review full delivery addresses, and contact customers.
        </p>
      </div>

      {/* Filters Bar: Status Tabs & Payment Method Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-sand/50 pb-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
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
                    : "border border-sand text-taupe hover:border-gold hover:text-gold"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Payment Method Filter Dropdown */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <label className="text-xs font-semibold uppercase tracking-wider text-taupe">
            Payment:
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-md border border-sand bg-cream text-taupe focus:border-gold focus:outline-none cursor-pointer"
          >
            <option value="All">All Methods</option>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="ONLINE">Online Payment</option>
            <option value="WHATSAPP">WhatsApp Legacy</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="bg-cream border border-sand rounded-md p-8 text-center text-taupe font-medium">
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-cream border border-sand rounded-md p-10 text-center text-taupe/70 text-sm">
          No orders found matching your filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const shortId = order.id.slice(-8).toUpperCase();
            const recipientName =
              order.address?.fullName || order.customerName || "Customer";
            const rawPhone = order.address?.phone || order.customerPhone || "";
            const cleanPhone = rawPhone.replace(/\D/g, "");
            const altPhone = order.address?.altPhone
              ? order.address.altPhone.replace(/\D/g, "")
              : "";
            const isAddressExpanded = expandedAddresses[order.id];

            const waMessage = encodeURIComponent(
              `Hi ${recipientName}, this is regarding your ALSayyedah order #ALS${shortId}.`
            );
            const waUrl = cleanPhone
              ? `https://wa.me/91${
                  cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10)
                }?text=${waMessage}`
              : "#";

            return (
              <div
                key={order.id}
                className="bg-cream border border-sand rounded-lg p-5 shadow-xs space-y-4 transition-all"
              >
                {/* Row 1: Order #, Date, and Status/Payment Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand/50 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-taupe">
                      Order #ALS{shortId}
                    </span>
                    <span className="text-xs text-taupe/60">
                      {formatOrderDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Payment Method Badge */}
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded font-medium uppercase tracking-wider border ${
                        order.paymentMethod === "COD"
                          ? "bg-amber-50 text-amber-900 border-amber-200"
                          : order.paymentMethod === "ONLINE"
                          ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                          : "bg-beige text-taupe border-sand"
                      }`}
                    >
                      {order.paymentMethod || "COD"}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider border ${
                        order.status === "PENDING"
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : order.status === "CONFIRMED"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : order.status === "SHIPPED"
                          ? "bg-purple-100 text-purple-800 border-purple-300"
                          : order.status === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-rose-100 text-rose-800 border-rose-300"
                      }`}
                    >
                      {order.status || "PENDING"}
                    </span>
                  </div>
                </div>

                {/* Row 2: Customer Contact Card + Call / WhatsApp Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-beige/40 p-3.5 rounded-md border border-sand/40">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-taupe">
                      {recipientName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-taupe/80 mt-0.5">
                      {cleanPhone && (
                        <a
                          href={`tel:${cleanPhone}`}
                          className="hover:text-gold underline underline-offset-2 flex items-center gap-1 font-medium"
                          title="Click to call primary phone"
                        >
                          <Phone className="w-3 h-3 text-gold" />
                          <span>+91 {cleanPhone}</span>
                        </a>
                      )}
                      {altPhone && (
                        <a
                          href={`tel:${altPhone}`}
                          className="hover:text-gold underline underline-offset-2 flex items-center gap-1 text-taupe/70"
                          title="Click to call alternate phone"
                        >
                          <span>(Alt: +91 {altPhone})</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Customer Quick Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {cleanPhone && (
                      <>
                        <a
                          href={`tel:${cleanPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-cream border border-sand text-taupe hover:border-gold hover:text-gold rounded transition-colors shadow-2xs cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-gold" />
                          <span>Call Customer</span>
                        </a>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded transition-colors shadow-2xs cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Customer</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Row 3: Collapsible Delivery Address */}
                {order.address && (
                  <div className="border border-sand/60 rounded-md overflow-hidden bg-cream/80">
                    <button
                      type="button"
                      onClick={() => toggleAddress(order.id)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-beige/60 hover:bg-beige text-xs font-medium text-taupe transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                        <span className="font-semibold uppercase tracking-wider text-[11px] flex-shrink-0">
                          Delivery Address
                        </span>
                        {!isAddressExpanded && (
                          <span className="text-taupe/70 truncate text-xs">
                            — {order.address.city}, {order.address.state} ({order.address.pincode})
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1 text-taupe/60 text-[11px] flex-shrink-0 ml-2">
                        <span>{isAddressExpanded ? "Hide Details" : "View Full Address"}</span>
                        {isAddressExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </button>

                    {isAddressExpanded && (
                      <div className="p-3.5 text-xs text-taupe/90 space-y-2 border-t border-sand/40 bg-cream">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-taupe/50 block font-semibold">
                              Full Name
                            </span>
                            <p className="font-medium text-taupe">{order.address.fullName}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-taupe/50 block font-semibold">
                              Phone Numbers
                            </span>
                            <p>
                              <a
                                href={`tel:${order.address.phone}`}
                                className="hover:text-gold underline underline-offset-2 font-medium"
                              >
                                +91 {order.address.phone}
                              </a>
                              {order.address.altPhone && (
                                <span className="text-taupe/70 ml-2">
                                  • Alt:{" "}
                                  <a
                                    href={`tel:${order.address.altPhone}`}
                                    className="hover:text-gold underline underline-offset-2"
                                  >
                                    +91 {order.address.altPhone}
                                  </a>
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-sand/30">
                          <span className="text-[10px] uppercase tracking-wider text-taupe/50 block font-semibold">
                            Full Street Address
                          </span>
                          <p className="font-sans leading-relaxed text-taupe whitespace-pre-line">
                            {order.address.address || (
                              <>
                                {order.address.line1}
                                {order.address.line2 && <>, {order.address.line2}</>}
                                {order.address.landmark && (
                                  <span className="text-taupe/70">
                                    {" "}
                                    (Landmark: {order.address.landmark})
                                  </span>
                                )}
                              </>
                            )}
                          </p>
                          <p className="font-semibold text-taupe mt-0.5">
                            {order.address.city}, {order.address.state} - {order.address.pincode}
                          </p>
                        </div>

                        {order.address.notes && (
                          <div className="pt-2 border-t border-sand/30">
                            <span className="text-[10px] uppercase tracking-wider text-taupe/50 block font-semibold">
                              Order Notes from Customer
                            </span>
                            <p className="text-taupe/80 italic">
                              &ldquo;{order.address.notes}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Row 4: Items List */}
                <div className="text-xs text-taupe/80 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-taupe/50 block font-semibold">
                    Items ({order.items?.reduce((acc, it) => acc + (it.qty || 1), 0) || 0})
                  </span>
                  <div className="bg-beige/30 p-2.5 rounded border border-sand/30 space-y-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-taupe">
                          • {item.name}{" "}
                          <span className="text-taupe/60 font-normal">
                            ({item.size}, {item.color})
                          </span>{" "}
                          × {item.qty}
                        </span>
                        <span className="font-medium text-taupe">
                          ₹{(item.price * item.qty).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 5: Total, Status Selector & Delete */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-sand/50">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-taupe/60 uppercase tracking-wider font-semibold">
                      Total:
                    </span>
                    <span className="font-serif text-xl font-bold text-taupe">
                      ₹{(order.total || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-taupe">
                        Status:
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(
                            order.id,
                            e.target.value as Order["status"]
                          )
                        }
                        className={`text-xs px-3 py-1.5 rounded-md border font-medium focus:outline-none transition-colors cursor-pointer ${
                          order.status === "PENDING"
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : order.status === "CONFIRMED"
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : order.status === "SHIPPED"
                            ? "bg-purple-100 text-purple-800 border-purple-300"
                            : order.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-rose-100 text-rose-800 border-rose-300"
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(order.id)}
                      className="p-1.5 text-taupe/60 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
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
