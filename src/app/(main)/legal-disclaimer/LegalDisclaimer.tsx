"use client";

import React from "react";
import HeroSection from "../faq/HeroSection";

const LegalDisclaimer = () => {
  const sections = [
    {
      number: "1",
      title: "Official Legal Disclaimer",
      content: `StaySafe Verified provides a host-led, photo-based Safety & Comfort Assessment intended to improve transparency and help guests make informed decisions. The StaySafe Verified process does not represent, replace, or certify compliance with any building codes, fire codes, rental ordinances, housing standards, or legal occupancy requirements at the local, state, or federal level.`,
    },
    {
      number: "2",
      title: "Scope of Assessment",
      content: `- The assessment is based solely on photos, videos, and information submitted by the host.
- No on-site inspection or engineering evaluation is performed.
- Findings represent a moment-in-time review based on submitted material.
- The assessment does not identify concealed hazards or conditions not visible in submitted images.
- The assessment is limited to general safety and comfort indications relevant to short-term rental guests.`,
    },
    {
      number: "3",
      title: "Host Responsibility",
      content: `Hosts maintain full and ongoing responsibility for:
      - Ensuring required alarms, detectors, and equipment function properly.
- Verifying that their property meets all local rental permit, licensing, and regulatory obligations.
- Addressing hazards, deficiencies, or repairs identified during or after the assessment.
- The safety, maintenance, and legal compliance of their property.`,
    },
    {
      number: "4",
      title: "No Guarantee of Safety",
      content: `StaySafe Verified does not guarantee that a property is safe, hazard-free, or compliant with legal codes. The Trusted Stay™ Badge represents successful review of submitted materials—not a certification or warranty of safety.`,
    },
    {
      number: "5",
      title: "Statement for Guests",
      content: `Guests should treat the StaySafe Verified badge as an indicator of transparency—not a guarantee of safety. Guests must follow all house rules, exercise reasonable caution, and report unsafe conditions to the host immediately.`,
    },
    {
      number: "6",
      title: "QR Code & Verification Page",
      content: `Each QR code is unique to the individual property. Scanning the code provides access to the property's verification summary, including the date of review and general safety & comfort elements evaluated. This QR code is not transferable and cannot be used for other properties.`,
    },
    {
      number: "7",
      title: "Limitation of Liability",
      content: `StaySafe Verified, its owners, employees, or consultants shall not be liable for injuries, damages, losses, or claims arising from conditions within the property, guest behavior, host actions, or reliance on the assessment. The host assumes full liability for the property and guest use.`,
    },
    {
      number: "8",
      title: "Non-Endorsement Clause",
      content: ` The presence of a Trusted Stay™ Badge does not imply endorsement by any government body, regulatory agency, fire marshal, insurance carrier, or platform such as Airbnb, VRBO, Booking.com, or any real estate entity.`,
    },
  ];

  return (
    <div>
      <HeroSection
        title="Legal Disclaimer & Assessment Limitations"
        buttonText="Important Notice"
        buttonIcon="/images/value.png"
      />

      <div className="bg-[#121315] container-class text-white pt-0 sm:pt-20 pb-9 sm:pb-20 px-2.5 md:px-[23px] lg:px-[120px]">
        {sections.map((section) => (
          <div key={section.number} className="mb-8">
            <h3 className="flex items-center gap-3 text-[20px] sm:text-[24px] font-semibold mb-6">
              <span className="text-white font-bold  ">{section.number}.</span>
              <span className="sm:text-[28px] text-[24px] font-bold sm:leading-8 leading-7 ">{section.title}</span>
            </h3>

            <div className="text-[#D5D5D5] text-[16px] sm:text-[20px]  leading-7 mb-10">
              {section.content.split("\n").map((line, index) => {
                const trimmed = line.trim();
                if (
                  trimmed.startsWith("-") &&
                  ["2", "3", "8"].includes(section.number)
                ) {
                  return (
                    <div key={index} className="flex items-start mb-4">
                      <span className="text-[#EFFC76] mr-2 text-[24px]">•</span>
                      <span className="text-[16px] sm:text-[20px] leading-6">
                        {trimmed.substring(1).trim()}
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <p key={index} className="mb-4">
                      {trimmed}
                    </p>
                  );
                }
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegalDisclaimer;
