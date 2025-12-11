// components/VerificationSection.tsx
import React from "react";
import StackedAssessmentCards from "./StackedAssessmentCards"; 
import BlackButton from "../../shared/BlackButton";
import Image from "next/image";
const filters = [
  {
    id: "safety",
    label: "VFire Safety",
    icon: "/images/fire.svg",
  },
  {
    id: "protection",
    label: "CO Protection",
    icon: "/images/co.svg",
  },
  { id: "exits", label: "Exits", icon: "/images/exists.svg" },
  { id: "lighting", label: "Lighting", icon: "/images/lighting.svg" },
  { id: "hazards", label: "Hazards", icon: "/images/hazards.svg" },
];

const VerificationSection = () => {
  return (
    <div className="bg-[#121315] container-class text-white py-9 sm:py-[80px] px-[10px] md:px-[23px] lg:px-[120px]">
<div className="grid grid-cols-12 gap-6 sm:gap-10 lg:gap-12">
        <div className="col-span-12 lg:col-span-7">
          <div className="flex flex-col gap-[24px]">
            <BlackButton
              text="Verification"
              iconSrc="/images/testimonial.png"
              iconWidth={32}
              iconHeight={32}
              className="max-w-[200px] mb-3 sm:mb-0"
            />
            <span className="text-[#fff] text-[48px] font-medium leading-[56px] max-[425px]:leading-[24px] max-[425px]:text-[24px]">
              How StaySafe Verifies Your Space
            </span>
            <p className="text-[#FFFFFF99] font-medium text-[18px] leading-[22px] max-[425px]:text-[14px] w-full max-w-[673px]">
              We perform a practical, guest-focused review to ensure your space
              meets core safety and comfort standards, giving potential guests
              confidence before they book.
            </p>
          </div>

          <div className="w-full sm:max-w-[320px] lg:max-w-[643px] h-[1px] bg-gradient-to-r from-[#121315] via-white to-[#121315] my-[33px] sm:my-[64px]" />
          <p className="text-[#FFFFFF99] font-medium text-[18px] leading-[22px] max-[425px]:text-[14px] w-full max-w-[673px]">
            We review the essentials that matter most for your guests:
          </p>
          <div className="mt-6 flex flex-wrap gap-x-2 sm:gap-x-6 gap-y-4">
            {filters.map((f) => (
              <div key={f.id} className="">
                <div
                  className={`flex items-center gap-3 p-3.5 rounded-md border border-[#FFFFFF14]
                    bg-[#18191B] text-white text-[18px] leading-[22px] font-medium transition cursor-pointer
                     w-full`}
                >
                     <Image
                    src={f.icon}
                    alt={f.label}
                    width={0} 
                    height={0} 
                    className="object-contain w-5 h-5"
                  />
                  <span>{f.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <StackedAssessmentCards />
        </div>
      </div>
    </div>
  );
};

export default VerificationSection;
