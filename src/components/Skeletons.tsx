import React from "react";

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export const MediaCardSkeleton = () => (
  <div className="flex-shrink-0 w-48 md:w-64 space-y-4">
    <Skeleton className="aspect-[2/3] w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
  </div>
);

export const SectionSkeleton = () => (
  <div className="py-12 px-6 md:px-16">
    <Skeleton className="h-8 w-48 mb-8" />
    <div className="flex gap-6 overflow-hidden">
      {[1, 2, 3, 4, 5].map(i => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
