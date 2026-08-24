import React from 'react';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  strokeWidth?: number;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'sm',
  className = '',
  strokeWidth = 2.75,
  label
}) => {
  const sizePx =
    typeof size === 'number'
      ? size
      : size === 'xs'
      ? 14
      : size === 'sm'
      ? 16
      : size === 'md'
      ? 20
      : size === 'lg'
      ? 28
      : 36;

  return (
    <div className="inline-flex items-center gap-2" role="status" aria-label={label || 'Loading'}>
      <svg
        className={`animate-spin text-current shrink-0 ${className}`}
        style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeOpacity="0.25"
        />
        <path
          d="M12 2.5 A 9.5 9.5 0 0 1 21.5 12"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
      {label && <span className="text-current font-medium">{label}</span>}
    </div>
  );
};

export default Spinner;
