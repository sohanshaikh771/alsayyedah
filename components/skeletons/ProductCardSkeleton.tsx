import React from "react";

export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse w-full select-none" aria-hidden="true">
      <div className="aspect-[3/4] bg-sand rounded-md shimmer" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-sand rounded shimmer w-3/4" />
        <div className="h-3 bg-sand rounded shimmer w-1/2" />
        <div className="h-4 bg-sand rounded shimmer w-1/3" />
      </div>
    </div>
  );
}
