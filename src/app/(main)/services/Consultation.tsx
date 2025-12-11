import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
export default function Consultation() {
  return (
    <div className='max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[60px]  sm:pb-[80px] py-9 sm:py-20'>
      <div className='bg-[#EFFC76] pr-3 rounded-3xl  mx-auto text-black flex flex-col xl:flex-row  justify-between !items-center md:items-start overflow-hidden '>
        
        <div className='p-8  sm:p-12 md:p-16 lg:p-[44px] flex-1'>
          <h3 className="font-medium text-2xl text-nowrap  sm:text-3xl md:text-4xl lg:text-[48px] leading-tight lg:leading-[56px] max-w-[594px]">
           Every Consulting   <br /> Engagement is  <br /> Customized
          </h3>
          <p className='max-w-[444px] font-medium text-sm sm:text-base md:text-lg lg:text-[18px] leading-relaxed lg:leading-[22px] pt-4 sm:pt-6 lg:pt-[32px] opacity-60'>
Share your project details and we’ll prepare a tailored quote based on your needs.        </p>
          <Link href="/auth/signup">
            <button className="mt-[20px] cursor-pointer shadow-2xl shadow-black font-semibold text-[18px] sm:mt-6 lg:mt-8 bg-black text-[#c4c4c4] px-[20px] py-[11px] rounded-lg transition-colors duration-200">
            Schedule a Consultation
            </button>
          </Link>
        </div>
        
        
         <div className='flex-shrink-0 relative'>
          <Image 
            src="/images/design.png" 
            alt='design' 
            width={600}
            height={600}
            className='w-auto h-auto max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] object-contain'
            style={{
              maxHeight: 'none', 
              width: 'auto',     
            }}
          />
        </div>
      </div>
    </div>
  );
}