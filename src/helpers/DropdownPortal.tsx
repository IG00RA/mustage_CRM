import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DropdownPortalProps {
  children: React.ReactNode;
  anchorRef: React.RefObject<HTMLElement>;
  isOpen: boolean;
}

export const DropdownPortal: React.FC<DropdownPortalProps> = ({
  children,
  anchorRef,
  isOpen,
}) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current && isOpen) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY + rect.height / 2,
        left: rect.left + window.scrollX + 60,
      });
    }
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'absolute',
        cursor: 'pointer',
        left: coords.left,
        top: coords.top,
        background: '#fff',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0px 4px 16px rgba(145, 158, 171, 0.24)',
        zIndex: 1000,
        transform: 'translateY(-50%) translateX(10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        fontSize: '14px',
        fontWeight: 600,
        color: '#5671ff',
      }}
    >
      {children}
    </div>,
    document.body
  );
};
