// components/Services.tsx
import React from "react";
import BlackButton from "../../shared/BlackButton";
import Image from "next/image";
import HeroSection from "../faq/HeroSection";
import ServicesSection from "./ServicesSection";
import Experience from "./Experience";
import Consultation from "./Consultation";
const filters = [
  {
    id: "safety",
    label: "Certified Safety Professional (CSP)",
    icon: "/images/vector1.svg",
  },
  {
    id: "protection",
    label: "20+ Years in Environmental Health & Safety",
    icon: "/images/vector2.svg",
  },
  {
    id: "exits",
    label: "Federal Safety Oversight & Regulatory Background",
    icon: "/images/vector3.svg",
  },
  {
    id: "lighting",
    label: "Specialized Expertise in Training & Compliance",
    icon: "/images/vector4.svg",
  },
];

const Services = () => {
  return (
    <div>
      <HeroSection
        title="Professional Safety Consulting Services"
        buttonText="Services"
        buttonIcon="/images/value.png"
      />
      <div className=" container-class text-white  pt-0 sm:pt-[80px] pb-9 sm:pb-[80px] px-[10px] md:px-[23px] lg:px-[120px]">
        <div className="grid grid-cols-12 gap-6 sm:gap-10 lg:gap-14">
          <div className="col-span-12 lg:col-span-8">
            <div className="flex flex-col gap-[24px]">
              <BlackButton
                text="About Us"
                iconSrc="/images/testimonial.png"
                iconWidth={32}
                iconHeight={32}
                className="max-w-[158px] mb-3 sm:mb-0"
              />
              <span className="text-[#fff] text-[48px] font-medium leading-[56px] max-[425px]:leading-[24px] max-[425px]:text-[24px]">
                Credentials & Expertise
              </span>
              <p className="text-[#FFFFFF99] font-medium text-[18px] leading-[22px] max-[425px]:text-[14px] w-full max-w-[738px]">
                StaySafe consulting is overseen by an experienced Certified
                Safety Professional (CSP), bringing decades of Environmental
                Health & Safety leadership, and regulatory oversight.
              </p>
            </div>

            <div className="sm:mt-20 mt-10 flex flex-col  sm:gap-x-6 gap-y-8">
              {filters.map((f) => (
                <div key={f.id} className="">
                  <div
                    className={`flex items-center gap-4  
                     text-white font-medium transition cursor-pointer
                     w-full`}
                  >
                    <Image
                      src={f.icon}
                      alt={f.label}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                    <span className="font-medium text-[18px] leading-[22px]">
                      {f.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="flex items-center justify-center">
              <div
                className="
        w-full 
        max-w-[396px] 
        h-[476px]
        rounded-[20px] 
        bg-[#171717] 
        shadow-[0_4px_8px_rgba(0,0,0,0.20)]
        pl-[61px] pt-[61px] pb-[54px]    
        pr-0                                  
        relative
      "
              >
                <div className="w-full h-full">
                  <Image
                    src="/images/services.png"
                    alt="icon"
                    width={562}
                    height={361}
                    className="w-full h-full object-cover rounded-[20px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ServicesSection />
      <Experience />
      <div className="sm:px-20 px-0">
      <Consultation />

      </div>
    </div>
  );
};

export default Services;
