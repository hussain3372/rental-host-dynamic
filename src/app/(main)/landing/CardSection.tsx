"use client";
import React from "react";
import BlackButton from "../../shared/BlackButton";
import Image from "next/image";

const steps = [
  {
    id: 1,
    title: "Add Your Property",
    desc: "List your property by filling in the required details such as location, type, and ownership information.",
    glow: "/images/star1.png", // add your glow/starburst background image
  },
  {
    id: 2,
    title: "Get Verified Certificates",
    desc: "Our system verifies your documents and issues the required rental host certificates securely.",
    glow: "/images/star2.png",
  },
  {
    id: 3,
    title: "Showcase With Confidence",
    desc: "Your property now appears with valid certifications, making it easier for renters to trust and choose you.",
    glow: "/images/star3.png",
  },
];

function CardSection() {
  return (
    <div className="px-[120px] bg-[#121315] max-w-[1440px] mx-auto py-[80px] max-[1100px]:px-[80px] max-[1100px]:py-[60px] max-[430px]:px-[19px] max-[430px]:py-8">
      {/* Top Section */}
      <div className="flex flex-col gap-[24px]">


        <BlackButton
          text="How It Works"
          iconSrc="/images/how-it-works.png"
          iconWidth={32}
          iconHeight={32}
          className="max-w-[200px] mb-3 sm:mb-0"
        />
        <span className="text-[#fff] text-[48px] font-medium leading-[56px] max-[425px]:leading-[24px] max-[425px]:text-[24px]">
          How Our Hosting Platform Works.
        </span>
        <p className="text-[#FFFFFF99] font-medium text-[18px] leading-[22px] max-[425px]:text-[14px] w-full max-w-[673px]">
          Effortlessly list, manage, and book your properties through our streamlined and transparent process, designed to make hosting smoother than ever.
        </p>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-38 md:gap-y-[115px] md:gap-x-[17px] lg:gap-[24px] mt-[148px] sm:mt-[211px] ">
        {steps.map((step) => (
          <div key={step.id} className="relative flex flex-col items-center text-left ">
            {/* Glow Background */}
            <Image
              src={step.glow}
              alt="glow"
              width={197}
              height={197}
              className="absolute top-[-118px] left-1/2 -translate-x-1/2 w-[197px] h-[197px] object-contain"
            />

            {/* Card Header */}
            <div className="w-full flex items-center gap-3 bg-[#EFFC76] rounded-[24px] px-3 py-3 shadow-lg relative z-10 ">
              {/* Number Circle */}
              <div
                className="w-[48px] h-[48px] flex items-center justify-center rounded-full bg-[#2D2D2D] text-[24px] leading-[33px] text-[#EFFC76] font-medium"
                style={{
                  boxShadow: `  0px 48px 13px 0px #00000003, 0px 31px 12px 0px #0000000A, 0px 17px 10px 0px #00000026,  0px 8px 8px 0px #00000042,  0px 2px 4px 0px #0000004A,  5px -54px 22px 0px #00000008 inset, 3px -30px 18px 0px #0000001A inset,
      1px -14px 14px 0px #0000002B inset,
      0px -3px 7px 0px #00000033 inset
    `,
                }}
              >
                {step.id}
              </div>

              <span className="text-[#121315] font-semibold text-[20px] leading-[24px] ">{step.title}</span>
            </div>

            {/* Body Text */}
            <p className="mt-4 text-[#D5D5D5] text-[16px] sm:text-[18px] sm:leading-[22px] leading-[18px] max-w-[320px] font-medium">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardSection;
