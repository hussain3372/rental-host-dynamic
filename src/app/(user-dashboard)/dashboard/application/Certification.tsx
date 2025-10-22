import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
export default function Certification() {
  return (
    <div>
       <div className='bg-[#EFFC76] pt-5 px-5 rounded-3xl  mx-auto text-black flex flex-col xl:flex-row  justify-between !items-center md:items-start overflow-hidden '>
        {/* Content Section */}
        <div className='p-2 sm:p-0 flex-1 space-y-2 sm:space-y-3'>
          <h3 className="font-bold text-[16px] sm:text-[28px] leading-[20px] sm:leading-[32px] ">
            Ready for your next property certification?
          </h3>
          <p className='text-[12px] sm:text-[16px] font-medium leading-[20px]'>
            Start your certification application today and keep your properties verified.
          </p>
          <Link href="/listing">
            <button className="mt-[48px]  cursor-pointer shadow-2xl shadow-black font-semibold leading-[20px] text-[16px] sm:mt-8 lg:mt-10 bg-black text-[#c4c4c4] px-[20px] py-[11px] rounded-lg transition-colors duration-200">
              Apply Now
            </button>
          </Link>
        </div>
        
        
        {/* Image Section - Maintains natural dimensions */}
          <Image 
            src="/images/design4.png" 
            alt='design' 
            width={154}
            height={154}
            className='sm:mt-[-106px] hidden sm:block'
            
          />
          <Image 
            src="/images/design3.png" 
            alt='design' 
            width={242}
            height={242}
            className='mt-5'
            
          />
      </div>
    </div>
  )
}
