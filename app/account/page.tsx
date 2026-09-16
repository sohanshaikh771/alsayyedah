"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  Package,
  LogOut,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  Check,
  ArrowRight,
  User as UserIcon,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { OrderAddress, OrderItem } from "@/lib/orders-firestore";
import {
  SavedAddress,
  INDIAN_STATES,
  subscribeUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/addresses-firestore";

interface Order {
  id: string;
  userId?: string | null;
  status?: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | string;
  paymentMethod?: "COD" | "ONLINE" | "WHATSAPP" | string;
  total?: number;
  customerName?: string;
  customerPhone?: string;
  items?: OrderItem[];
  createdAt?: unknown;
  address?: OrderAddress;
}

const STEP_LABELS = ["Placed", "Confirmed", "Shipped", "Delivered"];

function getStepIndex(status: string = "PENDING"): number {
  const s = status.toUpperCase();
  if (s === "DELIVERED") return 3;
  if (s === "SHIPPED") return 2;
  if (s === "CONFIRMED") return 1;
  return 0; // PENDING
}

function AccountContent() {
  const { user, loading, loginGoogle, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state derived from URL search parameter
  const tabParam = searchParams.get("tab");
  const activeTab =
    tabParam === "orders" ? "orders" : tabParam === "addresses" ? "addresses" : "profile";

  // Login states
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Addresses state
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);

  // Address Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [modalForm, setModalForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Subscribe to Orders
  useEffect(() => {
    if (!user) return;

    const currentUserId = user.uid;
    setFetchingOrders(true);
    setOrdersError(null);

    const ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", currentUserId)
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const orderList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        // Sort descending by createdAt
        orderList.sort((a, b) => {
          const getMillis = (ts: any) => {
            if (!ts) return 0;
            if (typeof ts.toMillis === "function") return ts.toMillis();
            if (typeof ts.seconds === "number") return ts.seconds * 1000;
            if (ts instanceof Date) return ts.getTime();
            return new Date(ts).getTime() || 0;
          };
          return getMillis(b.createdAt) - getMillis(a.createdAt);
        });

        setOrders(orderList);
        setFetchingOrders(false);
      },
      (error) => {
        console.error("Error subscribing to orders:", error);
        setOrdersError("Could not load orders");
        setFetchingOrders(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Subscribe to Addresses
  useEffect(() => {
    if (!user) return;

    setFetchingAddresses(true);
    const unsubscribe = subscribeUserAddresses(
      user.uid,
      (list) => {
        setAddresses(list);
        setFetchingAddresses(false);
      },
      () => setFetchingAddresses(false)
    );

    return () => unsubscribe();
  }, [user]);

  const handleGoogleLogin = async () => {
    try {
      setLoginLoading(true);
      setLoginError(null);
      await loginGoogle();
    } catch (err: unknown) {
      console.error("Google sign-in failed:", err);
      setLoginError("Sign in with Google failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setModalForm({
      fullName: user?.displayName || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: addresses.length === 0,
    });
    setModalErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setModalForm({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setModalErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    setModalErrors({});
  };

  const validateModal = () => {
    const errs: Record<string, string> = {};
    if (!modalForm.fullName.trim()) errs.fullName = "Full name is required";
    const cleanPhone = modalForm.phone.replace(/\D/g, "");
    if (!cleanPhone) errs.phone = "Phone number is required";
    else if (cleanPhone.length !== 10) errs.phone = "Enter a valid 10-digit phone number";

    if (!modalForm.address.trim()) errs.address = "Full address is required";
    if (!modalForm.city.trim()) errs.city = "City is required";
    if (!modalForm.state.trim()) errs.state = "Select a state";
    const cleanPin = modalForm.pincode.replace(/\D/g, "");
    if (!cleanPin) errs.pincode = "Pincode is required";
    else if (cleanPin.length !== 6) errs.pincode = "Enter a valid 6-digit pincode";

    setModalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validateModal()) return;

    try {
      setModalSubmitting(true);
      if (editingAddress) {
        await updateAddress(editingAddress.id, user.uid, {
          fullName: modalForm.fullName,
          phone: modalForm.phone,
          address: modalForm.address,
          city: modalForm.city,
          state: modalForm.state,
          pincode: modalForm.pincode,
          isDefault: modalForm.isDefault,
        });
      } else {
        await addAddress({
          userId: user.uid,
          fullName: modalForm.fullName,
          phone: modalForm.phone,
          address: modalForm.address,
          city: modalForm.city,
          state: modalForm.state,
          pincode: modalForm.pincode,
          isDefault: modalForm.isDefault,
        });
      }
      closeModal();
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address. Please try again.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(id);
      } catch (err) {
        console.error("Error deleting address:", err);
      }
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (!user) return;
    try {
      await setDefaultAddress(id, user.uid);
    } catch (err) {
      console.error("Error setting default address:", err);
    }
  };

  const formatDate = (createdAt: unknown) => {
    if (!createdAt) return "Recent";
    const ts = createdAt as any;
    let date: Date | null = null;
    if (typeof ts === "object" && ts !== null) {
      if (typeof ts.toDate === "function") date = ts.toDate();
      else if (typeof ts.seconds === "number") date = new Date(ts.seconds * 1000);
    } else if (createdAt instanceof Date) {
      date = createdAt;
    } else if (typeof createdAt === "string" || typeof createdAt === "number") {
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) date = d;
    }
    if (!date) return "Recent";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderStatusBadge = (status?: string) => {
    const s = (status || "PENDING").toUpperCase();
    switch (s) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Order Placed — Awaiting Confirmation</span>
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-900 border border-blue-300">
            <CheckCircle className="w-3.5 h-3.5 text-blue-700" />
            <span>Confirmed — Being Prepared</span>
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-900 border border-purple-300">
            <Truck className="w-3.5 h-3.5 text-purple-700" />
            <span>Shipped — On the way</span>
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-900 border border-emerald-300">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Delivered</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-900 border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-700" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Order Placed — Awaiting Confirmation</span>
          </span>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-taupe">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 flex items-center justify-center">
          <p className="text-center font-serif text-2xl text-taupe">Loading account...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // 1. NOT LOGGED IN VIEW: Centered Card
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-taupe">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-4 py-20 w-full flex flex-col items-center justify-center text-center">
          <div className="bg-cream border border-sand rounded-xl p-8 shadow-sm w-full">
            <h1 className="font-serif text-3xl sm:text-4xl text-taupe mb-2">
              Welcome to ALSayyedah
            </h1>
            <p className="text-sm text-taupe/70 mb-8 leading-relaxed">
              Login to view your orders and manage your account.
            </p>

            {loginError && (
              <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded text-center">
                {loginError}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loginLoading}
              className="w-full flex items-center justify-center gap-3 border border-sand py-3 rounded-md hover:bg-beige transition bg-white text-taupe text-sm font-medium shadow-2xs disabled:opacity-60 cursor-pointer"
            >
              <FcGoogle className="w-5 h-5 flex-shrink-0" />
              <span>{loginLoading ? "Signing in..." : "Continue with Google"}</span>
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-sand/60" />
              <span className="text-taupe/40 text-xs font-semibold uppercase tracking-wider">
                OR
              </span>
              <div className="flex-1 h-px bg-sand/60" />
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs text-taupe/70 hover:text-gold transition font-medium"
            >
              <span>Continue Shopping as Guest →</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 2. LOGGED IN VIEW: Sidebar Tabs Layout
  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        <h1 className="font-serif text-3xl sm:text-4xl text-taupe mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* LEFT SIDEBAR (lg:col-span-1) */}
          <aside className="lg:col-span-1 space-y-6">
            {/* User Card */}
            <div className="bg-cream border border-sand rounded-xl p-5 flex items-center gap-4 shadow-2xs">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User avatar"}
                  className="w-16 h-16 rounded-full object-cover border border-sand flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-taupe text-cream flex items-center justify-center font-serif text-2xl font-semibold flex-shrink-0">
                  {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-medium text-taupe truncate text-base">
                  {user.displayName || "Customer"}
                </h2>
                <p className="text-xs text-taupe/60 truncate">{user.email}</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 p-1 bg-cream/60 border border-sand/60 rounded-xl">
              <Link
                href="/account"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap ${
                  activeTab === "profile"
                    ? "bg-beige text-taupe font-medium shadow-2xs border border-sand/50"
                    : "text-taupe/70 hover:bg-beige/50"
                }`}
              >
                <UserIcon className="w-4 h-4 text-gold flex-shrink-0" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/account?tab=orders"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap ${
                  activeTab === "orders"
                    ? "bg-beige text-taupe font-medium shadow-2xs border border-sand/50"
                    : "text-taupe/70 hover:bg-beige/50"
                }`}
              >
                <Package className="w-4 h-4 text-gold flex-shrink-0" />
                <span>My Orders</span>
              </Link>

              <Link
                href="/account?tab=addresses"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap ${
                  activeTab === "addresses"
                    ? "bg-beige text-taupe font-medium shadow-2xs border border-sand/50"
                    : "text-taupe/70 hover:bg-beige/50"
                }`}
              >
                <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                <span>Saved Addresses</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-taupe/70 hover:bg-red-50 hover:text-red-700 transition-all text-left w-full cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-4 h-4 text-taupe/50 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </nav>
          </aside>

          {/* RIGHT CONTENT (lg:col-span-3) */}
          <div className="lg:col-span-3 min-w-0">
            {/* TAB 1: PROFILE SECTION */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl text-taupe font-medium">My Profile</h2>
                <div className="bg-cream border border-sand rounded-xl p-8 max-w-lg text-center shadow-xs">
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "Profile avatar"}
                      className="w-20 h-20 rounded-full object-cover border border-sand mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-taupe text-cream flex items-center justify-center font-serif text-3xl font-semibold mx-auto mb-4">
                      {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-serif text-xl font-medium text-taupe mb-1">
                    {user.displayName || "Valued Customer"}
                  </h3>
                  <p className="text-sm text-taupe/60 mb-2">{user.email}</p>
                  <p className="text-xs text-taupe/50 mt-3 inline-flex items-center gap-1.5 bg-beige/60 px-3 py-1 rounded-full border border-sand/50">
                    <FcGoogle className="w-3.5 h-3.5" />
                    <span>Signed in with Google</span>
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: ORDERS SECTION */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl text-taupe font-medium">My Orders</h2>

                {fetchingOrders ? (
                  <div className="bg-cream border border-sand rounded-xl p-10 text-center text-sm text-taupe/70">
                    Loading orders...
                  </div>
                ) : ordersError ? (
                  <div className="bg-cream border border-red-200 rounded-xl p-8 text-center text-sm text-red-600">
                    {ordersError}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-cream border border-sand rounded-xl p-12 text-center py-20 shadow-2xs">
                    <Package className="w-16 h-16 text-taupe/30 mx-auto" />
                    <h3 className="font-serif text-2xl text-taupe mt-4">No orders yet</h3>
                    <p className="text-sm text-taupe/60 mt-2">
                      Your first order will appear here
                    </p>
                    <Link
                      href="/shop"
                      className="inline-block bg-taupe text-cream px-6 py-3 rounded-md mt-6 hover:bg-gold transition font-medium text-sm shadow-2xs"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const status = (order.status || "PENDING").toUpperCase();
                      const isCancelled = status === "CANCELLED";
                      const currentStep = getStepIndex(status);
                      const shortId = order.id.slice(-6).toUpperCase();
                      const total = order.total || 0;
                      const items = Array.isArray(order.items) ? order.items : [];
                      const displayedItems = items.slice(0, 3);
                      const extraItemsCount = Math.max(0, items.length - 3);
                      const paymentLabel =
                        order.paymentMethod === "COD" || !order.paymentMethod
                          ? "COD"
                          : "Online";

                      return (
                        <div
                          key={order.id}
                          className="bg-cream border border-sand rounded-xl p-5 shadow-xs space-y-4"
                        >
                          {/* ROW 1 — Header */}
                          <div className="flex justify-between items-center text-sm border-b border-sand/40 pb-3">
                            <span className="font-mono text-sm font-semibold text-taupe">
                              Order #ALS{shortId}
                            </span>
                            <span className="text-xs text-taupe/60">
                              Placed on {formatDate(order.createdAt)}
                            </span>
                          </div>

                          {/* ROW 2 — Status Badge */}
                          <div>{renderStatusBadge(status)}</div>

                          {/* ROW 3 — Progress Tracker (hide if CANCELLED) */}
                          {!isCancelled && (
                            <div className="py-2">
                              <div className="flex items-center justify-between w-full">
                                {STEP_LABELS.map((label, idx) => {
                                  const isCompleted = idx < currentStep;
                                  const isCurrent = idx === currentStep;

                                  return (
                                    <React.Fragment key={label}>
                                      <div className="flex flex-col items-center">
                                        <div
                                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                                            isCompleted
                                              ? "bg-taupe text-cream"
                                              : isCurrent
                                              ? "bg-gold text-cream ring-4 ring-gold/20 font-bold"
                                              : "bg-cream border border-sand text-taupe/40"
                                          }`}
                                        >
                                          {isCompleted ? (
                                            <Check className="w-3.5 h-3.5" />
                                          ) : (
                                            <span>{idx + 1}</span>
                                          )}
                                        </div>
                                        <span
                                          className={`text-[10px] uppercase tracking-wide mt-1.5 text-center ${
                                            isCompleted || isCurrent
                                              ? "text-taupe font-semibold"
                                              : "text-taupe/50"
                                          }`}
                                        >
                                          {label}
                                        </span>
                                      </div>

                                      {idx < STEP_LABELS.length - 1 && (
                                        <div
                                          className={`flex-1 h-0.5 mx-1.5 -mt-5 ${
                                            idx < currentStep ? "bg-taupe" : "bg-sand"
                                          }`}
                                        />
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* ROW 4 — Items */}
                          <div className="space-y-2 pt-2 border-t border-sand/40">
                            {displayedItems.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex gap-3 items-center justify-between"
                              >
                                <div className="flex gap-3 items-center min-w-0">
                                  {item.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-12 h-16 object-cover rounded bg-sand flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-12 h-16 rounded bg-sand/60 flex items-center justify-center text-[10px] text-taupe/50 flex-shrink-0">
                                      No Img
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-taupe truncate">
                                      {item.name}
                                    </p>
                                    <p className="text-[11px] text-taupe/60 mt-0.5">
                                      {item.size} • {item.color}
                                    </p>
                                    <p className="text-[11px] text-taupe/60">
                                      Qty: {item.qty}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-xs font-semibold text-taupe text-right pl-2 flex-shrink-0">
                                  ₹{(item.price * item.qty).toLocaleString("en-IN")}
                                </div>
                              </div>
                            ))}

                            {extraItemsCount > 0 && (
                              <p className="text-xs text-taupe/60 italic pt-1">
                                and {extraItemsCount} more item
                                {extraItemsCount > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>

                          {/* ROW 5 — Footer */}
                          <div className="flex justify-between items-center pt-3 border-t border-sand mt-3">
                            <div>
                              <span className="font-semibold text-taupe text-sm">
                                Total: ₹{Number(total).toLocaleString("en-IN")}
                              </span>
                              <span className="text-xs text-taupe/60 ml-1">
                                • {paymentLabel}
                              </span>
                            </div>

                            <Link
                              href={`/account/orders/${order.id}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-taupe underline underline-offset-4 hover:text-gold transition"
                            >
                              <span>View Details</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ADDRESSES SECTION */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="font-serif text-2xl text-taupe font-medium">
                    Saved Addresses
                  </h2>
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center gap-1.5 bg-taupe text-cream px-4 py-2 rounded-md text-sm font-medium hover:bg-gold transition shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {fetchingAddresses ? (
                  <div className="bg-cream border border-sand rounded-xl p-10 text-center text-sm text-taupe/70">
                    Loading addresses...
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="bg-cream border border-sand rounded-xl p-12 text-center py-16 shadow-2xs">
                    <MapPin className="w-14 h-14 text-taupe/30 mx-auto mb-3" />
                    <h3 className="font-serif text-xl text-taupe">No addresses saved yet</h3>
                    <p className="text-xs text-taupe/60 mt-1 mb-6">
                      Add a delivery address to speed up your checkout process.
                    </p>
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="inline-flex items-center gap-1.5 bg-taupe text-cream px-5 py-2.5 rounded-md text-sm font-medium hover:bg-gold transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Address</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="bg-cream border border-sand rounded-xl p-4 sm:p-5 shadow-2xs space-y-2.5 transition-all hover:border-gold/50"
                      >
                        {/* Top row: Name + phone + DEFAULT badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm text-taupe">
                              {addr.fullName}
                            </span>
                            <span className="text-xs text-taupe/70 font-mono">
                              +91 {addr.phone}
                            </span>
                          </div>

                          {addr.isDefault && (
                            <span className="text-[10px] bg-gold text-cream font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                              DEFAULT
                            </span>
                          )}
                        </div>

                        {/* Full Address */}
                        <p className="text-sm text-taupe/80 whitespace-pre-line leading-relaxed">
                          {addr.address}
                        </p>

                        {/* City, State - Pincode */}
                        <p className="text-xs font-semibold text-taupe">
                          {addr.city}, {addr.state} — {addr.pincode}
                        </p>

                        {/* Bottom Row Actions */}
                        <div className="flex items-center gap-4 pt-2 border-t border-sand/40 text-xs">
                          <button
                            type="button"
                            onClick={() => openEditModal(addr)}
                            className="inline-flex items-center gap-1 text-taupe underline underline-offset-2 hover:text-gold transition font-medium cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 transition font-medium cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>

                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-taupe underline underline-offset-2 hover:text-gold transition font-medium cursor-pointer ml-auto"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL FOR ADD / EDIT ADDRESS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-cream rounded-xl p-6 w-full max-w-md border border-sand shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-sand/60 pb-3">
              <h3 className="font-serif text-xl text-taupe font-medium">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-taupe/50 hover:text-taupe transition cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={modalForm.fullName}
                  onChange={(e) =>
                    setModalForm((p) => ({ ...p, fullName: e.target.value }))
                  }
                  placeholder="e.g. Fatima Shaikh"
                  className={`w-full bg-beige/40 border rounded px-3 py-2 text-sm text-taupe placeholder:text-taupe/40 focus:outline-none transition-colors ${
                    modalErrors.fullName
                      ? "border-red-500 bg-red-50/20"
                      : "border-sand focus:border-gold"
                  }`}
                />
                {modalErrors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{modalErrors.fullName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                  Phone Number (10 digits) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm text-taupe/60 font-medium select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={modalForm.phone}
                    onChange={(e) =>
                      setModalForm((p) => ({
                        ...p,
                        phone: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="9876543210"
                    className={`w-full bg-beige/40 border rounded pl-12 pr-3 py-2 text-sm text-taupe placeholder:text-taupe/40 focus:outline-none transition-colors ${
                      modalErrors.phone
                        ? "border-red-500 bg-red-50/20"
                        : "border-sand focus:border-gold"
                    }`}
                  />
                </div>
                {modalErrors.phone && (
                  <p className="text-xs text-red-600 mt-1">{modalErrors.phone}</p>
                )}
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={modalForm.address}
                  onChange={(e) =>
                    setModalForm((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="House/Flat no., Building name, Street, Area, Landmark"
                  className={`w-full bg-beige/40 border rounded px-3 py-2 text-sm text-taupe placeholder:text-taupe/40 focus:outline-none transition-colors resize-y ${
                    modalErrors.address
                      ? "border-red-500 bg-red-50/20"
                      : "border-sand focus:border-gold"
                  }`}
                />
                {modalErrors.address && (
                  <p className="text-xs text-red-600 mt-1">{modalErrors.address}</p>
                )}
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalForm.city}
                    onChange={(e) =>
                      setModalForm((p) => ({ ...p, city: e.target.value }))
                    }
                    placeholder="e.g. Mumbai"
                    className={`w-full bg-beige/40 border rounded px-3 py-2 text-sm text-taupe placeholder:text-taupe/40 focus:outline-none transition-colors ${
                      modalErrors.city
                        ? "border-red-500 bg-red-50/20"
                        : "border-sand focus:border-gold"
                    }`}
                  />
                  {modalErrors.city && (
                    <p className="text-xs text-red-600 mt-1">{modalErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalForm.state}
                    onChange={(e) =>
                      setModalForm((p) => ({ ...p, state: e.target.value }))
                    }
                    className={`w-full bg-beige/40 border rounded px-3 py-2 text-sm text-taupe focus:outline-none transition-colors cursor-pointer ${
                      modalErrors.state
                        ? "border-red-500 bg-red-50/20"
                        : "border-sand focus:border-gold"
                    }`}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {modalErrors.state && (
                    <p className="text-xs text-red-600 mt-1">{modalErrors.state}</p>
                  )}
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                  Pincode (6 digits) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={modalForm.pincode}
                  onChange={(e) =>
                    setModalForm((p) => ({
                      ...p,
                      pincode: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  placeholder="e.g. 400001"
                  className={`w-full bg-beige/40 border rounded px-3 py-2 text-sm text-taupe placeholder:text-taupe/40 focus:outline-none transition-colors ${
                    modalErrors.pincode
                      ? "border-red-500 bg-red-50/20"
                      : "border-sand focus:border-gold"
                  }`}
                />
                {modalErrors.pincode && (
                  <p className="text-xs text-red-600 mt-1">{modalErrors.pincode}</p>
                )}
              </div>

              {/* Default Address Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modalIsDefault"
                  checked={modalForm.isDefault}
                  onChange={(e) =>
                    setModalForm((p) => ({ ...p, isDefault: e.target.checked }))
                  }
                  className="rounded border-sand text-gold focus:ring-gold cursor-pointer"
                />
                <label
                  htmlFor="modalIsDefault"
                  className="text-xs text-taupe/80 cursor-pointer select-none font-medium"
                >
                  Set as default address
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-medium text-taupe border border-sand rounded-md hover:bg-beige transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 text-xs font-medium bg-taupe text-cream rounded-md hover:bg-gold transition shadow-2xs disabled:opacity-60 cursor-pointer"
                >
                  {modalSubmitting ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-cream text-taupe">
          <Navbar />
          <main className="flex-1 max-w-4xl mx-auto px-4 py-20 flex items-center justify-center">
            <p className="text-center font-serif text-2xl text-taupe">Loading account...</p>
          </main>
          <Footer />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
