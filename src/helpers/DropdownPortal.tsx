import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DropdownPortalProps {
  children: React.ReactNode;
  anchorRef: React.RefObject<HTMLElement>;
  isCollapsed?: boolean;
  isHovered?: boolean;
}

export const DropdownPortal: React.FC<DropdownPortalProps> = ({
  children,
  anchorRef,
  isCollapsed,
  isHovered,
}) => {
  const [coords, setCoords] = useState({ left: 0 });
  const [visible, setVisible] = useState(true);
  const top = Math.min(window.innerHeight * 0.45, 500);

  useEffect(() => {
    const updatePosition = () => {
      if (window.innerWidth <= 1024) {
        setVisible(false);
        return;
      } else {
        setVisible(true);
      }

      if (anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        const effectiveIsCollapsed = isCollapsed && !isHovered;
        const sidebarWidth = effectiveIsCollapsed ? 104 : 300;

        setCoords(prev => ({
          ...prev,
          left: rect.left + window.scrollX + sidebarWidth,
        }));
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [anchorRef, isCollapsed, isHovered]);

  if (!visible) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        cursor: 'pointer',
        left: `${coords.left}px`,
        top: `${top}px`,
        zIndex: 1000,
        transition: 'left 0.3s ease',
      }}
    >
      {children}
    </div>,
    document.body
  );
};
