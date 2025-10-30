
import Image from 'next/image'
import React from 'react'
import { Certification } from '@/app/api/Admin/certificate/types'

interface ChecklistProps {
  certificate: Certification;
}

export default function Checklist({ certificate }: ChecklistProps) {
  if (!certificate) {
    return null;
  }

  // Mock checklist data - in real app, this would come from API
  const checklist = [
    "Fire safety measures in place",
    "Building code compliance verified", 
    "Electrical systems certified",
    "Plumbing systems inspected",
    "Structural integrity confirmed",
    "Emergency exits properly marked"
  ]

  // Mock document data - in real app, this would come from API
  const documents = [
    {
      id: 1,
      img: "/images/id.png",
      title: "Property Ownership Document",
      size: "2.3MB",
    },
    {
      id: 2,
      img: "/images/id.png", 
      title: "Safety Compliance Certificate",
      size: "1.8MB",
    },
    {
      id: 3,
      img: "/images/id.png",
      title: "Building Inspection Report",
      size: "3.1MB",
    },
    {
      id: 4,
      img: "/images/id.png",
      title: "Insurance Documentation",
      size: "1.5MB",
    },
  ]

  // Hide entire section if no checklist items or documents
  if ((!checklist || checklist.length === 0) && (!documents || documents.length === 0)) {
    return null;
  }

  return (
    <div className='pb-5 pt-[60px]'>
      {/* Compliance Checklist Section - Only show if there are checklist items */}
      {checklist && checklist.length > 0 && (
        <>
          <h3 className='font-semibold text-[16px] leading-[20px] tracking-normal pb-5'>Compliance Checklist</h3>
          <div className='pt-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full'>
            {checklist.map((item, index) => (
              <div key={index} className='py-[15px] pl-[12px] text-white bg-gradient-to-b w-full from-[#202020] to-[#101010] border border-[#323232] rounded-lg'>
                <p className='font-regular text-[14px] leading-[18px] tracking-normal'>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Related Documents Section - Only show if there are documents */}
      {documents && documents.length > 0 && (
        <>
          <h3 className='font-semibold text-[16px] pt-[60px] pb-5 leading-5 text-white'>Related Documents</h3>
          <div className="flex flex-col md:flex-row gap-5">
            <div className='w-full'>
              <div className='rounded-lg w-full grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {documents.map((item) => (
                  <div key={item.id} className='flex p-3 bg-[#121315] w-full items-center gap-5'>
                    <Image src={item.img} alt='Document' width={100} height={60} />
                    <div>
                      <h3 className='font-medium text-[12px] sm:text-[18px] leading-[16px] sm:leading-[22px] text-white xl:w-[353px]'>
                        {item.title}
                      </h3>
                      <h4 className='text-white/60 font-medium text-[16px] leading-[20px] pt-2'>{item.size}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}