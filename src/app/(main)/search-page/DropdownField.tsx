"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

type DropdownFieldProps = {
  icon: string;
  label: string;
  options: string[];
  onSelect?: (value: string) => void;
};

const DropdownField: React.FC<DropdownFieldProps> = ({ icon, label, options, onSelect }) => {
  const [selected, setSelected] = useState(label);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    setSelected(option);
    setOpen(false);
    if (onSelect) onSelect(option);
  };

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-[14px] w-full sm:w-auto bg-[#18191B] text-white rounded-lg p-[14px] cursor-pointer border border-[#2A2B2E]"
      >
        <div className="flex items-center">
          <Image src={icon} alt={label} width={28} height={28} className="mr-2" />
          <span className="text-[16px]">{selected}</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-400 ml-2 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div className="absolute left-0 mt-2 w-full sm:w-[220px] bg-[#18191B] border border-[#2A2B2E] rounded-lg shadow-lg z-[1000]">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option)}
              className="px-4 py-2 hover:bg-[#2A2B2E] cursor-pointer text-[15px]"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownField;