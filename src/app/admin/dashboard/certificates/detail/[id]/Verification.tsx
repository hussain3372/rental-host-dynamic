import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Verification() {
  const verification = [
    {
      id: "0",
      value: "Active",
      title: "Status",
    },
    {
      id: "1",
      value: "CER - 8765",
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
    <div className="pt-[40px] pb-[41px]">
      <div className="flex justify-between items-center ">
        <h2 className='font-semibold text-[16px] leading-5'>Certificate Details</h2>
        <p className='font-medium text-[18px]leading-[22px] text-[#EFFC76CC] underline'>Add Note</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-[20px] max-w-[100%] pt-5">
        <div className="col-span-12 lg:col-span-7 sm:mr-[25px] mr-0">

          <div className='bg-[#121315] rounded-lg max-h-none pb-[20px] w-full '>
           
            <div className='flex flex-col items-center gap-2 justify-center px-4 sm:px-6 lg:px-0'>
                <h2 className='font-semibold pt-[20px] text-[24px] text-center leading-[28px]'>Certificate</h2>
              <p className=" font-medium text-[12px] sm:text-[16px] leading-[20px] w-full max-w-[352px] text-center items-center text-white/40">
                Scan the QR code below to confirm this property&apos;s certification and authenticity.
              </p>
            </div>

              {/* QR Code - responsive */}
              <div className='flex flex-col items-center justify-center pt-[28px] gap-[28px]'>
              <div className='w-full max-w-[280px] sm:max-w-[350px] lg:max-w-[420px]'>
                <Image
                  src="/images/qr1.png"
                  alt='QR code'
                  width={331}
                  height={237}
                  className='w-full h-auto'
                />
              </div>

              <Link href="/docs/certificates.pdf" target='_blank'>
                <p className='text-[#EFFC76] font-regular underline text-[20px] leading-[24px]'>View Certificate</p>
              </Link>
          </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5">

          {/* Verification Details Section */}
          <div className='flex flex-col bg-[#121315] rounded-md p-5 gap-[28px] w-full lg:w-auto'>
            {verification.map((item, index) => (
              <div key={item.id}>
                <h2 className='font-semibold text-[12px] pt-3 sm:text-[18px]  leading-[18px] sm:leading-[22px]  text-white'>
                  {item.value}
                </h2>
                <p className='pt-[18px] font-regular text-[16px] leading-[20px]  text-white/80'>
                  {item.title}
                </p>
                {/* Divider - responsive width */}
                {index !== verification.length - 1 && (
                  <div className='w-full sm:max-w-[350px] lg:max-w-[386px] h-[1px] bg-gradient-to-r from-[#121315] via-white to-[#121315] mt-[26px]'></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}