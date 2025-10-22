"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { allProperties } from "@/app/(main)/search-page/data/properties";
import AdminDrawer from "../../AddAdminDrawer";
import { Modal } from "@/app/shared/Modal";

export default function ApplicationDetail() {
  const { id } = useParams();
  const applicationId = Number(id);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
    const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);
    const [ openConfirm , setOpenConfirm ] = useState(false);

  const [thumbnailsHeight, setThumbnailsHeight] = useState(0);

  // Get property by ID (using the existing properties data)
  const application = allProperties.find((property) => property.id === applicationId);

  const [currentStep, setCurrentStep] = useState(0);

  const confirm = ()=>{
    // window.location.href="/super-admin/dashboard/applications";
    setOpenConfirm(false)
  }
  const openDrawer = ()=>{setIsAdminDrawerOpen(true)}
  // Effect to sync heights
  useEffect(() => {
    const updateHeight = () => {
      if (thumbnailsContainerRef.current) {
        const height = thumbnailsContainerRef.current.offsetHeight;
        setThumbnailsHeight(height);
      }
    };

    // Initial measurement
    updateHeight();

    // Update on window resize
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, [application]); // Re-run when application changes

  // If application not found
  if (!application) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center flex flex-col items-center justify-center">
          <Image src="/images/empty.png" alt='not found' width={220} height={220} />
          <h1 className="text-2xl mb-3 text-white font-medium leading-[28px]">No Applications Yet</h1>
          <p className="text-white/60 mb-6 max-w-[504px] font-regular text-[18px] leading-[22px]">Start your first application today to begin the process of certifying your property and tracking progress here.</p>
          <Link
            href="/dashboard/application"
            className="inline-block yellow-btn w-[150px] text-black px-6 py-3 rounded-lg hover:bg-[#e8f566] transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </div>
    );
  }

  const images = application.images || [];
  const totalSteps = images.length;

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <>
    <div className=" text-white">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <div className="flex items-center text-[12px] sm:text-[16px] gap-3 font-regular leading-[20px] text-white/40 ">
          <Link href="/super-admin/dashboard/applications" className="hover:text-[#EFFC76]">
            My Applications
          </Link>
          <Image src="/images/greater.svg" alt="linked" width={16} height={16} />
          <span className="text-white font-regular text-[12px] sm:text-[16px] leading-[20px] ">{application.title}</span>
        </div>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
        <h1 className=" text-[16px] sm:text-[24px] font-medium leading-[28px] ">
          Coastal Hillside Estate with Panoramic City
        </h1>
        <button onClick={openDrawer} className="text-[#EFFC76CC]  hover:text-[#e8f566] underline cursor-pointer font-medium text-[12px] sm:text-[18px] leading-[22px] ">
          Assign admin
        </button>
      </div>

      {/* Address */}
      <p className="text-white/80 font-regular leading-[20px] text-[12px] sm:text-[16px]  mb-[18px]">
        742 Evergreen Terrace, Springfield, Illinois, USA
      </p>

      {/* Main Content Area */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Main Image Container - Height synced with thumbnails */}
        <div className=" w-full flex flex-col">
          <div
            className={`
    relative w-full rounded-lg overflow-hidden bg-gray-900
    ${thumbnailsHeight ? "hidden sm:block" : ""} 
  `}
            style={{ height: thumbnailsHeight || "auto" }}
          >
            {/* Desktop/Tablet → Height synced */}
            <Image
              src={images[currentStep] || "/images/placeholder.jpg"}
              alt={`Property view ${currentStep + 1}`}
              fill
              className="object-cover"
            />
          </div>

          {/* Mobile → Aspect ratio */}
          <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-gray-900 sm:hidden">
            <Image
              src={images[currentStep] || "/images/placeholder.jpg"}
              alt={`Property view ${currentStep + 1}`}
              fill
              className="object-cover"
            />
          </div>


          {/* Navigation Controls - Full width progress bar */}
        </div>

        {/* Thumbnail Gallery - Reference for height measurement */}
        <div
          ref={thumbnailsContainerRef}
          className="  w-full sm:max-w-[300px] 
    sm:w-[145px] max-h-full 
    flex  justify-between gap-3 
    sm:flex-col sm:justify-center sm:items-center"
        >
          {images.map((image, index) => (

            <div key={index} className="relative aspect-[16/10] w-full sm:max-w-[145px]]">
              <Image
                onClick={() => setCurrentStep(index)}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover rounded-md cursor-pointer"
              />
            </div>

          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 gap-3 sm:gap-[40px] w-full">
        {/* Left Arrow */}
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="w-8 h-8 p-2 cursor-pointer rounded border border-gray-600 flex items-center justify-center hover:border-[#EFFC76] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <Image src="/images/left.svg" alt="back" width={24} height={24} />
        </button>

        {/* Progress Bar - Takes all remaining space */}
        <div className="flex items-center gap-3 sm:gap-10 flex-1 ">
          <span className=" text-white/60 leading-[20px] font-regular text-[16px]  flex-shrink-0">
            {String(currentStep + 1).padStart(2, "0")}
          </span>

          {/* Progress Bar - Full available width */}
          <div className="w-full h-[1px] bg-white/20 relative ">
            <div
              className="absolute top-0 left-0 h-full bg-[#EFFC76] transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>

          <span className="text-sm text-white/60 leading-[20px] font-regular text-[16px]  flex-shrink-0">
            {String(totalSteps).padStart(2, "0")}
          </span>
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextStep}
          disabled={currentStep === totalSteps - 1}
          className="w-8 h-8 rounded cursor-pointer p-2 border border-gray-600 flex items-center justify-center hover:border-[#EFFC76] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <Image src="/images/right.svg" alt="back" width={24} height={24} />

        </button>
      </div>
      {/* Description */}
      <div className="mt-[60px] max-w-[1134px]">
        <p className="text-[#FFFFFFCC] font-regular text-[18px] sm:text-[18px] tracking-[0%] leading-[22px] text-justify">
          {application.title} at 1234 Maplewood Avenue, Austin, Texas is a fully verified
          and certified property. Featuring 4 bedrooms, 3 bathrooms, and a modern kitchen,
          this home combines comfort with trust. With a landscaped garden, private patio,
          and verified legal documentation, it offers both luxury and peace of mind. Each
          listing comes with a digital badge and QR code for instant authenticity checks.
        </p>
      </div>

    </div>
    <div
        className={`fixed inset-0 z-[2000] bg-black/40 transition-opacity duration-300 ${
          isAdminDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsAdminDrawerOpen(false)}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full z-[2000] max-w-[70vw] md:max-w-[608px] bg-[#101010]  transform transition-transform duration-300 ease-in-out ${
          isAdminDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <AdminDrawer onClose={() => {setIsAdminDrawerOpen(false); setOpenConfirm(true)}} />
      </div>
       {
        openConfirm && 
        <Modal
          isOpen={openConfirm} 
          onClose={() => setOpenConfirm(false)} 
          onConfirm={confirm}
          image="/images/assignment.png"
          title="Application Assigned Successfully!"
          description="You have successfully assigned an application to the admin “Sarah Kim”."
          confirmText="Back To Applications"
        />
      }
    </>
  );
}