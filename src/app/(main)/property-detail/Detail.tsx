import React, { useState } from 'react';
import Image from 'next/image';

export default function Detail() {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Array of images - replace with your actual image paths
  const images = [
    "/images/slide1.png",
    "/images/slide1.png",
    "/images/slide1.png",
    "/images/slide1.png",
    "/images/slide1.png"
  ];
  
  const totalSteps = images.length;

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className='pt-[168px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 '>
      {/* Breadcrumb */}
      <div className="flex gap-[12px] items-center pb-[40px] flex-wrap">
        <p className='font-regular text-[12px] sm:text-[16px] leading-[20px] text-center text-white opacity-60'>Home</p>
        <Image src="/images/greater.png" alt='greater' width={16} height={16} className='w-[16px] h-[16px]'/>
        <p className='font-regular text-[12px] sm:text-[16px] leading-[20px] text-center text-white opacity-60'>Certified Properties</p>
        <Image src="/images/greater.png" alt='greater' width={16} height={16} className='w-[16px] h-[16px]'/>
        <p className='font-regular text-[12px] sm:text-[16px] leading-[20px] text-center text-white'>Coastal Hillside Estate</p>
      </div>
             
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between gap-6 items-start sm:items-center'>
        <h1 className='font-medium text-[35px] sm:text-[48px] leading-[40px] sm:leading-[57px] text-white'>
          Coastal Hillside Estate with Panoramic City
        </h1>
        <span className='text-[#EFFC76] bg-[#2d2d2d] rounded-full font-medium text-[18px] leading-[22px] py-[12px] px-[16px] text-center flex-shrink-0'>
          Verified
        </span>
      </div>
             
      <p className='text-[#D5D5D5CC] pt-[25px] sm:pt-[16px] text-[24px] leading-[28px]'>
        742 Evergreen Terrace, Springfield, Illinois, USA
      </p>

      {/* Image Display Section */}
      <div className="mt-8 sm:mt-12">
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-gray-800">
          <Image 
            src={images[currentStep]} 
            alt={`Property view ${currentStep + 1}`}
            width={1200}
            height={411}
            className="w-full h-full object-cover transition-opacity duration-500"
            onError={(e) => {
  // Fallback if image doesn't exist
  const target = e.target as HTMLImageElement;
  target.src = `https://via.placeholder.com/800x500/2d2d2d/EFFC76?text=Property+Image+${currentStep + 1}`;
}}
          />
        </div>
      </div>
             
      {/* Progress Navigation - Exact Layout from Screenshot */}
      <div className="mt-8 pb-[40px] sm:pb-[80px]">
        <div className="flex items-center gap-[20px] sm:gap-[40px] w-full">
          {/* Left Arrow Button */}
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="w-10 h-10 rounded border border-gray-600 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:cursor-not-allowed hover:border-[#EFFC76] flex-shrink-0"
          >
            <Image  src="/images/left.png" alt="Previous" width={11} height={13} />
          </button>

          {/* Progress Section */}
          <div className="flex-1 flex items-center gap-[20px] sm:gap-[40px]">
            {/* Step Numbers */}
            <div className="text-white opacity-60 text-lg font-medium flex-shrink-0">
              {String(currentStep + 1).padStart(2, "0")}
            </div>
            
            {/* Progress Line */}
            <div className="flex-1 relative h-[2px] bg-gray-600 rounded-full">
              <div
                className="absolute top-0 left-0 h-full bg-[#EFFC76] transition-all duration-500 rounded-full"
                style={{
                  width: `${((currentStep + 1) / totalSteps) * 100}%`,
                }}
              ></div>
            </div>

            {/* Total Steps */}
            <div className="text-white opacity-60 text-lg font-medium flex-shrink-0">
              {String(totalSteps).padStart(2, "0")}
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={nextStep}
            disabled={currentStep === totalSteps - 1}
            className="w-10 h-10 rounded border border-gray-600 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:cursor-not-allowed hover:border-[#EFFC76] flex-shrink-0"
          >
                        <Image  src="/images/right.png" alt="Previous" width={11} height={13} />

          </button>
        </div>
      </div>
      <p className="font-medium text-[16px] leading-[25px] sm:text-[24px] sm:leading-[32px] text-white opacity-80"> The Grand Oak Residence at 1234 Maplewood Avenue, Austin, Texas is a fully verified and certified property. Featuring 4 bedrooms, 3 bathrooms, and a modern kitchen, this home combines comfort with trust. With a landscaped garden, private patio, and verified legal documentation, it offers both luxury and peace of mind. Each listing comes with a digital badge and QR code for instant authenticity checks.</p>
    </div>
  );
}