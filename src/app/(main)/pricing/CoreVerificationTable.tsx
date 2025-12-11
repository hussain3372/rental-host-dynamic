import Image from "next/image";
export default function CoreVerificationTable() {
  const features = [
    {
      name: "Full Safety & Comfort Assessment",
      starter: true,
      professional: true,
      enterprise: true,
    },
    {
      name: "Trusted Stay™ Verified Badge",
      starter: true,
      professional: true,
      enterprise: true,
    },
    {
      name: "Safety & Comfort Overview Report",
      starter: true,
      professional: true,
      enterprise: true,
    },
    {
      name: "Digital QR Code",
      starter: true,
      professional: true,
      enterprise: true,
    },
    {
      name: "Annual Re-Verification Reminder",
      starter: true,
      professional: true,
      enterprise: true,
    },
    {
      name: "Badge Usage Guidelines",
      starter: true,
      professional: true,
      enterprise: true,
    },
  ];

  return (
    <div className=" text-white sm:py-20 py-9 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <div className=" flex items-center justify-center">
            <Image
              src="/images/value.png"
              alt="Star icon"
              width={32}
              height={32}
              className=""
            />{" "}
          </div>
          <h1 className="text-[20px] md:text-[28px] leading-8 font-bold">
            Core Verification
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
                <th className=" pb-8 px-4 md:px-8 font-light text-[20px] font-semibold leading-6">
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
                  <td className="py-6 px-4 md:px-8 text-center">
                    {feature.starter && (
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
