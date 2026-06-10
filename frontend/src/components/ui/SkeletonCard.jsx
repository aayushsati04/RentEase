import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Image skeleton */}
      <div className="relative h-52 bg-slate-800/60 shimmer" />

      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        {/* Badge row */}
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-slate-700/60 rounded-full shimmer" />
          <div className="h-5 w-20 bg-slate-700/60 rounded-full shimmer" />
        </div>
        {/* Title */}
        <div className="h-6 w-3/4 bg-slate-700/60 rounded-lg shimmer" />
        {/* Location */}
        <div className="h-4 w-1/2 bg-slate-700/60 rounded-lg shimmer" />
        {/* Meta row */}
        <div className="flex gap-3 pt-1">
          <div className="h-4 w-14 bg-slate-700/60 rounded shimmer" />
          <div className="h-4 w-14 bg-slate-700/60 rounded shimmer" />
          <div className="h-4 w-14 bg-slate-700/60 rounded shimmer" />
        </div>
        {/* Price row */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-700/40">
          <div className="h-7 w-28 bg-slate-700/60 rounded-lg shimmer" />
          <div className="h-9 w-24 bg-slate-700/60 rounded-xl shimmer" />
        </div>
      </div>
    </div>
  );
}
