import React from "react";

export default function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse w-full select-none" aria-hidden="true">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3 w-12 bg-sand rounded shimmer" />
        <div className="h-3 w-3 bg-sand/50 rounded" />
        <div className="h-3 w-16 bg-sand rounded shimmer" />
        <div className="h-3 w-3 bg-sand/50 rounded" />
        <div className="h-3 w-28 bg-sand rounded shimmer" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left Column: Image Skeleton */}
        <div className="space-y-4">
          <div className="aspect-[3/4] w-full rounded-lg bg-sand border border-sand/60 shimmer" />
          {/* Thumbnails row */}
          <div className="flex gap-3">
            <div className="w-20 h-24 rounded-md bg-sand shimmer" />
            <div className="w-20 h-24 rounded-md bg-sand shimmer" />
            <div className="w-20 h-24 rounded-md bg-sand shimmer" />
          </div>
        </div>

        {/* Right Column: Details Skeleton */}
        <div className="space-y-6">
          {/* Category/Fabric Pill */}
          <div className="h-5 w-24 bg-sand rounded-full shimmer" />

          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 bg-sand rounded shimmer w-3/4" />
            <div className="h-8 bg-sand rounded shimmer w-1/2" />
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-28 bg-sand rounded shimmer" />
            <div className="h-5 w-20 bg-sand/60 rounded shimmer" />
          </div>

          {/* Divider */}
          <div className="h-px bg-sand/60 my-6" />

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="h-4 w-20 bg-sand rounded shimmer" />
            <div className="flex gap-2">
              <div className="h-10 w-12 bg-sand rounded-md shimmer" />
              <div className="h-10 w-12 bg-sand rounded-md shimmer" />
              <div className="h-10 w-12 bg-sand rounded-md shimmer" />
              <div className="h-10 w-12 bg-sand rounded-md shimmer" />
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-3">
            <div className="h-4 w-20 bg-sand rounded shimmer" />
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded-full bg-sand shimmer" />
              <div className="h-8 w-8 rounded-full bg-sand shimmer" />
              <div className="h-8 w-8 rounded-full bg-sand shimmer" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <div className="h-12 w-full bg-sand rounded-md shimmer" />
            <div className="h-12 w-full bg-sand/70 rounded-md shimmer" />
          </div>

          {/* Delivery perks row */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-sand/60">
            <div className="h-12 bg-sand/40 rounded-md shimmer" />
            <div className="h-12 bg-sand/40 rounded-md shimmer" />
            <div className="h-12 bg-sand/40 rounded-md shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
