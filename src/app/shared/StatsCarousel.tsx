"use client";
import React from "react";
import Image from "next/image";

interface StatItem {
  id: string;
  text: string;
  icon: string; 
}
const stats: StatItem[] = [
  { id: "locations", text: "Trusted by property seekers across 50+ locations", icon: "/images/caraousel.png" },
  { id: "experience", text: "No hosting experience required", icon: "/images/caraousel.png" },
  { id: "owners", text: "Chosen by 10,000+ property owners", icon: "/images/caraousel.png" },
];

const StatsCarousel = () => {
  return (
    <div className="w-full max-w-[1320px] mx-auto overflow-hidden pt-[17px] pb-[15px] bg-black">
      <div
        className="flex gap-12 animate-scroll whitespace-nowrap"
      >
        
        {stats.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-2 text-gray-400 text-sm min-w-max"
          >
            <Image
              src={item.icon}
              alt={item.text}
              width={24}
              height={24}
              className="object-contain"
            />
            <span className="leading-[24px] text-[20px] font-medium">{item.text}</span>
          </div>
        ))}

        {stats.map((item) => (
          <div
            key={`${item.id}-duplicate`}
            className="flex items-center space-x-2 text-gray-400 text-sm min-w-max"
          >
            <Image
              src={item.icon}
              alt={item.text}
              width={24}
              height={24}
              className="object-contain"
            />
            <span className="leading-[24px] text-[20px] font-medium">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCarousel;
