import Image from "next/image";
import React from "react";

export default function StackedAssessmentCards() {
  const assessmentItems = [
    { id: 1, text: "Fire safety measures in place", active: true },
    { id: 2, text: "Carbon monoxide safety installed", active: false },
    { id: 3, text: "Clear and accessible exit pathways", active: false },
    { id: 4, text: "Adequate lighting for visibility", active: false },
    { id: 5, text: "Safe, obstacle-free walkways", active: false },
  ];

  return (
    <div className="flex items-center justify-center">
      <div
        className="
        max-w-[404px]
          w-full 
          rounded-[20px] 
          bg-[#171717] 
          shadow-[0_4px_8px_rgba(0,0,0,0.20)]
          px-4 sm:px-[61px]
        "
      >
        <div className="text-center mb-[25px] mt-[65px]">
          <div className="inline-block bg-gray-300 text-[#121315] px-8 py-3 rounded-full text-[14px] leading-5 font-medium">
            Our Assessment
          </div>
        </div>

        <div className="relative h-55">
          {assessmentItems.map((item, index) => {
            const isActive = item.id === 1;
            const reverseIndex = assessmentItems.length - index;

            return (
              <div
                key={item.id}
                className="absolute left-0 right-0 mx-auto transition-all duration-300"
                style={{
                  top: `calc(${index * 47}px + ${index === 1 ? 4 : 0}px - ${
                    index === assessmentItems.length - 1 ? 6 : 0
                  }px)`,
                  zIndex: reverseIndex,
                  width: `calc(100% - ${index * 4}% - 16px)`,
                  transform:
                    index > 0 ? `scale(${1 - index * 0.05})` : "scale(1)",
                  opacity: index > 3 ? 0.4 : 1,
                }}
              >
                <div
                  className={`
                    rounded-[10px] p-[12px] gap-[12px] transition-all duration-300 shadow-[0_4px_4px_rgba(0,0,0,0.25)]
                    ${
                      isActive
                        ? "border border-[rgba(239,252,118,0.32)] bg-[#EFFC76] shadow-[0_4px_4px_rgba(0,0,0,0.25),_0_0_0_1px_rgba(255,255,255,0.20)_inset] text-black"
                        : "bg-[#252424] shadow-[0_4px_4px_rgba(0,0,0,0.25),_0_0_0_1px_rgba(255,255,255,0.10)_inset] blur-[0.05px] text-white"
                    }
                  `}
                >
                  <div className="flex items-center gap-[12px]">
                    <div
                      className={`w-8 h-8 p-2 rounded-full flex items-center justify-center 
              leading-5 text-[16px] font-medium flex-shrink-0
              text-[#EFFC76]
              ${
                isActive
                  ? "bg-black"
                  : "bg-[#2D2D2D] shadow-[0_-3px_7px_rgba(0,0,0,0.20)_inset,1px_-14px_14px_rgba(0,0,0,0.17)_inset,3px_-30px_18px_rgba(0,0,0,0.10)_inset,5px_-54px_22px_rgba(0,0,0,0.03)_inset,0_2px_4px_rgba(0,0,0,0.29),0_8px_8px_rgba(0,0,0,0.26),0_17px_10px_rgba(0,0,0,0.15),0_31px_12px_rgba(0,0,0,0.04),0_48px_13px_rgba(0,0,0,0.01)]"
              }
            `}
                    >
                      {item.id}
                    </div>

                    <div className="text-[12px] leading-4 font-normal">
                      {item.text}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-[29px] flex justify-center mb-16">
          <div className="rounded-full overflow-hidden">
            <Image
              src="/images/stacked.png"
              alt="icon"
              width={72}
              height={72}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
