import React from "react";

export default function ProductCardSkeleton() {
  return (
    <div className="w-full select-none" aria-hidden="true">
      {/* 3:4 Aspect Ratio Image Skeleton */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-sand/40 border border-sand/60 shimmer-effect">
        <div className="absolute inset-0 bg-sand/30" />
      </div>

      {/* Product Details Skeleton */}
      <div className="mt-3.5 space-y-2 text-left">
        {/* Title skeleton */}
        <div className="h-5 w-3/4 rounded-md bg-sand/50 shimmer-effect" />

        {/* Fabric subtitle skeleton */}
        <div className="h-3.5 w-1/2 rounded-md bg-sand/35 shimmer-effect" />

        {/* Price row skeleton */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-5 w-20 rounded-md bg-sand/50 shimmer-effect" />
          <div className="h-3.5 w-14 rounded-md bg-sand/30 shimmer-effect" />
        </div>
      </div>
    </div>
  );
}
