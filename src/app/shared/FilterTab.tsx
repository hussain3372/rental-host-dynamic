"use client";

import Image from "next/image";
import React from "react";

interface FilterTabProps {
  label: string;
  icon?: string;
  className?: string; // allow external classes
  onClick?: () => void;
}

const FilterTab: React.FC<FilterTabProps> = ({ label, icon, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-[10px] py-2 rounded-md border border-[#2A2B2E]
                 bg-[#0A0C0B] text-white font-medium transition cursor-pointer
                 hover:bg-[#2A2B2E]
                 ${className || ""}`} // <-- apply external className here
    >
      {icon && (
        <Image
          src={icon}
          alt={label}
          width={24}
          height={24}
          className="object-contain"
        />
      )}
      <span>{label}</span>
    </button>
  );
};

export default FilterTab;
