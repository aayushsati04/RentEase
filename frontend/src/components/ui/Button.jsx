import React from 'react';

const sizeMap = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

const variantMap = {
  primary: `bg-primary-600 hover:bg-primary-500 text-white shadow-lg
             hover:shadow-glow hover:-translate-y-0.5`,
  secondary: `glass text-white hover:bg-white/10 hover:-translate-y-0.5`,
  ghost: `text-slate-300 hover:text-white hover:bg-white/5`,
  danger: `bg-red-600/80 hover:bg-red-500 text-white hover:-translate-y-0.5`,
  outline: `border border-primary-500/50 text-primary-400 hover:bg-primary-500/10
            hover:border-primary-400 hover:-translate-y-0.5`,
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200 active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${sizeMap[size]}
        ${variantMap[variant]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing...
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
