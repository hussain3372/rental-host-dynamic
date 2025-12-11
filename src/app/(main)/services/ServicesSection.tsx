"use client";
import BlackButton from "@/app/shared/BlackButton";
import React from "react";

const services = [
  {
    number: "1",
    title: "OSHA Compliance Support",
    text: "Expert guidance to help ensure your operations align with OSHA standards for General Industry and Construction.",
  },
  {
    number: "2",
    title: "Written Safety Program Development",
    text: "Creation of customized written policies that meet regulatory expectations and support safe, consistent workplace practices.",
  },
  {
    number: "3",
    title: "AHA / JHA / Task Hazard Analysis Support",
    text: "Structured hazard evaluations that identify risks, control measures, and safe task execution steps.",
  },
  {
    number: "4",
    title: "Mock Safety Inspections & Facility Assessments",
    text: "Proactive walk-through style reviews to identify concerns before regulatory visits or internal audits.",
  },
  {
    number: "5",
    title: "Contractor Prequalification & Safety Review",
    text: "Screening and evaluation of contractor safety records, policies, and readiness before they enter your jobsite.",
  },
  {
    number: "6",
    title: "Site Safety Plans, Jobsite Walkthroughs & Readiness Assessments",
    text: "Field-focused evaluations and preparation plans to confirm proper controls, signage, and safe work conditions.",
  },
  {
    number: "7",
    title: "Industrial Hygiene Guidance",
    text: "Consultation on exposure risks, air quality conditions, and ventilation measures that support worker health.",
  },
  {
    number: "8",
    title: "Safety Training",
    text: "Effective safety instruction that builds competency, awareness, and compliance confidence across your workforce.",
  },
  {
    number: "9",
    title: "Ongoing Safety Coaching & Monthly Consultation Hours",
    text: "Continuing expert support providing guidance, updates, and safety insight throughout the year.",
  },
];

const ServicesSection = () => {
  return (
      <div className=" container-class text-white  pt-0 sm:pt-[80px] pb-9 sm:pb-[80px] px-[10px] md:px-[23px] lg:px-[120px]">
      {/* Heading */}
      <div className="text-center sm:mb-20 mb-10">
        <BlackButton
          text="Services"
          iconSrc="/images/value.png"
          iconWidth={32}
          iconHeight={32}
          className="max-w-[158px] mb-3 sm:mb-0 mx-auto"
        />

        <h2 className="sm:mt-6 mt-4 text-[36px] md:text-[48px] sm:leading-[57px]  leading-[48px] font-medium">
          Your Verified Property Results
        </h2>

        <p className="sm:mt-6 mt-4 text-[#FFFFFF99] text-[18px] leading-[22px] max-w-[890px] mx-auto">
          Expert safety consulting tailored to industrial, construction, and
          short-term rental environments.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((item) => (
          <div
            key={item.number}
            className="
              bg-[#0A0C0B]
              p-6
              rounded-2xl
              border-t-[3px] border-r-[2px] border-l-[2px] border-[#FFFFFF14]
              shadow-[0_4px_10px_rgba(0,0,0,0.25)]
                  shadow-[0_2px_4px_0_rgba(0,0,0,0.29),0_8px_8px_0_rgba(0,0,0,0.26),0_1px_0_1px_rgba(255,255,255,0.15)_inset,0_17px_10px_0_rgba(0,0,0,0.15),0_31px_12px_0_rgba(0,0,0,0.04),0_48px_13px_0_rgba(0,0,0,0.01),0_-3px_7px_0_rgba(0,0,0,0.20)_inset,1px_-14px_14px_0_rgba(0,0,0,0.17)_inset,3px_-30px_18px_0_rgba(0,0,0,0.10)_inset,5px_-54px_22px_0_rgba(0,0,0,0.03)_inset]

              hover:translate-y-[-4px]
              transition-all duration-300
            "
          >
            <div className="mb-5">
              <div
                className="
                  w-[36px] h-[36px] 
                  flex items-center justify-center 
                  rounded-full 
                  border-2 border-[#EFFC76] 
                  text-[#EFFC76] 
                  text-[16px] font-semibold
                "
              >
                {item.number}
              </div>
            </div>

            <h3 className="sm:text-[24px]  text-[20px] leading-7 sm:font-semibold font-medium mb-3">
              {item.title}
            </h3>

            <p className="text-[#F4F7FF99] text-[14px] leading-5 font-normal">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesSection;
