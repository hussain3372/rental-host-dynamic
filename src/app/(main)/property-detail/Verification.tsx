import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Verification() {
  const verification = [
    {
      id: "0",
      value: "Premium Verified Badge",
      title: "Certificate Type",
    },
    {
      id: "1",
      value: "239876",
      title: "Certificate ID",
    },
    {
      id: "2",
      value: "Aug 12, 2024",
      title: "Issue Date",
    },
    {
      id: "3",
      value: "Aug 12, 2024",
      title: "Expiry Date",
    },
  ]

  return (
    <div className="pt-[120px] sm:pt-[150px] lg:pt-[200px] pb-[60px] sm:pb-[80px] container-class px-4 md:px-10 lg:px-[120px]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-[24px] sm:gap-[32px] lg:gap-[40px] max-w-[100%]">
        <div className="col-span-12 lg:col-span-7 sm:mr-[25px] mr-0">

          <div className='bg-[#0a0c0b] rounded-2xl sm:rounded-3xl lg:rounded-4xl max-h-none lg:max-h-[594px] pb-[24px] sm:pb-[32px] w-full '>
            <div className='relative flex flex-col items-center'>
              {/* Star positioning - responsive */}
              <Image
                src="/images/star.png"
                alt='Star'
                height={220}
                width={220}
                className='h-[120px] w-[120px] sm:h-[160px] sm:w-[160px] lg:h-[220px] lg:w-[220px] absolute  -top-18 sm:-top-32 left-1/2 transform -translate-x-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 lg:left-77 lg:transform-none z-[0]'
              />

              {/* Button - responsive */}
              <button
                className="
    px-[24px] sm:px-[40px] md:px-[60px] lg:px-[80px] 
    w-full 
    py-[16px] sm:py-[18px] lg:py-[21px] 
    text-[#0A0C0B] bg-[#EFFC76] 
    font-semibold 
    text-[16px] sm:text-[20px] lg:text-[24px] 
    leading-[20px] sm:leading-[24px] lg:leading-[28.8px] 
    rounded-2xl sm:rounded-2xl lg:rounded-3xl 
    z-[10]
    whitespace-nowrap
  "
              >
                <span className="hidden sm:inline">Verify This Property</span>
                <span className="sm:hidden">Verify Property</span>
              </button>

            </div>

            <div className='flex flex-col items-center gap-[24px] sm:gap-[32px] lg:gap-[40px] justify-center px-4 sm:px-6 lg:px-0'>
              <p className="pt-[24px] sm:pt-[28px] lg:pt-[32px] font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[21px] sm:leading-[24px] lg:leading-[27px] w-full sm:w-[350px] lg:w-[422px] text-center items-center text-white">
                Scan the QR code below to confirm this property&apos;s certification and authenticity.
              </p>

              {/* QR Code - responsive */}
              <div className='w-full max-w-[280px] sm:max-w-[350px] lg:max-w-[420px]'>
                <Image
                  src="/images/qr.png"
                  alt='QR code'
                  width={420}
                  height={301}
                  className='w-full h-auto'
                />
              </div>

              <Link href="/coming-soon">
                <p className='text-[#EFFC76] font-regular border-b border-b-[#EFFC76] text-[14px] sm:text-[16px]'>View Certificate</p>
              </Link>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5">

          {/* Verification Details Section */}
          <div className='flex flex-col gap-[32px] sm:gap-[38px] lg:gap-[45px] w-full lg:w-auto'>
            {verification.map((item, index) => (
              <div key={item.id}>
                <h2 className='font-semibold text-[20px] sm:text-[24px]  leading-[26px] sm:leading-[32px]  text-white'>
                  {item.value}
                </h2>
                <p className='pt-3 sm:pt-3.5 lg:pt-4 font-medium text-[18px] sm:text-[20px]  leading-[20px] sm:leading-[24px]  text-[#FFFFFFCC]'>
                  {item.title}
                </p>
                {/* Divider - responsive width */}
                {index !== verification.length - 1 && (
                  <div className='w-full sm:w-[350px] lg:w-[422px] h-[1px] bg-gradient-to-r from-[#121315] via-white to-[#121315] mt-[28px] sm:mt-[33px] lg:mt-[39px]'></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}