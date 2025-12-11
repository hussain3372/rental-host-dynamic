import React from "react";
import Image from "next/image";
import BlackButton from "@/app/shared/BlackButton";
const Experience = () => {
  const features = [
    {
      icon: "/images/experience1.svg",
      title: "Broad Industry Expertise",
      description:
        "Professional experience across construction, manufacturing, federal oversight, and residential operations.",
    },
    {
      icon: "/images/experience2.svg",
      title: "Preventive Leadership",
      description:
        "Hands-on safety leadership that focuses on prevention, clarity, and real-world solutions.",
    },
    {
      icon: "/images/experience3.svg",
      title: "Flexible Engagement Models",
      description:
        "Flexible service structures - hourly, project-based, or retainer agreements.",
    },
    {
      icon: "/images/experience4.svg",
      title: "Tailored Safety Programs",
      description:
        "Personalized assessments and documentation tailored to each client's operations.",
    },
    {
      icon: "/images/experience5.svg",
      title: "Scalable Safety Support",
      description:
        "Ability to support both small businesses and large multi-site operations.",
    },
  ];

  return (
    <div className=" container-class text-white  pt-0 sm:pt-[80px] pb-9 sm:pb-[80px] px-[10px] md:px-[23px] lg:px-[120px]">
      <div className="">

        <div className="text-center sm:mb-20 mb-10">
          <BlackButton
            text="Experience"
            iconSrc="/images/value.png"
            iconWidth={32}
            iconHeight={32}
            className="max-w-[180px] mb-3 sm:mb-0 mx-auto"
          />

          <h2 className="sm:mt-6 mt-4 text-[30px]  md:text-[48px] sm:leading-[57px]  leading-[45px] font-medium">
            Why Organization Choose StaySafe Consulting{" "}
          </h2>

          <p className="sm:mt-6 mt-4 text-[#FFFFFF99] text-[18px] leading-[22px] max-w-[890px] mx-auto">
            Built on proven experience, prevention-driven leadership, and safety
            programs shaped to fit any operation.
          </p>
        </div>
        <div className="">
          <div className="flex flex-col md:flex-row  justify-between items-stretch mb-0 md:mb-6 ">
            {features.slice(0, 3).map((feature, index) => (
              <React.Fragment key={index}>
                <div className="flex-1 max-w-full md:max-w-[361px] p-5 sm:p-6 mb-8 md:mb-0 flex flex-col items-center">
                  <div className="mb-8 flex items-center justify-center p-3 bg-[#EFFC76] rounded-xl">
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={32}
                      height={32}
                      className="w-6 h-6 sm:w-8 sm:h-8"
                    />
                  </div>

                  <h3 className=" sm:text-[24px] text-[20px] font-semibold mb-3 text-white leading-7 text-center">
                    {feature.title}
                  </h3>

                  <p className="text-[#F4F7FF] leading-5 text-sm sm:text-[14px] font-normal text-center">
                    {feature.description}
                  </p>
                </div>

                {index < 2 && (
                  <div className="hidden md:block  max-h-[200px] w-px bg-gradient-to-t from-[#121315] via-[#D5D5D5A3] to-[#121315] self-stretch mt-[40px] mr-6"></div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-center items-stretch">
            {features.slice(3, 5).map((feature, index) => (
              <React.Fragment key={index}>
                <div className="flex-1 max-w-full md:max-w-[366px] p-6 sm:p-8 mb-8 md:mb-0  flex flex-col items-center">
                  <div className="mb-8 inline-flex items-center justify-center p-3 bg-[#EFFC76] rounded-[10px]">
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={32}
                      height={32}
                      className="w-6 h-6 sm:w-8 sm:h-8"
                    />
                  </div>

                  <h3 className=" sm:text-[24px] text-[20px] font-semibold mb-3 text-white leading-7 text-center">
                    {feature.title}
                  </h3>

                  <p className="text-[#F4F7FF] leading-5 text-sm sm:text-[14px] font-normal text-center">
                    {feature.description}
                  </p>
                </div>

                {index === 0 && (
                  <div className="hidden md:block max-h-[200px] w-px bg-gradient-to-t from-[#121315] via-[#D5D5D5A3] to-[#121315] self-stretch mt-[40px] mr-6"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;
