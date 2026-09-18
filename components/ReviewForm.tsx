"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createReview } from "@/lib/reviews-firestore";

interface ReviewFormProps {
  productId: string;
  productSlug: string;
  productName: string;
}

export default function ReviewForm({
  productId,
  productSlug,
  productName,
}: ReviewFormProps) {
  const { user, loading: authLoading } = useAuth();

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating <= 0 || !comment.trim()) {
      setError("Please select a rating and write a review");
      return;
    }

    if (!user) {
      setError("Please login to submit a review");
      return;
    }

    setSubmitting(true);
    try {
      await createReview({
        productId,
        productSlug,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        userPhoto: user.photoURL || undefined,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      });

      setSubmitted(true);
      setRating(0);
      setTitle("");
      setComment("");
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Not logged in prompt
  if (!user) {
    return (
      <div className="bg-beige rounded-md p-6 text-center border border-sand/60">
        <h3 className="font-serif text-lg text-taupe">
          Want to write a review?
        </h3>
        <p className="text-sm text-taupe/70 mt-1 font-sans">
          Please login to share your experience with {productName}
        </p>
        <div className="mt-4">
          <Link
            href="/login"
            className="inline-block bg-taupe text-cream px-4 py-2 rounded-md text-sm font-medium hover:bg-gold transition-colors shadow-2xs"
          >
            Login to Review
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-beige rounded-md p-6 border border-sand/60">
      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-5 text-center space-y-1">
          <h4 className="font-medium text-green-800 font-sans">
            Thank you for your review!
          </h4>
          <p className="text-sm text-green-700 font-sans">
            It will appear on the product page shortly.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-xs text-green-800 underline hover:text-green-950 mt-3 inline-block cursor-pointer"
          >
            Write another review
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-serif text-xl text-taupe">Write a Review</h3>

          {/* Rating Selector */}
          <div>
            <label className="text-sm font-medium text-taupe block mb-1.5">
              Your Rating *
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-taupe hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        active
                          ? "text-gold fill-gold"
                          : "text-sand stroke-taupe/40"
                      }`}
                    />
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="text-xs text-taupe/70 font-medium ml-2">
                  {rating} / 5
                </span>
              )}
            </div>
          </div>

          {/* Title Input (Optional) */}
          <div>
            <label className="text-sm font-medium text-taupe block mb-1.5">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Great quality!"
              className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe placeholder:text-taupe/40 focus:border-gold focus:outline-none text-sm font-sans transition-colors"
            />
          </div>

          {/* Comment Textarea (Required) */}
          <div>
            <label className="text-sm font-medium text-taupe block mb-1.5">
              Your Review *
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe placeholder:text-taupe/40 focus:border-gold focus:outline-none text-sm font-sans resize-y transition-colors"
              required
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-taupe text-cream py-2.5 rounded-md hover:bg-gold transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>

            <p className="text-xs text-taupe/60 mt-2 text-center">
              Your review will appear shortly
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
