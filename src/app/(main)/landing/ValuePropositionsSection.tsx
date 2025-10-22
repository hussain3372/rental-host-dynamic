"use client";

import React from "react";
import Image from "next/image";
import PropositionsCard from "../../shared/PropositionsCard";
import BlackButton from "../../shared/BlackButton";

const ValuePropositionsSection = () => {
  return (
    <div className="bg-[#121315] container-class text-white py-9 sm:py-[20px] px-[10px] md:px-[23px] lg:px-[120px]">
      <div className=" text-center">
        {/* Top Badge */}
        <div className="flex items-center justify-center">
          <BlackButton
            text="Value Prepositions"
            iconSrc="/images/value.png"
            iconWidth={32}
            iconHeight={32}
          />
        </div>


        {/* Main Heading with Icons */}
        <div className="sm:py-[60px] py-[27px]">
          <h2 className="text-[20px] md:text-[30px] lg:text-[40px] sm:leading-[25px] md:leading-[30px] font-medium lg:leading-[48px] w-full max-w-[1008px] mx-auto text-center">
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

        <div className="flex flex-wrap justify-center gap-[24px] mb-8 sm:px-[30px]">
          <PropositionsCard
            text="Earn guests trust instantly"
            iconSrc="/images/react.png"
            iconWidth={56}
            iconHeight={56}
            className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          />

          <PropositionsCard
            text="Boost your bookings"
            iconSrc="/images/react.png"
            iconWidth={56}
            iconHeight={56}
            className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          />

          <PropositionsCard
            text="Get verified certifications"
            iconSrc="/images/react.png"
            iconWidth={56}
            iconHeight={56}
            className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-[24px]">
          <PropositionsCard
            text="Stay compliant with ease"
            iconSrc="/images/react.png"
            iconWidth={56}
            iconHeight={56}
            className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          />

          <PropositionsCard
            text="Certified badges and renewals"
            iconSrc="/images/react.png"
            iconWidth={56}
            iconHeight={56}
            className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(36%-16px)]"
          />
        </div>

      </div>
    </div>
  );
};

export default ValuePropositionsSection;
