"use client";
import React, { useState } from "react";
import PricingCard from "@/app/shared/PlanCard";
import ToggleSwitch from "@/app/shared/Toggles";
import HeroSection from "../faq/HeroSection";
import CoreVerificationTable from "./CoreVerificationTable";
import SupportTable from "./SupportTable";
import PortfolioTable from "./PortfolioTable";
import Unlock from "../landing/Unlock";
export default function Plans() {
  const [isOn, setIsOn] = useState(false);
  const handleToggle = () => {
    setIsOn((prev) => !prev);
  };

  return (
    <div>
      <HeroSection
        title="Safety Verification Plans for Every Property"
        buttonText="Plans"
        buttonIcon="/images/value.png"
      />
      <div className="container-class pb-[20px] sm:pb-[96px]  px-3 md:px-[80px] lg:px-[120px] sm:py-20 py-0">
        <div className="">
          <div className="flex gap-[12px] items-center">
            <p
              className={`${
                isOn ? "text-[#999999]" : "text-white"
              } font-medium text-[12px] sm:text-[16px] leading-[22px] sm:leading-[24px]`}
            >
              Monthly
            </p>
            <ToggleSwitch isOn={isOn} onToggle={handleToggle} />
            <p
              className={`${
                isOn ? "text-white" : "text-[#999999]"
              } text-[12px] sm:text-[16px] leading-[22px] sm:leading-[24px]`}
            >
              Yearly
            </p>
            <div className="bg-[#2D2D2D] rounded-full py-[6px] px-[8px] ">
              <p className="text-[#EFFC76] font-semibold text-[12px] leading-[14px]">
                Save 20%
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-stretch pt-[24px] justify-center gap-[24px] ">
          <PricingCard
            key={`starter-${isOn}`}
            title="Starter"
            description="Best for: Single-property hosts seeking basic verification."
            price={isOn ? "$10" : "$12"}
            period="per month"
            buttonText="Get Started"
            features={[
              "1 full Safety & Comfort Assessment",
              "Trusted Stay™ Verified Badge",
              "Digital QR Code linking to your verification page",
              "Safety & Comfort Overview Report",
              "Annual re-verification reminder",
              "Basic Host Dashboard access",
            ]}
            bgColor="bg-black"
            textColor="text-white"
            buttonBg="bg-[#2D2D2D]"
            buttonTextColor="text-white"
            featureWhiteSpace="whitespace-normal"
            cardMaxWidth="w-full max-w-[385px]"
          />
          <PricingCard
            key={`professional-${isOn}`}
            title="Professional"
            description="Best for: Hosts with multiple properties or those wanting ongoing safety support and proactive alerts."
            price={isOn ? "$20" : "$24"}
            period="per month"
            buttonText="Get Started"
            features={[
              "Red Alerts: Safety issues, hazard trends, recalls",
              "Seasonal safety reminders",
              "Monthly virtual Q&A sessions",
              "Priority review turnaround",
              "Featured placement in Verified Stays page",
              "Multi-property dashboard",
              "Discounted re-checks",
            ]}
            bgColor="bg-gradient-to-b from-[#606536] via-[#606536] to-transparent"
            textColor="text-white"
            buttonBg="bg-[#EFFC76]"
            buttonTextColor="text-black"
            featureWhiteSpace="whitespace-normal"
            cardMaxWidth="w-full max-w-[385px]"
          />
          <PricingCard
            key={`enterprise-${isOn}`}
            title="Enterprise"
            description="Best for: Property managers, resorts, multi-unit owners, and beachfront communities with 10+ properties"
            price={isOn ? "$190" : "------"}
            period="per month"
            buttonText="Custom Pricing"
            features={[
              "Bulk assessment pricing",
              "Dedicated account manager",
              "Portfolio-wide safety review & insights",
              "Custom reporting dashboards",
              "Optional virtual or onsite consulting",
              "Bulk QR code management",
              "Priority support & turnaround",
            ]}
            bgColor="bg-black"
            textColor="text-white"
            buttonBg="bg-[#2D2D2D]"
            buttonTextColor="text-white"
            featureWhiteSpace="whitespace-normal"
            cardMaxWidth="w-full max-w-[385px]"
          />
        </div>

        <CoreVerificationTable />
        <SupportTable />
        <PortfolioTable />

      </div>
      <div className="px-[40px]">
              <Unlock   />

      </div>


    </div>
  );
}
