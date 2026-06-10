import React from 'react';

const colorMap = {
  primary:  'bg-primary-500/20 text-primary-300 border border-primary-500/30',
  violet:   'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  emerald:  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  amber:    'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  sky:      'bg-sky-500/20 text-sky-300 border border-sky-500/30',
  rose:     'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  orange:   'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  pink:     'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  gold:     'bg-amber-400/20 text-amber-300 border border-amber-400/30',
};

export default function Badge({ children, color = 'primary', className = '', dot = false }) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
      ${colorMap[color] ?? colorMap.primary}
      ${className}
    `}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse`} />
      )}
      {children}
    </span>
  );
}
