"use client";

import React, { useState ,useEffect } from "react";
import Image from "next/image";
import FilterTab from "@/app/shared/FilterTab";
import Button from "@/app/shared/Button";
import StatsCarousel from "@/app/shared/StatsCarousel";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");

  const handleSearchClick = () => {
    if (searchInput.trim() !== "") {
      router.push(`/search-page?query=${encodeURIComponent(searchInput)}`);
    }
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
    };

    handleResize(); // check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

 

  const filters = [
    { id: "verified", label: "Verified Property", icon: "/images/search-by-property.png" },
    { id: "host", label: "Host Excellence", icon: "/images/search-by-exellence.png" },
    { id: "green", label: "Green Stay", icon: "/images/search-by-stay.png" },
  ];

  return (
    <div className="text-white overflow-hidden container-class w-full">
      {/* Gradient Light Effects */}
      <div className="inset-0 hidden sm:block pointer-events-none container-class">
        <Image
          src="/images/gr1.png"
          alt="gradient"
          width={400}
          height={902}
          className="absolute top-0 left-12 transform-3d"
        />
        <Image
          src="/images/gr2.png"
          alt="gradient"
          width={350}
          height={902}
          className="absolute top-0 left-[20%] -translate-x-1/2"
        />
        <Image
          src="/images/gr3.png"
          alt="gradient"
          width={300}
          height={902}
          className="absolute top-0 left-1/2 -translate-x-1/2"
        />
        <Image
          src="/images/gr4.png"
          alt="gradient"
          width={350}
          height={902}
          className="absolute top-0 right-[30%] translate-x-1/2"
        />
        <Image
          src="/images/gr5.png"
          alt="gradient"
          width={400}
          height={902}
          className="absolute top-0 right-12"
        />
      </div>

      <div className="inset-0 hidden sm:block z-10  overflow-hidden">
        <Image
          src="/images/bg-shape.png"
          alt="Background"
          className="inset-0 absolute !top-5 !h-[892px]"
          fill
          style={{ transform: "translateY(-13px)" }}
        />
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-[14px] ">
        {/* Trust Badge */}
        <div className="mb-8 sm:mb-12 flex flex-wrap items-center justify-center gap-2 bg-[#121315] rounded-full py-2 px-4 sm:px-[12px] border border-gray-700">
          <div className="flex -space-x-4">
            <Image
              src="/images/hero1.png"
              alt="User avatar"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover z-40 relative"
            />
            <Image
              src="/images/hero2.png"
              alt="User avatar"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover z-30 relative"
            />
            <Image
              src="/images/hero3.png"
              alt="User avatar"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover z-20 relative"
            />
            <Image
              src="/images/hero4.png"
              alt="User avatar"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover z-10 relative"
            />
          </div>
          <span className="leading-[20px] text-[14px] sm:text-[16px] font-medium text-[#FFFFFF99]">
            Trusted by <span className="text-white font-semibold">1600+</span> Hosts
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-8 bg-gradient-to-r from-white/40 via-white to-white/40 bg-clip-text">
          <h1 className="text-[32px] sm:text-[40px] md:text-[56px] text-transparent font-medium leading-tight mb-4 sm:mb-6 w-full max-w-[835px] ">
            Build Trust. Get Certified. Grow Your Hosting Business.
          </h1>
          <p className="text-white opacity-60 text-[16px] sm:text-[20px] md:text-[24px] leading-[26px] sm:leading-[30px] md:leading-[32px] mx-auto w-full max-w-[716px] font-normal px-3 sm:px-[0px]">
            Experience the perfect blend of credibility, trust, and recognition.
          </p>
        </div>

        {/* Search Bar */}
        <div
          className="w-full max-w-[336px] md:max-w-[700px] lg:max-w-[860px] sm:h-[220px] md:h-[273px] lg:h-auto 
        bg-[#0A0C0B] rounded-[16px] sm:rounded-[24px] relative p-4 sm:px-8"
        >
          <input
            type="text"
            placeholder={
              isMobile
                ? "Search properties..." // short placeholder for sm
                : "Search for certified and verified properties..." // long placeholder for md & lg
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-[140px] max-w-[828px] px-6 py-4 outline-none 
          text-[18px] leading-[24px] font-medium text-white  
          pb-[100px] ps-[16px] !pt-[16px]"
          />


          <div className="mt-4 sm:mt-0 sm:absolute sm:bottom-4 sm:left-4 flex flex-wrap gap-2 sm:gap-3">
            {filters.map((f) => (
              <div key={f.id} className="w-full sm:w-auto">

                <FilterTab
                  label={f.label}
                  icon={f.icon}
                  className="w-full"
                />              </div>
            ))}
          </div>


          {/* Button */}
          <div
            className="
    mt-4 
    sm:mt-0 sm:absolute sm:bottom-4 sm:right-4 
    md:static md:flex md:justify-end 
    w-full sm:w-auto
  "
          >
            <Button
              text="Search Certified Host"
              onClick={handleSearchClick}
              className=" sm:w-auto w-[204px] h-[44px]"
            />
          </div>

        </div>

        {/* Carousel */}
        <div className="w-full pt-12  md:pt-15 lg:pt-9 lg:px-[93px] md:px-[50px] px-[10px]  pb-[27px] md:pb-[127px]">
          <StatsCarousel />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;