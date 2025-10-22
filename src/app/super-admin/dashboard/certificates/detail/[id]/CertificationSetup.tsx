'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import Link from 'next/link'
import AddCertificateDrawer from '../../CertificateDrawer'


export default function CertificationSetup() {
    const [showCertificateDrawer, setShowCertificateDrawer] = useState(false);

    const handleOpenCertificateDrawer = (event?: React.MouseEvent) => {
      if (event) {
        event.stopPropagation();
      }
      setShowCertificateDrawer(true);
    };

    
  const handleCloseCertificateDrawer = () => {
    setShowCertificateDrawer(false);
  };

    // Handle edit certificate
 

    const Credentials = [
    {
      id:1,
      img:"/images/apartment.svg",
      val:"3325",
      title:"Associated Properties"
    },
    {
      id:2,
      img:"/images/p-app.svg",
      val:"August 01, 2024",
      title:"Issue Date"
    },
    {
      id:3,
      img:"/images/reject.svg",
      val:"August 01, 2025",
      title:"Expiry Date"
    },
    {
      id:4,
      img:"/images/approved.svg",
      val:"1 Year",
      title:"Validity"
    },
  ]

  return (
    <>    <div className='mb-10'>
        <nav
        className="flex py-3 mb-5   rounded-lg bg-transparent"
      >
        <ol className="inline-flex  items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <Link
              href="/super-admin/dashboard/certificates"
              className=" text-[12px] sm:text-[16px] font-regular leading-5 text-white/60 hover:text-[#EFFC76] "
            >
              Certification Setup
            </Link>
          </li>

              <Image src="/images/greater.svg" alt='Greater' height={16} width={16} />
          <li aria-current="page">
              <p className="text-[12px] sm:text-[16px] leading-5 font-regular text-white">
               Hotel Safety Compliances
              </p>
          </li>
        </ol>
      </nav>
        <div className="flex  gap-3 sm:gap-0 justify-between items-start">
          <div>

        <h2 className=' text-[16px] sm:text-[24px] font-medium leading-[28px] '>Hotel Safety Compliances</h2>
        <p className='pt-2 text-[12px] sm:text-[16px] font-regular leading-5 text-[#FFFFFFCC]'>Property Type: Hotel</p>
          </div>
            <button onClick={ handleOpenCertificateDrawer } className='text-[#EFFC76] cursor-pointer underline font-regular text-[16px] leading-5'>Edit</button>
        </div>


      <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-4 gap-3 pt-[38px]  flex-wrap lg:flex-nowrap justify-between">
                    { Credentials.map((item)=>(
                      <div key={item.id} className="gap-3">
                        <div className="flex items-center bg-[#121315] rounded-xl gap-4 p-5">
                        <Image src={item.img} alt={item.title} width={48} height={48} />
                        <div>
                        <h2 className="font-medium text-[18px] leading-[22px] text-white">{item.val}</h2>
                        <p className="text-white/80 font-regular text-[14px] leading-[18px] pt-2">{item.title}</p>
                        </div>
                        </div>
                      </div>
                    )) }
                  </div>
    </div>
      {showCertificateDrawer && (
        <div className="fixed inset-0 z-[9000] flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseCertificateDrawer}
          ></div>
          <div className="relative ml-auto h-full">
            <AddCertificateDrawer
              onClose={handleCloseCertificateDrawer}
              isOpen={showCertificateDrawer}
            />
          </div>
        </div>
      )}
    </>

  )
}