'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
}

export default function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  className,
}: TooltipProps) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  let timeoutId: NodeJS.Timeout;

  const updatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    if (position === 'top') {
      top = rect.top;
      left = rect.left + rect.width / 2;
    } else if (position === 'bottom') {
      top = rect.bottom;
      left = rect.left + rect.width / 2;
    } else if (position === 'left') {
      top = rect.top + rect.height / 2;
      left = rect.left;
    } else if (position === 'right') {
      top = rect.top + rect.height / 2;
      left = rect.right;
    }

    setCoords({ top, left });
  };

  const showTooltip = () => {
    timeoutId = setTimeout(() => {
      updatePosition();
      setMounted(true);
      setTimeout(() => setActive(true), 10);
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutId);
    setActive(false);
  };

  useEffect(() => {
    if (!active && mounted) {
      const timer = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(timer);
    }
  }, [active, mounted]);

  useEffect(() => {
    if (mounted) {
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [mounted]);

  const positionTransforms = {
    top: '-translate-x-1/2 -translate-y-full mb-2 flex flex-col items-center',
    bottom: '-translate-x-1/2 mt-2 flex flex-col items-center',
    left: '-translate-x-full -translate-y-1/2 mr-2 flex items-center justify-end',
    right: 'ml-2 -translate-y-1/2 flex items-center justify-start',
  };

  const arrowClasses = {
    top: 'border-t-border border-x-transparent border-b-transparent bottom-[-6px] left-1/2 -translate-x-1/2 border-t-6 border-x-6',
    bottom:
      'border-b-border border-x-transparent border-t-transparent top-[-6px] left-1/2 -translate-x-1/2 border-b-6 border-x-6',
    left: 'border-l-border border-y-transparent border-r-transparent right-[-6px] top-1/2 -translate-y-1/2 border-l-6 border-y-6',
    right:
      'border-r-border border-y-transparent border-l-transparent left-[-6px] top-1/2 -translate-y-1/2 border-r-6 border-y-6',
  };

  const arrowInnerClasses = {
    top: 'border-t-popover border-x-transparent border-b-transparent bottom-[-4px] left-1/2 -translate-x-1/2 border-t-6 border-x-6',
    bottom:
      'border-b-popover border-y-transparent border-t-transparent top-[-4px] left-1/2 -translate-x-1/2 border-b-6 border-x-6',
    left: 'border-l-popover border-y-transparent border-r-transparent right-[-4px] top-1/2 -translate-y-1/2 border-l-6 border-y-6',
    right:
      'border-r-popover border-y-transparent border-l-transparent left-[-4px] top-1/2 -translate-y-1/2 border-r-6 border-y-6',
  };

  return (
    <div
      ref={triggerRef}
      className="flex-1 block w-full"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {mounted &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className={clsx(
              'z-99 pointer-events-none transition-all duration-150 ease-out',
              positionTransforms[position],
              active ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
              className,
            )}
            role="tooltip"
          >
            <div className="relative px-3 py-1.5 text-xs font-medium tracking-wide shadow-md border rounded-md bg-popover text-popover-foreground border-border whitespace-nowrap">
              {content}
            </div>

            <div
              className={clsx(
                'absolute w-0 h-0 border-solid',
                arrowClasses[position],
              )}
            />
            <div
              className={clsx(
                'absolute w-0 h-0 border-solid',
                arrowInnerClasses[position],
              )}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
