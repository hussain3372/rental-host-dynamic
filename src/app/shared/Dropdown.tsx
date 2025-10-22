"use client";
import React, { useEffect, useRef } from "react";
interface DropdownProps {
  items: { label: string; onClick: () => void; disabled?: boolean }[];
  isOpen?: boolean;
  onClose?: () => void;
}
const Dropdown: React.FC<DropdownProps> = ({
  items,
  isOpen = true,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleItemClick = (item: { onClick: () => void; disabled?: boolean }) => {
    if (!item.disabled) {
      item.onClick();
      onClose?.();
    }
  };

  if (!isOpen) return null;
  return (
    <div
      ref={dropdownRef}
      className="absolute right-23 bottom-0 mb-1 z-50 flex flex-col items-start w-[161px] rounded-[10px] 
                 bg-[radial-gradient(75%_81%_at_50%_18.4%,#202020_0%,#101010_100%)] 
                 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] pt-2"
    >
      {items.map((item, index) => (
        <button
          key={index}
          disabled={item.disabled}
          onClick={() => handleItemClick(item)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-150 ease-out
            ${item.disabled
              ? "text-white/40 opacity-50 cursor-not-allowed"
              : "text-white/90 hover:text-white hover:bg-white/10 cursor-pointer active:scale-[0.98]"
            }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
export default Dropdown;