"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Dropdown from "@/app/shared/InputDropDown";

export default function Status() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Today");
  const dropdownRef = useRef<HTMLDivElement | null>(null); // ref for both button + dropdown

  const handleItemClick = (label: string) => {
    setSelectedLabel(label);
    setShowDropdown(false);
  };

  const dropdownItems = [
    { label: "Today", onClick: () => handleItemClick("Today") },
    { label: "Yesterday", onClick: () => handleItemClick("Yesterday") },
  ];

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const Credentials = [
    {
      id: 1,
      img: "/images/status1.png",
      val: "2300",
      title: "Total Hosts",
      growthPercent: "+8%",
      growthText: "growth compared to last month",
      color: "text-lime-400",
      bgColor: "bg-lime-900/30",
    },
    {
      id: 2,
      img: "/images/status2.png",
      val: "560",
      title: "Total Admins",
      growthPercent: "+2%",
      growthText: "growth compared to last month",
      color: "text-lime-400",
      bgColor: "bg-lime-900/30",
    },
    {
      id: 3,
      img: "/images/status3.png",
      val: "1870",
      title: "Active Certificates",
      growthPercent: "+12%",
      growthText: "increase in certifications last month",
      color: "text-lime-400",
      bgColor: "bg-lime-900/30",
    },
    {
      id: 4,
      img: "/images/revoke.svg",
      val: "670",
      title: "Expired Certificates",
      growthPercent: "-4%",
      growthText: "expired certifications last month",
      color: "text-red-400",
      bgColor: "bg-red-900/30",
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ✅ Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:auto-rows-[132px]">
        {Credentials.map((item) => (
          <div
            key={item.id}
            className="relative group rounded-2xl bg-[#121315] border border-[#1E1F22] p-4  transition-all duration-300 overflow-hidden"
          >
            {/* Icon and Title */}
            <div className="flex justify-between items-center">
              <h3 className="text-[14px] font-normal leading-[18px] text-[#FFFFFFCC] -mt-5">{item.title}</h3>

              {/* ✅ Fixed-size image wrapper */}
              <div className="w-10 h-10 flex justify-center items-center overflow-hidden">
                <Image
                  src={item.img}
                  alt={item.title}
                  width={48}
                  height={48}
                  className="object-contain opacity-80 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            </div>

            {/* Value */}
            <h2 className="text-[24px] leading-7  font-semibold text-white mb-4">
              {item.val}
            </h2>

            {/* Growth Info */}
            <p className="text-xs  flex items-center gap-1 -mt-2">
              <span
                className={`
                  ${item.color} 
                  bg-[rgba(255,255,255,0.08)] 
                  rounded 
                  px-2 
                  py-1 
                  flex 
                  justify-center 
                  items-center 
                  font-semibold 
                  backdrop-blur-sm
                `}
              >
                {item.growthPercent}
              </span>
              <span className="text-[#FFFFFFCC] text-[14px] font-normal leading-[18px]">{item.growthText}</span>
            </p>
          </div>
        ))}
        <div className="lg:col-start-3 lg:row-start-1 lg:row-span-2 rounded-2xl bg-[#121315] border border-[#1E1F22] px-3 pt-5 pb-3 flex flex-col items-start justify-start transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 text-[#FFFFFF99] text-3 leading-4 font-normal "
            >
              {selectedLabel}
              <Image
                src="/images/dropdown.svg"
                alt="Dropdown"
                width={12}
                height={12}
                className="cursor-pointer"
              />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-36">
                <Dropdown items={dropdownItems} />
              </div>
            )}
          </div>

          {/* Revenue Content */}
          <div className="relative z-10 text-start">
            <h2 className="text-[28px] leading-8 font-semibold">
              <span className="text-[#EFFC76]">$ </span>
              <span className="text-white">23,094.57</span>
            </h2>

            <p className="text-[12px] leading-4 font-normal text-[#FFFFFF99] mt-3">
              Revenue compared to last month:{" "}
              <span className="text-[#FF3F3F] font-medium text-[14px] leading-[18px]">-</span>
              <span className="text-white font-medium text-[14px] leading-[18px]">37.16</span>
              <span className="text-[#FFFFFF33] font-medium text-[14px] leading-[18px]">%</span>
            </p>
          </div>

          <div className="relative w-full mt-3 rounded-[12px] border-[#FFFFFF14] overflow-hidden z-0 pb-12">
            <video autoPlay loop muted className="w-full h-43 object-cover">
              <source src="/videos/home.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 z-20">
              <Image
                src="/images/animation-status.png"
                alt="Revenue"
                width={189}
                height={189}
                className="animate-[spinFan_6s_linear_infinite] transition-all duration-300"
              />
            </div>
          </div>

          <style jsx>{`
            @keyframes spinFan {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
