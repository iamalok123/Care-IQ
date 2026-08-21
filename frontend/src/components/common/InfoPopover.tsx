import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';

export interface InfoDetailItem {
  label: string;
  value: React.ReactNode;
}

export interface InfoPopoverProps {
  title?: string;
  content: React.ReactNode;
  details?: InfoDetailItem[];
  variant?: 'default' | 'teal' | 'amber' | 'indigo' | 'emerald';
  size?: 'xs' | 'sm' | 'md';
  buttonLabel?: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({
  title,
  content,
  details,
  variant = 'default',
  size = 'sm',
  buttonLabel,
  align = 'right',
  className = '',
  action
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 320
  });

  // Calculate and clamp coordinates to viewport
  const updateCoordinates = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(340, window.innerWidth - 24);

    // Horizontal alignment & viewport clamping
    let left =
      align === 'left'
        ? rect.left
        : align === 'center'
        ? rect.left + rect.width / 2 - popoverWidth / 2
        : rect.right - popoverWidth;

    if (left < 12) left = 12;
    if (left + popoverWidth > window.innerWidth - 12) {
      left = window.innerWidth - popoverWidth - 12;
    }

    // Vertical alignment: prefer below, flip above if not enough space
    const estimatedHeight = 260;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top = rect.bottom + 6;
    if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
      top = Math.max(12, rect.top - estimatedHeight - 6);
    }

    setPosition({ top, left, width: popoverWidth });
  };

  useEffect(() => {
    if (!isOpen) return;

    updateCoordinates();

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleScrollOrResize = () => {
      updateCoordinates();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, align]);

  // Variant color configs
  const variantStyles = {
    default: {
      button: 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-slate-200',
      activeButton: 'text-slate-800 bg-slate-100 border-slate-300 ring-2 ring-slate-400/20',
      header: 'bg-slate-50 text-slate-800 border-slate-100',
      icon: 'text-slate-500'
    },
    teal: {
      button: 'text-teal-600 hover:text-teal-800 hover:bg-teal-50 border-teal-200/80',
      activeButton: 'text-teal-800 bg-teal-100 border-teal-300 ring-2 ring-teal-500/20',
      header: 'bg-teal-50/80 text-teal-950 border-teal-100',
      icon: 'text-teal-600'
    },
    amber: {
      button: 'text-amber-600 hover:text-amber-800 hover:bg-amber-50 border-amber-200/80',
      activeButton: 'text-amber-800 bg-amber-100 border-amber-300 ring-2 ring-amber-500/20',
      header: 'bg-amber-50/80 text-amber-950 border-amber-100',
      icon: 'text-amber-600'
    },
    indigo: {
      button: 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border-indigo-200/80',
      activeButton: 'text-indigo-800 bg-indigo-100 border-indigo-300 ring-2 ring-indigo-500/20',
      header: 'bg-indigo-50/80 text-indigo-950 border-indigo-100',
      icon: 'text-indigo-600'
    },
    emerald: {
      button: 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200/80',
      activeButton: 'text-emerald-800 bg-emerald-100 border-emerald-300 ring-2 ring-emerald-500/20',
      header: 'bg-emerald-50/80 text-emerald-950 border-emerald-100',
      icon: 'text-emerald-600'
    }
  };

  const style = variantStyles[variant];

  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 16
  };

  const buttonSizes = {
    xs: 'p-0.5 text-[10px]',
    sm: 'p-1 text-xs',
    md: 'p-1.5 text-xs'
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1 rounded-full border transition-all cursor-pointer select-none ${
          isOpen ? style.activeButton : style.button
        } ${buttonSizes[size]}`}
        title={title || 'Click to view details'}
        aria-label={title || 'Information'}
        aria-expanded={isOpen}
      >
        <Info size={iconSizes[size]} className="shrink-0" />
        {buttonLabel && <span className="font-bold pr-1">{buttonLabel}</span>}
      </button>

      {/* Viewport-Anchored High Z-Index Portal Popover */}
      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              zIndex: 9999
            }}
            className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] animate-fade-in text-left overflow-hidden select-text"
          >
            {/* Header */}
            <div className={`px-3.5 py-2.5 border-b flex items-center justify-between gap-2 ${style.header}`}>
              <div className="flex items-center gap-1.5 min-w-0">
                <Info size={14} className={`shrink-0 ${style.icon}`} />
                <span className="font-extrabold text-xs tracking-tight truncate">
                  {title || 'Information & Details'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={13} />
              </button>
            </div>

            {/* Body Content */}
            <div className="p-3.5 max-h-72 overflow-y-auto space-y-2.5">
              <div className="text-xs text-slate-600 leading-relaxed font-normal">
                {content}
              </div>

              {/* Structured Details Table / List if provided */}
              {details && details.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  {details.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                      <span className="text-slate-500 font-medium shrink-0">{item.label}:</span>
                      <span className="font-bold text-slate-800 text-right truncate max-w-44">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Action if provided */}
            {action && (
              <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    action.onClick();
                  }}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                >
                  {action.label} →
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default InfoPopover;
