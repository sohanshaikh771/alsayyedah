"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { listenReviewsByProduct, Review } from "@/lib/reviews-firestore";

interface ProductReviewsProps {
  productId: string;
  productSlug: string;
}

export default function ProductReviews({
  productId,
  productSlug,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAll, setShowAll] = useState<boolean>(false);

  useEffect(() => {
    if (!productId) return;

    const unsubscribe = listenReviewsByProduct(productId, (data) => {
      setReviews(data);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [productId]);

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews
        ).toFixed(1)
      : "0";

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="pt-8 border-t border-sand/60">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl text-taupe tracking-wide">
            Customer Reviews
          </h2>
          {totalReviews > 0 && (
            <p className="text-xs text-taupe/60 mt-0.5">
              Verified modest fashion customers
            </p>
          )}
        </div>

        {totalReviews > 0 && (
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="font-serif text-3xl font-medium text-taupe">
                  {averageRating}
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(Number(averageRating))
                          ? "text-gold fill-gold"
                          : "text-sand stroke-sand"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-taupe/60 block mt-0.5">
                Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BODY */}
      {loading ? (
        <div className="py-12 text-center text-taupe/60">
          <p className="font-serif text-sm">Loading customer reviews...</p>
        </div>
      ) : totalReviews === 0 ? (
        /* No reviews yet empty state */
        <div className="bg-beige rounded-md p-8 text-center border border-sand/40">
          <Star className="w-12 h-12 text-taupe/30 mx-auto stroke-1" />
          <h3 className="font-serif text-lg text-taupe mt-3">No reviews yet</h3>
          <p className="text-sm text-taupe/60 mt-1 font-sans">
            Be the first to review this product
          </p>
        </div>
      ) : (
        /* Reviews list */
        <div className="space-y-4">
          <div className="space-y-4">
            {displayedReviews.map((review) => {
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
                  className="border-b border-sand pb-4 last:border-0 space-y-2"
                >
                  {/* Top row */}
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
                          : "C"}
                      </div>
                    )}
                    <span className="font-medium text-sm text-taupe">
                      {review.userName || "Verified Customer"}
                    </span>
                    <span className="text-xs text-taupe/60 ml-auto">
                      {dateStr}
                    </span>
                  </div>

                  {/* Star row */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= review.rating
                            ? "text-gold fill-gold"
                            : "text-sand stroke-taupe/30"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Title (if any) */}
                  {review.title && (
                    <h4 className="font-medium text-sm text-taupe mt-2">
                      {review.title}
                    </h4>
                  )}

                  {/* Comment */}
                  <p className="text-sm text-taupe/80 font-sans leading-relaxed mt-1">
                    {review.comment}
                  </p>

                  {/* Images row (if any) */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Review photo ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-md border border-sand bg-sand/30"
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Show more / show less pagination */}
          {totalReviews > 3 && (
            <div className="pt-2">
              {!showAll ? (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="text-sm text-taupe underline hover:text-gold cursor-pointer transition-colors"
                >
                  Show all {totalReviews} reviews
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  className="text-sm text-taupe underline hover:text-gold cursor-pointer transition-colors"
                >
                  Show less
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
