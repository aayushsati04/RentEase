import React from 'react';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizeMap[size]} ${className}`}>
      <svg className="animate-spin w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10"
          stroke="currentColor" strokeWidth="3" />
        <path className="opacity-80" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 gap-6">
      {/* Animated logo */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary-500/30 rounded-2xl blur-xl animate-pulse" />
        <div className="relative glass rounded-2xl p-5">
          <div className="text-3xl font-black gradient-text-brand">RE</div>
        </div>
      </div>

      {/* Spinner */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <p className="text-slate-400 text-sm tracking-widest uppercase">Loading RentEase</p>
    </div>
  );
}

export default LoadingSpinner;
