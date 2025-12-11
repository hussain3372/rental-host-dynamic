import Image from "next/image";
export default function SupportTable() {
  const features = [
    {
      name: "Red Alerts (recalls, hazard spikes, STR trends)",
      starter: true,
      professional: true,
      enterprise: true,
    },
    {
      name: "Seasonal Safety Reminders",
      starter: true,
      professional: true,
      enterprise: true,
    },
    {
      name: "Monthly Virtual Q&A Sessionst",
      starter: true,
      professional: true,
      enterprise: true,
    },
  ];

  return (
    <div className=" text-white sm:pb-20 pb-9 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <div className=" flex items-center justify-center">
            <Image
              src="/images/testimonial.png"
              alt="Star icon"
              width={32}
              height={32}
            />{" "}
          </div>
          <h1 className="text-[20px] md:text-[28px] leading-8 font-bold">
            Alerts & Safety Support
          </h1>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="">
              <tr className="">
                <th className="text-left pb-8  font-light text-[20px] font-semibold leading-6  text-gray-300">
                  Features
                </th>
                <th className=" text-left pb-8 px-4 md:px-8 font-light text-[20px] font-semibold leading-6">
                  Starter
                </th>
                <th className=" pb-8 px-4 md:px-8 font-light text-[20px] font-semibold leading-6">
                  Professional
                </th>
                <th className=" pb-8 px-4 md:px-8 font-light text-[20px] font-semibold leading-6">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors"
                >
                  <td className="py-6 font-normal leading-6 text-base md:text-[20px]  whitespace-nowrap text-[#FFFFFFCC]">
                    {feature.name}
                  </td>
                  <td className="py-6 px-4 md:px-8 text-left">
                    {feature.starter && (
                      <svg
                        className="w-6 h-6 inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="21"
                        viewBox="0 0 24 21"
                        fill="none"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M5.55332 4.21934C5.69395 4.07889 5.88457 4 6.08332 4C6.28208 4 6.4727 4.07889 6.61332 4.21934L18.6133 16.2193C18.687 16.288 18.7461 16.3708 18.7871 16.4628C18.8281 16.5548 18.8501 16.6541 18.8519 16.7548C18.8537 16.8555 18.8352 16.9555 18.7974 17.0489C18.7597 17.1423 18.7036 17.2272 18.6324 17.2984C18.5611 17.3696 18.4763 17.4257 18.3829 17.4635C18.2895 17.5012 18.1895 17.5197 18.0888 17.5179C17.9881 17.5162 17.8888 17.4941 17.7968 17.4531C17.7048 17.4121 17.622 17.353 17.5533 17.2793L5.55332 5.27934C5.41287 5.13871 5.33398 4.94809 5.33398 4.74934C5.33398 4.55059 5.41287 4.35997 5.55332 4.21934Z"
                          fill="white"
                        />
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M18.6129 4.21934C18.7533 4.35997 18.8322 4.55059 18.8322 4.74934C18.8322 4.94809 18.7533 5.13871 18.6129 5.27934L6.61285 17.2793C6.47068 17.4118 6.28263 17.4839 6.08833 17.4805C5.89403 17.4771 5.70865 17.3984 5.57123 17.261C5.43382 17.1235 5.35511 16.9382 5.35168 16.7439C5.34825 16.5496 5.42037 16.3615 5.55285 16.2193L17.5529 4.21934C17.6935 4.07889 17.8841 4 18.0829 4C18.2816 4 18.4722 4.07889 18.6129 4.21934Z"
                          fill="white"
                        />
                      </svg>
                    )}
                  </td>
                  <td className="py-6 px-4 md:px-8 text-center">
                    {feature.professional && (
                      <svg
                        className="w-6 h-6 text-[#EFFC76] inline-block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </td>
                  <td className="py-6 px-4 md:px-8 text-center">
                    {feature.enterprise && (
                      <svg
                        className="w-6 h-6 text-[#EFFC76] inline-block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
