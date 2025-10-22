import Image from 'next/image'
import React from 'react'

export default function Checklist() {
  const verification = [
    {
      id: "0",
      value: "Lorem Ipsum",
      title: "Property Type",
    },
    {
      id: "1",
      value: "Manager",
      title: "Ownership",
    },
    {
      id: "2",
      value: "Aug 12, 2024",
      title: "Submission Date",
    },
    {
      id: "3",
      value: "Pending",
      title: "Status",
    },
  ]

  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "file.png"; // file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className=' pb-5'>
      <h3 className='font-semibold text-[16px] leading-[20px] tracking-normal'>Compliance Checklist</h3>
      <div className='pt-3 flex flex-col md:flex-row gap-3'>
        <p className='font-regular text-[14px] leading-[18px] tracking-normal py-[15px] pl-[12px] w-full   text-white bg-gradient-to-b from-[#202020] to-[#101010] border border-[#323232] rounded-lg'>Fire safety measures in place</p>
        <p className='font-regular text-[14px] leading-[18px] tracking-normal py-[15px] pl-[12px] w-full   text-white bg-gradient-to-b from-[#202020] to-[#101010] border border-[#323232] rounded-lg'>Fire safety measures in place</p>
        <p className='font-regular text-[14px] leading-[18px] tracking-normal py-[15px] pl-[12px] w-full  text-white bg-gradient-to-b from-[#202020] to-[#101010] border border-[#323232] rounded-lg'>Fire safety measures in place</p>
      </div>
      <div className="flex flex-col md:flex-row pt-[60px] gap-5">
        <div className="flex flex-col gap-[16px] flex-1 p-5 bg-black">
          {verification.map((item, index) => (
            <div key={item.id}>
              <h2 className='font-semibold text-[18px] leading-[22px]  text-white'>
                {item.value}
              </h2>
              <p className='pt-3 sm:pt-3.5 lg:pt-4 font-medium text-[16px] leading-[20px]  text-white/60'>
                {item.title}
              </p>
              {/* Divider - responsive width */}
              {index !== verification.length - 1 && (
                <div className='w-full  h-[1px] bg-gradient-to-r from-[#121315] via-white to-[#121315] mt-[16px]'></div>
              )}
            </div>
          ))}
        </div>
        <div className='flex flex-col gap-3 '>
          <div className='bg-[#121315] p-3 rounded-lg flex items-center justify-between'>
            <div className='flex items-center gap-5'>
              <Image src="/images/id.png" alt='ID' width={100} height={60} />
              <div>
                <h3 className='font-medium text-[12px] sm:text-[18px] leading-[16px] sm:leading-[22px] text-white xl:w-[353px]'>
                  Government-issued ID
                </h3>
                <h4 className='text-white/60 font-medium text-[16px] leading-[20px] pt-2'>12.3kb</h4>
              </div>
            </div>

            <button onClick={() => handleDownload("/images/id.png")} className='cursor-pointer'>
              <Image
                src="/images/download.svg"
                alt='download'
                width={40}
                height={40}
                className="max-w-none h-auto inline-block"
              />
            </button>
          </div>

          <div className='bg-[#121315] p-3 rounded-lg flex items-center justify-between'>
            <div className='flex items-center gap-5'>
              <Image src="/images/id.png" alt='ID' width={100} height={60} />
              <div>
                <h3 className='font-medium text-[12px] sm:text-[18px] leading-[16px] sm:leading-[22px] text-white xl:w-[353px]'>
                  Government-issued ID
                </h3>
                <h4 className='text-white/60 font-medium text-[16px] leading-[20px] pt-2'>12.3kb</h4>
              </div>
            </div>

            {/* Right side: Button */}
            <button onClick={() => handleDownload("/images/id.png")} className='cursor-pointer'>
              <Image
                src="/images/download.svg"
                alt='download'
                width={40}
                height={40}
                className="max-w-none h-auto inline-block"
              />
            </button>
          </div>


          <div className='bg-[#121315] p-3 rounded-lg flex items-center justify-between'>
            <div className='flex items-center gap-5'>
              <Image src="/images/id.png" alt='ID' width={100} height={60} />
              <div>
                <h3 className='font-medium text-[12px] sm:text-[18px] leading-[16px] sm:leading-[22px] text-white xl:w-[353px]'>
                  Government-issued ID
                </h3>
                <h4 className='text-white/60 font-medium text-[16px] leading-[20px] pt-2'>12.3kb</h4>
              </div>
            </div>

            {/* Right side: Button */}
            <button onClick={() => handleDownload("/images/id.png")} className='cursor-pointer'>
              <Image
                src="/images/download.svg"
                alt='download'
                width={40}
                height={40}
                className="max-w-none h-auto inline-block"
              />
            </button>
          </div>
          <div className='bg-[#121315] p-3 rounded-lg flex items-center justify-between'>
            <div className='flex items-center gap-5'>
              <Image src="/images/id.png" alt='ID' width={100} height={60} />
              <div>
                <h3 className='font-medium text-[12px] sm:text-[18px] leading-[16px] sm:leading-[22px] text-white xl:w-[353px]'>
                  Government-issued ID
                </h3>
                <h4 className='text-white/60 font-medium text-[16px] leading-[20px] pt-2'>12.3kb</h4>
              </div>
            </div>

            <button onClick={() => handleDownload("/images/id.png")} className='cursor-pointer'>
              <Image
                src="/images/download.svg"
                alt='download'
                width={40}
                height={40}
                className="max-w-none h-auto inline-block"
              />
            </button>
          </div>


        </div>
      </div>
    </div>
  )
}
