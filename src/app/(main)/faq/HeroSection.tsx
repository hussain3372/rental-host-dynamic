"use client";

import React from "react";
import Image from "next/image";
import BlackButton from "@/app/shared/BlackButton";

interface HeroSectionProps {
  title: string;
  buttonText?: string;
  buttonIcon?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  buttonText = "FAQ",
  buttonIcon = "/images/FAQ.png",
}) => {
  return (
    <div className="relative w-full  min-h-[400px] sm:min-h-[600px] flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Gradient/Background Images */}
      <div className="inset-0 hidden sm:block pointer-events-none">
        <Image
          src="/images/gar1.png"
          alt="gradient"
          width={400}
          height={902}
          className="absolute top-0 left-12 !h-[585px] !w-[400px]"
        />
        <Image
          src="/images/gar2.png"
          alt="gradient"
          width={350}
          height={902}
          className="absolute top-0 left-[30%] !h-[585px] -translate-x-1/2"
        />
        <Image
          src="/images/gar3.png"
          alt="gradient"
          width={300}
          height={902}
          className="absolute top-0 left-1/2 !h-[585px] -translate-x-1/2"
        />
        <Image
          src="/images/gar4.png"
          alt="gradient"
          width={350}
          height={902}
          className="absolute top-0 right-[30%] !h-[585px] translate-x-1/2"
        />
        <Image
          src="/images/gar5.png"
          alt="gradient"
          width={400}
          height={902}
          className="absolute top-0 right-12 !h-[585px] !w-[400px]"
        />
      </div>

      {/* Background Overlay Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Central Background Image */}
      <div className="inset-0 hidden sm:block z-10 overflow-hidden">
        <Image
          src="/images/search-bg.png"
          alt="Background"
          className="inset-0 absolute top-2!"
          fill
          style={{ transform: "translateY(-7px)" }}
        />
      </div>

      {/* Heading and subtext */}
      <div className="relative z-20 flex flex-col items-center justify-center px-4">
        <div className="flex items-center mb-6">
          <BlackButton
            text={buttonText}
            iconSrc={buttonIcon}
            iconWidth={32}
            iconHeight={32}
            className="w-full mb-0 sm:mb-10"
          />
        </div> 
        <h2 className="md:text-[40px] lg:text-[52px] text-[32px] leading-[45px] sm:leading-[60px] font-medium text-white/80 max-w-[741px] mb-4">
          {title}
        </h2>
      </div>
    </div>
  );
};

export default HeroSection;