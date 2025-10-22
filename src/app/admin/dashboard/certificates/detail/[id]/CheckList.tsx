import Image from 'next/image'
import React from 'react'



export default function Checklist() {
  const checklist = [
    "Fire safety measures in place", "Fire safety measures in place", "Fire safety measures in place", 
    "Fire safety measures in place", "Fire safety measures in place", "Fire safety measures in place"
  ]
  
  const identity = [
    {
      id:1,
      img:"/images/id.png",
      title:"Government-issued ID",
      size:"12.3kb",
    },
    {
      id:2,
      img:"/images/id.png",
      title:"Government-issued ID",
      size:"12.3kb",
    },
    {
      id:3,
      img:"/images/id.png",
      title:"Government-issued ID",
      size:"12.3kb",
    },
    {
      id:4,
      img:"/images/id.png",
      title:"Government-issued ID",
      size:"12.3kb",
    },
  ]

  return (
    <div className='pb-5 pt-[60px]'>
      {/* Notes Section - Add this above the Compliance Checklist */}
      

      <h3 className='font-semibold text-[16px] leading-[20px] tracking-normal pb-5'>Compliance Checklist</h3>
      <div className='pt-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full'>
        {checklist.map((items, index) => (
            <div key={index} className='py-[15px] pl-[12px]  text-white bg-gradient-to-b w-full from-[#202020] to-[#101010] border border-[#323232] rounded-lg'>
          <p  className='font-regular text-[14px] leading-[18px] tracking-normal '>
            {items}
          </p>
          </div>
        ))}
      </div>
      
        <h3 className='font-semibold text-[16px] pt-[60px] pb-5 leading-5 text-white'>Related Documents</h3>
      <div className="flex flex-col md:flex-row  gap-5">
        <div className='w-full'>
          <div className='rounded-lg w-full grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {identity.map((items) => (
              <div key={items.id} className='flex p-3 bg-[#121315] w-full items-center gap-5'>
                <Image src={items.img} alt='ID' width={100} height={60} />
                <div>
                  <h3 className='font-medium text-[12px] sm:text-[18px] leading-[16px] sm:leading-[22px] text-white xl:w-[353px]'>
                    {items.title}
                  </h3>
                  <h4 className='text-white/60 font-medium text-[16px] leading-[20px] pt-2'>{items.size}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      
      
      
    </div>
  )
}