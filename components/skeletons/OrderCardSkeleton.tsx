import React from "react";

export default function OrderCardSkeleton() {
  return (
    <div
      className="bg-cream border border-sand rounded-md p-5 mb-4 shadow-2xs animate-pulse select-none"
      aria-hidden="true"
    >
      {/* Order Header: ID + Date + Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-sand/60">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-sand rounded shimmer" />
          <div className="h-3 w-40 bg-sand/70 rounded shimmer" />
        </div>
        <div className="h-6 w-28 bg-sand rounded-full shimmer" />
      </div>

      {/* Items Preview */}
      <div className="py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-sand shimmer shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-sand rounded shimmer" />
            <div className="h-3 w-28 bg-sand/60 rounded shimmer" />
          </div>
          <div className="h-4 w-16 bg-sand rounded shimmer shrink-0" />
        </div>
      </div>

      {/* Footer / Total */}
      <div className="flex items-center justify-between pt-3 border-t border-sand/60">
        <div className="h-4 w-24 bg-sand/70 rounded shimmer" />
        <div className="h-5 w-20 bg-sand rounded shimmer" />
      </div>
    </div>
  );
}
