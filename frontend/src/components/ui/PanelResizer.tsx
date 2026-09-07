'use client';

import { useRef, useState } from 'react';

interface PanelResizerProps {
  edge: 'left' | 'right' | 'top' | 'bottom';
  tooltipSide: 'left' | 'right' | 'top' | 'bottom'; // Added top/bottom tooltip support
  isDragging: boolean;
  isCollapsed: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  onToggleCollapse: () => void;
  offset?: number;
}

export default function PanelResizer({
  edge,
  tooltipSide,
  isDragging,
  isCollapsed,
  onDragStart,
  onToggleCollapse,
  offset,
}: PanelResizerProps) {
  const [hovered, setHovered] = useState(false);
  
  // Track both axes for click-vs-drag threshold validation
  const startX = useRef(0);
  const startY = useRef(0);
  const dragged = useRef(false);

  const isVertical = edge === 'top' || edge === 'bottom';

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    dragged.current = false;
    onDragStart(e);

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaX = Math.abs(ev.clientX - startX.current);
      const deltaY = Math.abs(ev.clientY - startY.current);
      // Trigger drag state if moved more than 3px on either axis
      if (deltaX > 3 || deltaY > 3) {
        dragged.current = true;
      }
    };

    const handleMouseUp = () => {
      if (!dragged.current) onToggleCollapse();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 1. Dynamic class names based on orientation
  const cursorClass = isVertical ? 'cursor-row-resize' : 'cursor-col-resize';
  
  const sizeClasses = isVertical 
    ? 'w-full h-3 -my-1.5 flex flex-col items-center justify-center' // Horizontal bar
    : 'h-full w-3 -mx-1.5 flex items-center justify-center';        // Vertical bar

  const lineClasses = isVertical
    ? `w-full h-0.5 transition-all duration-200 ${
        isDragging ? 'bg-primary shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-border group-hover/resizer:bg-primary/50'
      }`
    : `h-full w-0.5 transition-all duration-200 ${
        isDragging ? 'bg-primary shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-border group-hover/resizer:bg-primary/50'
      }`;

  // 2. Compute absolute boundary styles based on edge and offset layout rules
  const getPositionStyles = (): React.CSSProperties => {
    if (offset !== undefined) {
      return isVertical ? { top: offset } : { left: offset };
    }
    
    switch (edge) {
      case 'top': return { top: 0, left: 0, right: 0 };
      case 'bottom': return { bottom: 0, left: 0, right: 0 };
      case 'left': return { left: 0, top: 0, bottom: 0 };
      case 'right': return { right: 0, top: 0, bottom: 0 };
    }
  };

  // 3. Compute dynamic tooltip placements
  const getTooltipClasses = () => {
    switch (tooltipSide) {
      case 'left': return 'right-full mr-3 top-1/2 -translate-y-1/2';
      case 'right': return 'left-full ml-3 top-1/2 -translate-y-1/2';
      case 'top': return 'bottom-full mb-3 left-1/2 -translate-x-1/2';
      case 'bottom': return 'top-full mt-3 left-1/2 -translate-x-1/2';
    }
  };

  // 4. Compute animation classes for position shifts
  const transitionClass = !isDragging && offset !== undefined
    ? isVertical ? 'transition-[top] duration-200' : 'transition-[left] duration-200'
    : '';

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={getPositionStyles()}
      className={`absolute z-50 group/resizer ${cursorClass} ${sizeClasses} ${transitionClass}`}
    >
      {/* Resizer Visual Indicator Line */}
      <div className={lineClasses} />

      {/* Popover Tooltip */}
      {(hovered || isDragging) && (
        <div
          className={`absolute bg-popover border border-border rounded-lg shadow-xl px-3 py-2 whitespace-nowrap pointer-events-none z-50 ${getTooltipClasses()}`}
        >
          <div className="text-xs font-semibold text-foreground">
            {isCollapsed ? 'Click to expand' : 'Click to collapse'}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Drag to resize
          </div>
        </div>
      )}
    </div>
  );
}
