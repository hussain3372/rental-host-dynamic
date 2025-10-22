"use client";
import Image from "next/image";
import React, { useState } from "react";
import Dropdown from "@/app/shared/InputDropDown";



type TimeOutProps = {
  // initialEmail: string;
  onClose: () => void;
  onVerify: () => void;
};

export default function TimeOutDrawer({  onVerify }: TimeOutProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const timeoutOptions = [
    { label: "10 minutes", value: "10min" },
    { label: "20 minutes", value: "20min" },
    { label: "30 minutes", value: "30min" }
  ];

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
  };

  const dropdownItems = timeoutOptions.map(option => ({
    label: option.label,
    onClick: () => handleOptionSelect(option.value),
    disabled: false
  }));

  const getDisplayText = () => {
    return selectedOption
      ? timeoutOptions.find(opt => opt.value === selectedOption)?.label
      : "Select timeout";
  };

  return (
    <div className="h-full flex flex-col justify-between text-white">
      {/* Top content */}
      <div>
        <h2 className="font-medium text-[20px] leading-[24px] mb-3">Set Session Timeout</h2>
        <p className="font-regular leading-5 text-[16px] text-[#FFFFFF99]">
          Define how long your account remains active during inactivity. After this time, you&apos;ll be logged out automatically to ensure security.
        </p>

        <div className="mt-10">
          <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px]">Session timeout</label>

          {/* Custom Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full h-[46px] bg-[#1a1a1a] text-sm rounded-md pl-3 pr-10 border border-[#2b2b2b] 
                        focus:outline-none transition-colors duration-200 hover:border-gray-500 text-left ${
                          selectedOption ? "text-white" : "text-white/40"
                        }`}
            >
              {getDisplayText()}
            </button>
            <Image
              src="/images/dropdown.svg"
              alt="dropdown"
              height={20}
              width={20}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            />

            {/* Global Dropdown Component */}
            <Dropdown
              items={dropdownItems}
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
            />
          </div>
        </div>
      </div>
      <button onClick={onVerify} className="yellow-btn w-full py-4 text-black">Save Changes</button>
    </div>
  );
}