import React, { useState } from "react";
import BlackButton from "@/app/shared/BlackButton";
import PricingCard from "@/app/shared/PlanCard";
import ToggleSwitch from "@/app/shared/Toggles";

export default function Plans() {
  const [isOn, setIsOn] = useState(false);
  const handleToggle = () => {
    setIsOn((prev) => !prev);
  };

  return (
    <div className="container-class pb-[20px] sm:pb-[96px]  px-3 md:px-[80px] lg:px-[120px] py-8 md:">
      <div className="">
        <BlackButton
          text="Our Plans"
          iconSrc="/images/plan.png"
          iconWidth={32}
          iconHeight={32}
          className="max-w-[164px] w-full mb-5 sm:mb-10"
        />
        <h2 className="max-w-[695px] font-medium text-[30px] md:text-[48px] leading-[40px] md:leading-[56px] text-[#FFFFFF] py-[10px] md:py-[24px]">
          Flexible hosting plans that grow with your property needs
        </h2>
        <p className="font-medium max-w-[600px] text-[18px] leading-[22px] text-[#FFFFFF99]">
          Choose the plan that fits your hosting needs and grow at your own pace
          with flexible options designed for every property owner.
        </p>
        <div className="flex gap-[12px] items-center pt-[67px]">
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

      <div className="flex flex-col xl:flex-row items-center pt-[38px] justify-center gap-[24px] ">
        <PricingCard
          key={`starter-${isOn}`}
          title="Starter"
          description="List your first property with ease."
          price={isOn ? "$10" : "$12"}
          period="per month"
          buttonText="Get Started"
          features={[
            "1 certified property listing",
            "Official digital certificate included",
            "Basic property details verification",
            "Easy submission process",
          ]}
          bgColor="bg-black"
          textColor="text-white"
          buttonBg="bg-[#2D2D2D]"
          buttonTextColor="text-white"
        />
        <PricingCard
          key={`professional-${isOn}`}
          title="Professional"
          description="Get more listings and recognition."
          price={isOn ? "$20" : "$24"}
          period="per month"
          buttonText="Get Started"
          features={[
            "Up to 10 certified property listings",
            "Verified digital certificates",
            "Priority listing visibility",
            "Enhanced property details & images",
          ]}
          bgColor="bg-gradient-to-b from-[#606536] via-[#606536] to-transparent"
          textColor="text-white"
          buttonBg="bg-[#EFFC76]"
          buttonTextColor="text-black"
        />
        <PricingCard
          key={`enterprise-${isOn}`}
          title="Enterprise"
          description="Certified property solutions at scale."
          price={isOn ? "$190" : "$200"}
          period="per month"
          buttonText="Get Started"
          features={[
            "Unlimited certified property listings",
            "Bulk certificate management",
            "Advanced verification tools",
            "Premium placement for properties",
          ]}
          bgColor="bg-black"
          textColor="text-white"
          buttonBg="bg-[#2D2D2D]"
          buttonTextColor="text-white"
        />
      </div>
    </div>
  );
}
