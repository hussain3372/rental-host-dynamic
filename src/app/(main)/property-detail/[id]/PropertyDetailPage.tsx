"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import StatusPill from "@/app/shared/StatusPills";
import { Property } from "@/app/api/user-flow/types";

interface PropertyDetailPageProps {
  property: Property;
}

export default function PropertyDetailPage({ property }: PropertyDetailPageProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const images = property.images && property.images.length > 0 
    ? property.images 
    : property.propertyDetails?.images && property.propertyDetails.images.length > 0
    ? property.propertyDetails.images
    : ["/images/empty.png"];

  const totalSteps = images.length;

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const getVariantFromStatus = (
    status: string
  ): "success" | "error" | "warning" | "info" | "default" => {
    switch (status) {
      case "ACTIVE":
      case "Verified":
        return "success";
      case "EXPIRED":
      case "Expired":
        return "error";
      case "PENDING":
      case "Near Expiry":
        return "warning";
      default:
        return "default";
    }
  };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric'
  //   });
  // };

  return (
    <div className="sm:pt-[80px] pt-0  px-4 sm:px-6 lg:px-[120px]">

      <nav className="py-3 mb-5 bg-transparent">
        <ol className="flex flex-wrap items-center gap-1 sm:gap-2 text-sm md:text-base">
          <li className="flex items-center">
            <Link
              href="/"
              className="text-[14px] sm:text-[16px] font-normal text-[#FFFFFF99] hover:text-[#EFFC76] transition-colors"
            >
              Home
            </Link>
          </li>

          <li className="flex items-center">
            <svg
              className="w-3 h-3 mx-1 text-gray-400 flex-shrink-0"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
            <Link
              href="/search-page"
              className="text-[14px] sm:text-[16px] font-normal text-[#FFFFFF99] hover:text-[#EFFC76] transition-colors whitespace-nowrap"
            >
              Certified Properties
            </Link>
          </li>

          <li className="flex items-center min-w-0 max-w-[200px] sm:max-w-none">
            <svg
              className="w-3 h-3 mx-1 text-gray-400 flex-shrink-0"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
            <p className="text-[12px] sm:text-[16px] font-normal text-white truncate">
              {property.name}
            </p>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-6 items-start sm:items-center">
        <h1 className="text-[35px] sm:text-[48px] font-medium text-white">
          {property.name}
        </h1>
        <StatusPill
          status={property.certificateStatus}
          variant={getVariantFromStatus(property.certificateStatus)}
        />
      </div>

      <p className="text-[#D5D5D5CC] pt-[25px] sm:pt-[16px] text-[24px]">
        {property.address}
        {property.city && `, ${property.city}`}
      </p>

      {/* Image Slider */}
      <div className="mt-8 sm:mt-12">
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden bg-gray-800">
          <Image
            src={images[currentStep]}
            alt={`${property.name} view ${currentStep + 1}`}
            width={1200}
            height={411}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/empty.png";
            }}
          />
        </div>
      </div>

      {/* Progress Navigation */}
      <div className="mt-8 pb-[40px] sm:pb-[80px]">
        <div className="flex items-center gap-[20px] sm:gap-[40px] w-full">
          {/* Left Arrow */}
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="w-10 h-10 rounded border border-gray-600 flex items-center justify-center hover:border-[#EFFC76] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image
              src="/images/left.png"
              alt="Previous"
              width={11}
              height={13}
            />
          </button>

          {/* Progress Line */}
          <div className="flex-1 flex items-center gap-[20px] sm:gap-[40px]">
            <div className="text-white opacity-60 text-lg font-medium">
              {String(currentStep + 1).padStart(2, "0")}
            </div>
            <div className="flex-1 relative h-[2px] bg-gray-600 rounded-full">
              <div
                className="absolute top-0 left-0 h-full bg-[#EFFC76] transition-all duration-500 rounded-full"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="text-white opacity-60 text-lg font-medium">
              {String(totalSteps).padStart(2, "0")}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextStep}
            disabled={currentStep === totalSteps - 1}
            className="w-10 h-10 rounded border border-gray-600 flex items-center justify-center hover:border-[#EFFC76] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image src="/images/right.png" alt="Next" width={11} height={13} />
          </button>
        </div>
      </div>

      {/* Property Description */}
      <p className="text-[#FFFFFFCC] text-[16px] sm:text-[24px] leading-[25px] sm:leading-[32px] font-medium text-justify">
        {property.description || `${property.name} at ${property.address} is a fully verified and certified property. This certified listing is guaranteed authentic and comes with a digital badge for instant checks. Featuring verified legal documentation, this property offers both luxury and peace of mind.`}
      </p>
    </div>
  );
}