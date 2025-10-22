"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { ApplicationData } from "@/app/api/Host/application/types";

interface DetailProps {
  application: ApplicationData;
}

export default function ApplicationDetail({ application }: DetailProps) {
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const [thumbnailsHeight, setThumbnailsHeight] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (thumbnailsContainerRef.current) {
        const height = thumbnailsContainerRef.current.offsetHeight;
        setThumbnailsHeight(height);
      }
    };

    if (application) {
      setTimeout(updateHeight, 100);
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }
  }, [application]);

  // Get images from application data or use fallbacks - FIXED
  const images = application.propertyDetails?.images && application.propertyDetails.images.length > 0 
    ? application.propertyDetails.images 
    : [
        "/images/property-placeholder-1.jpg",
        "/images/property-placeholder-2.jpg",
        "/images/property-placeholder-3.jpg",
      ];
  
  const totalSteps = images.length;

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="text-white">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <div className="flex items-center text-[12px] sm:text-[16px] gap-3 font-regular leading-[20px] text-white/40 ">
          <Link href="/dashboard/application" className="hover:text-[#EFFC76]">
            My Applications
          </Link>
          <Image
            src="/images/greater.svg"
            alt="linked"
            width={16}
            height={16}
          />
          <span className="text-white font-regular text-[12px] sm:text-[16px] leading-[20px] ">
            {application.propertyDetails?.propertyName || "Application Detail"}
          </span>
        </div>
      </nav>

      <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
        <h1 className="text-[16px] sm:text-[24px] font-medium leading-[28px] ">
          {application.propertyDetails?.propertyName || "Untitled Property"}
        </h1>
        <button className="text-[#EFFC76] opacity-80 hover:text-[#e8f566] underline cursor-pointer font-medium text-[12px] sm:text-[18px] leading-[22px] ">
          Edit
        </button>
      </div>

      <p className="text-white/80 font-medium leading-[20px] text-[12px] sm:text-[16px] mb-[18px]">
        {application.propertyDetails?.address || "Address not available"}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="w-full flex flex-col">
          {/* Main Image - Desktop */}
          <div
            className={`
              relative w-full rounded-lg overflow-hidden bg-gray-900
              ${thumbnailsHeight ? "hidden sm:block" : ""} 
            `}
            style={{ height: thumbnailsHeight || "auto" }}
          >
            <Image
              src={images[currentStep]}
              alt={`Property view ${currentStep + 1}`}
              fill
              className="object-cover"
              priority={currentStep === 0}
            />
          </div>

          {/* Main Image - Mobile */}
          <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-gray-900 sm:hidden">
            <Image
              src={images[currentStep]}
              alt={`Property view ${currentStep + 1}`}
              fill
              className="object-cover"
              priority={currentStep === 0}
            />
          </div>
        </div>

        {/* Thumbnails */}
        <div
          ref={thumbnailsContainerRef}
          className="w-full max-w-[300px] sm:w-[145px] max-h-full flex flex-wrap justify-between gap-3 sm:flex-col sm:justify-center sm:items-center"
        >
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative aspect-[16/10] w-full sm:max-w-[145px] rounded-md overflow-hidden cursor-pointer border-2 ${
                currentStep === index ? "border-[#EFFC76]" : "border-transparent"
              }`}
            >
              <Image
                onClick={() => setCurrentStep(index)}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover hover:opacity-80 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-6 gap-3 sm:gap-[40px] w-full">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="w-8 h-8 p-2 cursor-pointer rounded border border-gray-600 flex items-center justify-center hover:border-[#EFFC76] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <Image src="/images/left.svg" alt="back" width={24} height={24} />
        </button>

        <div className="flex items-center gap-3 sm:gap-10 flex-1">
          <span className="text-white/60 leading-[20px] font-regular text-[16px] flex-shrink-0">
            {String(currentStep + 1).padStart(2, "0")}
          </span>
          <div className="w-full h-[1px] bg-white/20 relative">
            <div
              className="absolute top-0 left-0 h-full bg-[#EFFC76] transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
          <span className="text-sm text-white/60 leading-[20px] font-regular text-[16px] flex-shrink-0">
            {String(totalSteps).padStart(2, "0")}
          </span>
        </div>

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
        <p className="text-white/80 font-normal text-[16px] sm:text-[18px] tracking-[0%] leading-[22px] text-justify">
          {application.propertyDetails?.description ||
            `${
              application.propertyDetails?.propertyName || "This property"
            } at ${
              application.propertyDetails?.address || "this location"
            } is currently in ${application.status} status. Featuring ${
              application.propertyDetails?.bedrooms || "N/A"
            } bedrooms, ${
              application.propertyDetails?.bathrooms || "N/A"
            } bathrooms, and can accommodate up to ${
              application.propertyDetails?.maxGuests || "N/A"
            } guests. The application is currently at the ${
              application.currentStep
            } step.`}
        </p>
      </div>
    </div>
  );
}