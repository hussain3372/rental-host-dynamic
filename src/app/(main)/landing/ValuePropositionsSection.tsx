"use client";

import React, { useState } from "react";
import Image from "next/image";
import PropositionsCard from "../../shared/PropositionsCard";
import BlackButton from "../../shared/BlackButton";

const guestData = [
  { text: "Book with confidence", iconSrc: "/images/react.png" },
  { text: "Comfort-ready for families", iconSrc: "/images/react.png" },
  { text: "Clear safety and comfort details", iconSrc: "/images/react.png" },
];

const hostData = [
  { text: "Stand out confidently", iconSrc: "/images/react.png" },
  { text: "More trust, more bookings", iconSrc: "/images/react.png" },
  { text: "Show care through safety", iconSrc: "/images/react.png" },
];

const ValuePropositionsSection = () => {
  const [activeTab, setActiveTab] = useState<"Guests" | "Hosts">("Guests");

  const tabs = [
    { name: "Guests", icon: "/images/value1.svg" },
    { name: "Hosts", icon: "/images/value1.svg" },
  ];

  const currentData = activeTab === "Guests" ? guestData : hostData;

  return (
    <div className="bg-[#121315] container-class text-white py-9 sm:py-[80px] px-[10px] md:px-[23px] lg:px-[120px]">
      <div className="text-center">
        {/* Tabs */}
        <div className="flex justify-center">
          <div
            className="flex items-center justify-center p-1 gap-3 rounded-[16px] 
               bg-[#2D2D2D] shadow-[inset_0_-0.597px_1.314px_-1.125px_rgba(0,0,0,0.44),
                       inset_0_-1.811px_3.984px_-2.25px_rgba(0,0,0,0.4),
                       inset_0_-4.787px_10.531px_-3.375px_rgba(0,0,0,0.32),
                       inset_0_-15px_33px_-4.5px_rgba(0,0,0,0.05),
                       0_0.602px_0.843px_-0.167px_rgba(0,0,0,0.08),
                       0_2.289px_3.204px_-0.333px_rgba(0,0,0,0.14),
                       0_10px_14px_-0.5px_rgba(0,0,0,0.45)]
               mx-auto" 
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name as "Guests" | "Hosts")}
                  className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-[16px] leading-5 font-medium transition
                      ${
                        isActive
                          ? "bg-[#EDFA75] text-black"
                          : "bg-transparent text-white"
                      }`}
                >
                  {isActive && (
                    <Image
                      src={tab.icon}
                      alt={`${tab.name} icon`}
                      width={30}
                      height={30}
                      className=""
                    />
                  )}
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text below Tabs */}
        <div className="sm:py-[60px] py-[27px]">
          <h2 className="text-[20px] md:text-[30px] lg:text-[40px] sm:leading-[25px] md:leading-[30px] font-medium lg:leading-[48px] w-full max-w-[1073px] mx-auto text-center">
            Standout as a trusted host{" "}
            <span className="inline-flex items-center align-middle">
              <Image
                src="/images/value-p1.png"
                alt="Star icon"
                width={52}
                height={52}
                className="sm:w-5 sm:h-5 md:w-[52px] md:h-[52px] lg:w-[52px] lg:h-[52px]"
              />
            </span>{" "}
            with our certifications that helps you earn guests confidence,
            increase your visibility and simplify the{" "}
            <span className="inline-flex items-center align-middle">
              <Image
                src="/images/value-p2.png"
                alt="Legal icon"
                width={60}
                height={40}
                className="sm:w-5 sm:h-5 md:w-[60px] md:h-[40px] lg:w-[60px] lg:h-[40px]"
              />
            </span>{" "}
            legal side of hosting.
          </h2>
        </div>

        {/* Cards Section */}
        <div className="flex flex-wrap justify-center gap-[24px]">
          {currentData.map((item, index) => (
            <PropositionsCard
              key={index}
              text={item.text}
              iconSrc={item.iconSrc}
              iconWidth={56}
              iconHeight={56}
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ValuePropositionsSection;
