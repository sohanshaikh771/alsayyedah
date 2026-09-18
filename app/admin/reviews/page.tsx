"use client";

import React, { useState, useEffect } from "react";
import { Star, Loader2, Trash2 } from "lucide-react";
import {
  listenAllReviews,
  updateReview,
  deleteReview,
  Review,
} from "@/lib/reviews-firestore";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");

  useEffect(() => {
    const unsubscribe = listenAllReviews((data) => {
      setReviews(data);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateReview(id, { approved: true });
    } catch (err) {
      console.error("Failed to approve review:", err);
    }
  };

  const handleUnapprove = async (id: string) => {
    try {
      await updateReview(id, { approved: false });
    } catch (err) {
      console.error("Failed to unapprove review:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview(id);
    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.approved).length;
  const approvedCount = reviews.filter((r) => r.approved).length;

  const emptyMessage =
    filter === "pending"
      ? "No pending reviews"
      : filter === "approved"
      ? "No approved reviews"
      : "No reviews yet";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-taupe tracking-wide">Reviews</h1>
        <p className="text-sm text-taupe/60 mt-1 font-sans">
          Manage customer reviews and moderation
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("pending")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            filter === "pending"
              ? "bg-taupe text-cream"
              : "border border-sand text-taupe hover:bg-beige"
          }`}
        >
          Pending ({pendingCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter("approved")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            filter === "approved"
              ? "bg-taupe text-cream"
              : "border border-sand text-taupe hover:bg-beige"
          }`}
        >
          Approved ({approvedCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            filter === "all"
              ? "bg-taupe text-cream"
              : "border border-sand text-taupe hover:bg-beige"
          }`}
        >
          All ({reviews.length})
        </button>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-taupe space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <p className="font-serif text-base">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-16 text-center bg-cream border border-sand rounded-md">
          <p className="font-serif text-lg text-taupe">{emptyMessage}</p>
          <p className="text-xs text-taupe/60 mt-1">
            Reviews submitted by customers will appear here for moderation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => {
            const dateStr = review.createdAt?.toDate
              ? review.createdAt.toDate().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Recent";

            return (
              <div
                key={review.id}
                className="bg-cream border border-sand rounded-md p-4 space-y-3 shadow-2xs"
              >
                {/* Top row: Avatar, userName + date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {review.userPhoto ? (
                      <img
                        src={review.userPhoto}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover border border-sand"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-sand/60 text-taupe flex items-center justify-center font-serif font-bold text-sm border border-sand">
                        {review.userName
                          ? review.userName.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-sm text-taupe block">
                        {review.userName || "Anonymous Customer"}
                      </span>
                      <span className="text-xs text-taupe/60">
                        On: <strong className="font-normal text-taupe/80">{review.productSlug}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-taupe/60">{dateStr}</span>
                  </div>
                </div>

                {/* Star rating */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? "text-gold fill-gold"
                          : "text-sand stroke-sand"
                      }`}
                    />
                  ))}
                </div>

                {/* Title */}
                {review.title && (
                  <h4 className="font-medium text-sm text-taupe mt-2">
                    {review.title}
                  </h4>
                )}

                {/* Comment */}
                <p className="text-sm text-taupe/80 font-sans leading-relaxed mt-1">
                  {review.comment}
                </p>

                {/* Images row */}
                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {review.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Review attachment ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded border border-sand bg-sand/30"
                      />
                    ))}
                  </div>
                )}

                {/* Bottom row: Approval badge & Action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-sand/60">
                  <div>
                    {review.approved ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!review.approved ? (
                      <button
                        type="button"
                        onClick={() => handleApprove(review.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUnapprove(review.id)}
                        className="border border-sand text-taupe hover:bg-beige px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                      >
                        Unapprove
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(review.id)}
                      className="text-red-600 hover:text-red-700 p-1 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                      title="Delete review"
                      aria-label="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
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
