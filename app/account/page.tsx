"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  User as UserIcon,
  Package,
  MapPin,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { OrderItem } from "@/lib/orders-firestore";
import {
  Address,
  INDIAN_STATES,
  subscribeUserAddresses,
  saveAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/addresses-firestore";

interface OrderData {
  id: string;
  orderRef?: string;
  userId?: string | null;
  status?: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | string;
  total?: number;
  items?: OrderItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
}

// Status badge styling helper
function getStatusBadge(status?: string) {
  const s = (status || "PENDING").toUpperCase();
  switch (s) {
    case "PENDING":
      return {
        label: "Awaiting Confirmation",
        className: "bg-amber-50 text-amber-800 border-amber-200",
      };
    case "CONFIRMED":
      return {
        label: "Being Prepared",
        className: "bg-blue-50 text-blue-800 border-blue-200",
      };
    case "SHIPPED":
      return {
        label: "On the way",
        className: "bg-purple-50 text-purple-800 border-purple-200",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        className: "bg-rose-50 text-rose-800 border-rose-200",
      };
    default:
      return {
        label: status || "Pending",
        className: "bg-stone-100 text-stone-700 border-stone-200",
      };
  }
}

// Formats firestore timestamps or dates
function formatOrderDate(createdAt: unknown): string {
  if (!createdAt) return "Recent";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ts = createdAt as any;
  let d: Date | null = null;
  if (typeof ts?.toDate === "function") {
    d = ts.toDate();
  } else if (typeof ts?.seconds === "number") {
    d = new Date(ts.seconds * 1000);
  } else if (createdAt instanceof Date) {
    d = createdAt;
  } else if (typeof createdAt === "string") {
    d = new Date(createdAt);
  }

  if (d && !isNaN(d.getTime())) {
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return "Recent";
}

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, loginGoogle, logout } = useAuth();

  // Active tab state
  const tabParam = searchParams.get("tab");
  const activeTab =
    tabParam === "orders" ? "orders" : tabParam === "addresses" ? "addresses" : "profile";

  // Login action state
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Orders state
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Address modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
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
  const [savingAddress, setSavingAddress] = useState(false);

  // Fetch real-time orders for current user
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: OrderData[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        // Sort descending by createdAt
        list.sort((a, b) => {
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

        setOrders(list);
        setLoadingOrders(false);
      },
      (err) => {
        console.error("Error fetching user orders:", err);
        setLoadingOrders(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch real-time addresses for current user
  useEffect(() => {
    if (!user) {
      setAddresses([]);
      setLoadingAddresses(false);
      return;
    }

    setLoadingAddresses(true);
    const unsubscribe = subscribeUserAddresses(
      user.uid,
      (list) => {
        setAddresses(list);
        setLoadingAddresses(false);
      },
      (err) => {
        console.error("Error fetching user addresses:", err);
        setLoadingAddresses(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      await loginGoogle();
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setLoginError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Modal actions
  const openAddModal = () => {
    setEditingAddress(null);
    setModalForm({
      fullName: user?.displayName || "",
      phone: "",
      address: "",
      city: "",
      state: INDIAN_STATES[0] || "",
      pincode: "",
      isDefault: addresses.length === 0,
    });
    setModalErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
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

  const validateModalForm = () => {
    const errs: Record<string, string> = {};
    if (!modalForm.fullName.trim()) {
      errs.fullName = "Full name is required";
    }

    const cleanPhone = modalForm.phone.replace(/\D/g, "");
    if (!cleanPhone) {
      errs.phone = "Phone number is required";
    } else if (cleanPhone.length !== 10) {
      errs.phone = "Enter a valid 10-digit phone number";
    }

    if (!modalForm.address.trim()) {
      errs.address = "Address is required";
    }
    if (!modalForm.city.trim()) {
      errs.city = "City is required";
    }
    if (!modalForm.state.trim()) {
      errs.state = "State is required";
    }

    const cleanPin = modalForm.pincode.replace(/\D/g, "");
    if (!cleanPin) {
      errs.pincode = "Pincode is required";
    } else if (cleanPin.length !== 6) {
      errs.pincode = "Enter a valid 6-digit pincode";
    }

    setModalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validateModalForm()) return;

    try {
      setSavingAddress(true);
      if (editingAddress) {
        await updateAddress(
          editingAddress.id,
          {
            fullName: modalForm.fullName,
            phone: modalForm.phone,
            address: modalForm.address,
            city: modalForm.city,
            state: modalForm.state,
            pincode: modalForm.pincode,
            isDefault: modalForm.isDefault,
          },
          user.uid
        );
      } else {
        await saveAddress(user.uid, {
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
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Failed to save address. Please try again.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress(id);
    } catch (err) {
      console.error("Error deleting address:", err);
      alert("Failed to delete address.");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (!user) return;
    try {
      await setDefaultAddress(user.uid, id);
    } catch (err) {
      console.error("Error setting default address:", err);
    }
  };

  // 1. Initial auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-taupe" />
            <p className="text-sm font-sans text-taupe/70">Loading account...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 2. IF user is NOT logged in: Centered card
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
          <div className="w-full max-w-md mx-auto py-20">
            <div className="bg-cream border border-sand rounded-xl p-8 sm:p-10 shadow-sm text-center">
              {/* Heading */}
              <h1 className="font-serif text-3xl text-taupe font-medium">
                Welcome to ALSayyedah
              </h1>

              {/* Subtext */}
              <p className="text-taupe/70 text-sm mt-3 leading-relaxed">
                Login to view your orders and manage your account.
              </p>

              {loginError && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
                  {loginError}
                </div>
              )}

              {/* Continue with Google button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full mt-8 flex items-center justify-center gap-3 bg-white border border-sand hover:border-taupe/40 text-taupe font-medium py-3 px-4 rounded-md shadow-xs hover:shadow-sm transition-all duration-200 disabled:opacity-60 cursor-pointer"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin text-taupe" />
                ) : (
                  <FcGoogle className="w-5 h-5 shrink-0" />
                )}
                <span>Continue with Google</span>
              </button>

              {/* Divider "OR" */}
              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sand" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-cream px-3 text-taupe/50 tracking-wider font-medium">
                    OR
                  </span>
                </div>
              </div>

              {/* Continue Shopping as Guest Link */}
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-taupe hover:text-gold transition-colors duration-200"
              >
                <span>Continue Shopping as Guest</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 3. IF user IS logged in: 4-col layout
  const userInitial = (user.displayName || user.email || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ================= LEFT SIDEBAR (lg:col-span-1) ================= */}
          <aside className="lg:col-span-1">
            <div className="bg-cream border border-sand rounded-xl p-6 sticky top-24">
              {/* User Card */}
              <div className="flex items-center gap-4 pb-6 border-b border-sand/70">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User avatar"}
                    className="w-16 h-16 rounded-full object-cover border border-sand shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-taupe text-cream flex items-center justify-center text-2xl font-serif font-medium shrink-0 shadow-xs">
                    {userInitial}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-lg font-medium text-taupe truncate">
                    {user.displayName || "Valued Customer"}
                  </h2>
                  <p className="text-xs text-taupe/70 truncate mt-0.5" title={user.email || ""}>
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Vertical Tabs */}
              <nav className="space-y-1 mt-6">
                {/* Tab: Profile */}
                <Link
                  href="/account"
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 ${
                    activeTab === "profile"
                      ? "bg-beige text-taupe font-medium rounded-md"
                      : "text-taupe/70 hover:bg-beige/50 rounded-md"
                  }`}
                >
                  <UserIcon className="w-4 h-4 shrink-0" />
                  <span>My Profile</span>
                </Link>

                {/* Tab: Orders */}
                <Link
                  href="/account?tab=orders"
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 ${
                    activeTab === "orders"
                      ? "bg-beige text-taupe font-medium rounded-md"
                      : "text-taupe/70 hover:bg-beige/50 rounded-md"
                  }`}
                >
                  <Package className="w-4 h-4 shrink-0" />
                  <span className="flex-1">My Orders</span>
                  {orders.length > 0 && (
                    <span className="text-xs bg-taupe/10 text-taupe px-2 py-0.5 rounded-full font-medium">
                      {orders.length}
                    </span>
                  )}
                </Link>

                {/* Tab: Addresses */}
                <Link
                  href="/account?tab=addresses"
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 ${
                    activeTab === "addresses"
                      ? "bg-beige text-taupe font-medium rounded-md"
                      : "text-taupe/70 hover:bg-beige/50 rounded-md"
                  }`}
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Saved Addresses</span>
                  {addresses.length > 0 && (
                    <span className="text-xs bg-taupe/10 text-taupe px-2 py-0.5 rounded-full font-medium">
                      {addresses.length}
                    </span>
                  )}
                </Link>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-700/80 hover:text-rose-900 hover:bg-rose-50/50 rounded-md transition-colors duration-150 text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* ================= RIGHT CONTENT (lg:col-span-3) ================= */}
          <section className="lg:col-span-3">
            {/* ----------------- TAB 1: PROFILE ----------------- */}
            {activeTab === "profile" && (
              <div>
                <h1 className="font-serif text-2xl text-taupe mb-6 font-medium">
                  My Profile
                </h1>

                <div className="bg-cream border border-sand rounded-xl p-6 sm:p-8 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "User avatar"}
                        className="w-20 h-20 rounded-full object-cover border border-sand shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-taupe text-cream flex items-center justify-center text-3xl font-serif font-medium shrink-0 shadow-sm">
                        {userInitial}
                      </div>
                    )}

                    <div className="space-y-1.5 flex-1">
                      <h2 className="font-serif text-2xl font-medium text-taupe">
                        {user.displayName || "Valued Customer"}
                      </h2>
                      <p className="text-sm text-taupe/80">{user.email}</p>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-sand rounded-full text-xs font-medium text-taupe shadow-2xs">
                          <FcGoogle className="w-3.5 h-3.5 shrink-0" />
                          <span>Signed in with Google</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-sand/70 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      href="/account?tab=orders"
                      className="p-4 rounded-lg bg-beige/40 border border-sand/60 hover:bg-beige/70 transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-taupe group-hover:text-gold transition-colors" />
                        <div>
                          <p className="text-sm font-medium text-taupe">Recent Orders</p>
                          <p className="text-xs text-taupe/60">
                            {orders.length} {orders.length === 1 ? "order placed" : "orders placed"}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-taupe/50 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link
                      href="/account?tab=addresses"
                      className="p-4 rounded-lg bg-beige/40 border border-sand/60 hover:bg-beige/70 transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-taupe group-hover:text-gold transition-colors" />
                        <div>
                          <p className="text-sm font-medium text-taupe">Saved Addresses</p>
                          <p className="text-xs text-taupe/60">
                            {addresses.length} {addresses.length === 1 ? "address saved" : "addresses saved"}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-taupe/50 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- TAB 2: ORDERS ----------------- */}
            {activeTab === "orders" && (
              <div>
                <h1 className="font-serif text-2xl text-taupe mb-6 font-medium">
                  My Orders
                </h1>

                {loadingOrders ? (
                  <div className="bg-cream border border-sand rounded-xl p-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-taupe mx-auto mb-2" />
                    <p className="text-sm text-taupe/70">Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  /* Empty State */
                  <div className="bg-cream border border-sand rounded-xl p-12 text-center">
                    <Package className="w-12 h-12 text-taupe/30 mx-auto mb-3" />
                    <h3 className="font-serif text-lg font-medium text-taupe">
                      No orders yet
                    </h3>
                    <p className="text-xs text-taupe/60 mt-1 max-w-sm mx-auto">
                      Explore our handcrafted collection of Burkhas, Abayas, and Niqabs.
                    </p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 mt-5 bg-taupe text-cream px-5 py-2.5 rounded-md hover:bg-taupe/90 transition text-sm font-medium shadow-xs"
                    >
                      <span>Start Shopping</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  /* Orders List */
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const badge = getStatusBadge(order.status);
                      const rawCode = order.orderRef
                        ? order.orderRef.replace(/[^A-Za-z0-9]/g, "")
                        : order.id;
                      const orderNum = rawCode.slice(-6).toUpperCase();

                      return (
                        <div
                          key={order.id}
                          className="bg-cream border border-sand rounded-md p-5 mb-4 shadow-2xs hover:border-taupe/40 transition-colors"
                        >
                          {/* Order Header: ID + Date + Status */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-sand/60">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-taupe text-base">
                                  Order #ALS{orderNum}
                                </span>
                              </div>
                              <span className="text-xs text-taupe/60 mt-0.5 block">
                                Placed on {formatOrderDate(order.createdAt)}
                              </span>
                            </div>

                            <span
                              className={`text-xs px-3 py-1 rounded-full font-medium border ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </div>

                          {/* Items Preview */}
                          {order.items && order.items.length > 0 && (
                            <div className="py-4 space-y-3">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-12 h-12 object-cover rounded-md border border-sand shrink-0 bg-white"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-md bg-beige/60 border border-sand flex items-center justify-center text-taupe/50 shrink-0">
                                      <Package className="w-5 h-5" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-taupe truncate">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-taupe/60 mt-0.5">
                                      Qty: {item.qty}
                                      {item.size ? ` • Size: ${item.size}` : ""}
                                      {item.color ? ` • Color: ${item.color}` : ""}
                                    </p>
                                  </div>
                                  <span className="text-xs font-medium text-taupe whitespace-nowrap">
                                    ₹{(item.price * item.qty).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Order Footer: Total + View Details */}
                          <div className="flex items-center justify-between pt-4 border-t border-sand/60">
                            <div>
                              <span className="text-xs text-taupe/60 block">Total Amount</span>
                              <span className="font-serif text-lg font-medium text-taupe">
                                ₹{Number(order.total || 0).toLocaleString("en-IN")}
                              </span>
                            </div>

                            <Link
                              href={`/account/orders/${order.id}`}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-gold transition-colors py-1.5 px-3 rounded hover:bg-beige/40"
                            >
                              <span>View Details</span>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ----------------- TAB 3: ADDRESSES ----------------- */}
            {activeTab === "addresses" && (
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h1 className="font-serif text-2xl text-taupe font-medium">
                    Saved Addresses
                  </h1>
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="bg-taupe text-cream px-4 py-2 rounded-md text-sm font-medium hover:bg-taupe/90 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {loadingAddresses ? (
                  <div className="bg-cream border border-sand rounded-xl p-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-taupe mx-auto mb-2" />
                    <p className="text-sm text-taupe/70">Loading saved addresses...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  /* Empty State */
                  <div className="bg-cream border border-sand rounded-xl p-12 text-center">
                    <MapPin className="w-12 h-12 text-taupe/30 mx-auto mb-3" />
                    <h3 className="font-serif text-lg font-medium text-taupe">
                      No addresses saved yet
                    </h3>
                    <p className="text-xs text-taupe/60 mt-1 max-w-sm mx-auto">
                      Save your delivery address for a faster and smoother checkout experience.
                    </p>
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="inline-flex items-center gap-2 mt-5 bg-taupe text-cream px-5 py-2.5 rounded-md hover:bg-taupe/90 transition text-sm font-medium shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Address</span>
                    </button>
                  </div>
                ) : (
                  /* Address Cards */
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="bg-cream border border-sand rounded-md p-4 mb-3 shadow-2xs relative"
                      >
                        {/* Name + Phone + DEFAULT badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-taupe text-base">
                              {addr.fullName}
                            </span>
                            <span className="text-sm text-taupe/60">
                              • {addr.phone}
                            </span>
                          </div>

                          {addr.isDefault && (
                            <span className="bg-[#FAF3E0] text-[#916B25] border border-gold/40 text-[11px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                              DEFAULT
                            </span>
                          )}
                        </div>

                        {/* Address body */}
                        <p className="whitespace-pre-line text-sm text-taupe/80 mt-2 leading-relaxed">
                          {addr.address}
                        </p>

                        {/* City, State - Pincode */}
                        <p className="text-sm text-taupe/80 mt-1 font-medium">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>

                        {/* Action Buttons: Edit | Delete | Set as Default */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-sand/60">
                          <button
                            type="button"
                            onClick={() => openEditModal(addr)}
                            className="text-sm font-medium text-taupe hover:text-gold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <span className="text-sand">|</span>

                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-sm font-medium text-rose-700 hover:text-rose-900 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>

                          {!addr.isDefault && (
                            <>
                              <span className="text-sand">|</span>
                              <button
                                type="button"
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-sm font-medium text-taupe/70 hover:text-taupe transition-colors cursor-pointer"
                              >
                                Set as Default
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ================= MODAL FOR ADD/EDIT ADDRESS ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-cream border border-sand rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-xl animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-sand">
              <h3 className="font-serif text-xl font-medium text-taupe">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-taupe/60 hover:text-taupe transition p-1 rounded-md hover:bg-beige/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAddress} className="space-y-4 mt-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-taupe mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={modalForm.fullName}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder="e.g. Fatima Shaikh"
                  className="w-full px-3.5 py-2.5 bg-white border border-sand rounded-md text-sm text-taupe focus:outline-hidden focus:border-taupe transition"
                />
                {modalErrors.fullName && (
                  <p className="text-xs text-rose-600 mt-1">{modalErrors.fullName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-taupe mb-1">
                  Phone Number (10 digits) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={modalForm.phone}
                  onChange={(e) =>
                    setModalForm((prev) => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 bg-white border border-sand rounded-md text-sm text-taupe focus:outline-hidden focus:border-taupe transition"
                />
                {modalErrors.phone && (
                  <p className="text-xs text-rose-600 mt-1">{modalErrors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-taupe mb-1">
                  Address (House/Flat, Building, Street) <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={modalForm.address}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="e.g. Flat 402, Al-Noor Apartments, MG Road"
                  className="w-full px-3.5 py-2.5 bg-white border border-sand rounded-md text-sm text-taupe focus:outline-hidden focus:border-taupe transition"
                />
                {modalErrors.address && (
                  <p className="text-xs text-rose-600 mt-1">{modalErrors.address}</p>
                )}
              </div>

              {/* City + State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-taupe mb-1">
                    City <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalForm.city}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="e.g. Mumbai"
                    className="w-full px-3.5 py-2.5 bg-white border border-sand rounded-md text-sm text-taupe focus:outline-hidden focus:border-taupe transition"
                  />
                  {modalErrors.city && (
                    <p className="text-xs text-rose-600 mt-1">{modalErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-taupe mb-1">
                    State <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={modalForm.state}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, state: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-sand rounded-md text-sm text-taupe focus:outline-hidden focus:border-taupe transition"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {modalErrors.state && (
                    <p className="text-xs text-rose-600 mt-1">{modalErrors.state}</p>
                  )}
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-medium text-taupe mb-1">
                  Pincode (6 digits) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={modalForm.pincode}
                  onChange={(e) =>
                    setModalForm((prev) => ({
                      ...prev,
                      pincode: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  placeholder="e.g. 400001"
                  className="w-full px-3.5 py-2.5 bg-white border border-sand rounded-md text-sm text-taupe focus:outline-hidden focus:border-taupe transition"
                />
                {modalErrors.pincode && (
                  <p className="text-xs text-rose-600 mt-1">{modalErrors.pincode}</p>
                )}
              </div>

              {/* Set as default toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={modalForm.isDefault}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-sand text-taupe focus:ring-taupe accent-taupe"
                  />
                  <span className="text-sm text-taupe font-medium">
                    Set as default delivery address
                  </span>
                </label>
              </div>

              {/* Cancel + Save buttons */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-sand">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={savingAddress}
                  className="px-4 py-2 border border-sand rounded-md text-taupe hover:bg-beige/60 text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="px-5 py-2 bg-taupe text-cream rounded-md hover:bg-taupe/90 text-sm font-medium transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {savingAddress && <Loader2 className="w-4 h-4 animate-spin text-cream" />}
                  <span>{editingAddress ? "Update Address" : "Save Address"}</span>
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
        <div className="min-h-screen bg-cream flex flex-col justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-taupe" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
