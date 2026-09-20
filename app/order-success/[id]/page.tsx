"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getOrderById, Order } from "@/lib/orders-firestore";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    async function fetchOrder() {
      try {
        const fetchedOrder = await getOrderById(orderId);
        if (fetchedOrder) {
          setOrder(fetchedOrder);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-taupe">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-gold mb-4" />
          <p className="font-serif text-xl text-taupe">
            Loading your order confirmation...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-taupe">
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl text-taupe mb-3">Order Not Found</h1>
          <p className="text-sm text-taupe/70 mb-8">
            We couldn&apos;t find the order details for this reference. If you believe this is an error, please check your account.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/shop"
              className="bg-taupe text-cream px-6 py-3 rounded-md hover:bg-gold transition font-medium text-sm"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="border border-taupe text-taupe px-6 py-3 rounded-md hover:bg-taupe hover:text-cream transition font-medium text-sm"
            >
              View My Account
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const shortId = order.id.slice(-6).toUpperCase();
  const customerName =
    order.address?.fullName || order.customerName || "Customer";

  const itemsText = (order.items || [])
    .map(
      (i) =>
        `• ${i.name} (${i.size}, ${i.color}) x${i.qty} = ₹${
          (i.price || 0) * (i.qty || 1)
        }`
    )
    .join("\n");

  const formattedAddress = order.address
    ? order.address.address ||
      `${order.address.line1 || ""}${order.address.line2 ? ", " + order.address.line2 : ""}`
    : "";

  const addressText = order.address
    ? `${order.address.fullName}\n${formattedAddress}\n${order.address.city}, ${order.address.state} - ${order.address.pincode}\n📞 ${order.address.phone}`
    : `${customerName}\n📞 ${order.customerPhone || ""}`;

  const message = `Hi ALSayyedah! 🙋\n\nI placed an order on your website.\n\n*Order #ALS${shortId}*\n\n*Items:*\n${itemsText}\n\n*Total: ₹${order.total}*\n*Payment: Cash on Delivery*\n\n*Delivery Address:*\n${addressText}\n\nPlease confirm my order. 🙏`;

  const waUrl = `https://wa.me/919925837795?text=${encodeURIComponent(message)}`;

  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 sm:py-16 w-full text-center">
        {/* Big gold checkmark icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/15 text-gold border-2 border-gold/40 mb-4">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        {/* Order Placed! (serif 4xl) */}
        <h1 className="font-serif text-4xl sm:text-5xl text-taupe font-medium mb-3">
          Order Placed!
        </h1>

        {/* Order #ALS{last 6 uppercase} (font-mono) */}
        <div className="inline-block px-4 py-1.5 bg-beige border border-sand rounded-full font-mono text-sm tracking-wider text-taupe font-semibold mb-3">
          Order #ALS{shortId}
        </div>

        {/* Thank you, {customerName}! */}
        <p className="font-serif text-xl sm:text-2xl text-taupe mb-2">
          Thank you, <span className="text-gold font-semibold">{customerName}</span>!
        </p>

        <p className="font-amiri text-3xl text-gold/80 text-center mt-2" dir="rtl">
          شكراً جزيلاً
        </p>
        <p className="text-center text-taupe/70 text-sm mt-1 mb-6">
          (Thank you so much)
        </p>

        {/* Instructions */}
        <p className="text-sm sm:text-base text-taupe/80 max-w-md mx-auto mb-8 leading-relaxed">
          Please send us your order on WhatsApp so we can confirm it quickly.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-3.5 mb-10 w-full">
          {/* BIG primary button */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 bg-taupe text-cream px-8 py-4 rounded-md text-lg w-full max-w-sm hover:bg-gold transition shadow-md font-medium cursor-pointer"
          >
            <span>📱 Send Order on WhatsApp</span>
          </a>

          {/* Continue Shopping (outline button) */}
          <Link
            href="/shop"
            className="inline-flex items-center justify-center border border-taupe text-taupe px-8 py-3.5 rounded-md text-base w-full max-w-sm hover:bg-taupe hover:text-cream transition font-medium cursor-pointer"
          >
            <span>Continue Shopping</span>
          </Link>

          {/* Small link */}
          <div className="pt-2">
            <Link
              href="/account"
              className="text-xs text-taupe/70 hover:text-gold transition font-medium underline underline-offset-4"
            >
              View all orders
            </Link>
          </div>
        </div>

        {/* Order Summary Card for Reference */}
        <div className="bg-beige border border-sand rounded-xl p-6 text-left space-y-5 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-sand/60">
            <h2 className="font-serif text-lg text-taupe font-medium">
              Order Summary
            </h2>
            <span className="text-xs px-2.5 py-1 bg-cream border border-sand rounded-full text-taupe font-medium uppercase tracking-wider">
              Cash on Delivery
            </span>
          </div>

          {/* Items */}
          <div className="divide-y divide-sand/50">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded bg-sand/30 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-14 rounded bg-sand/30 flex items-center justify-center text-[10px] text-taupe/50 flex-shrink-0">
                      No Img
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-taupe truncate">{item.name}</p>
                    <p className="text-taupe/60 text-[11px] mt-0.5">
                      {item.size} • {item.color} • Qty: {item.qty}
                    </p>
                  </div>
                </div>
                <div className="font-semibold text-taupe pl-2 flex-shrink-0">
                  ₹{((item.price || 0) * (item.qty || 1)).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-sand/60 pt-3 flex justify-between items-baseline text-taupe">
            <span className="font-medium text-sm">Total Amount</span>
            <span className="font-serif text-xl font-bold text-taupe">
              ₹{(order.total || 0).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Address */}
          {order.address && (
            <div className="border-t border-sand/60 pt-3 text-xs text-taupe/80 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-taupe uppercase tracking-wider text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-gold" />
                <span>Delivery Address</span>
              </div>
              <p className="font-medium text-taupe">{order.address.fullName}</p>
              <p className="whitespace-pre-line">
                {order.address.address || (
                  <>
                    {order.address.line1}
                    {order.address.line2 ? `, ${order.address.line2}` : ""}
                  </>
                )}
              </p>
              <p>
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
              <p>Phone: +91 {order.address.phone}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
