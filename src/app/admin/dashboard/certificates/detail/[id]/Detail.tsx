"use client";
import Link from "next/link"; 
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Certification } from "@/app/api/Admin/certificate/types";
import Dropdown from "@/app/shared/Dropdown";
import { certificateApi } from "@/app/api/Admin/certificate";

interface DetailProps {
  certificate: Certification;
}

type CertificateStatus = "ACTIVE" | "REVOKED" | "EXPIRED" | "expire";
export type StatusAction = "expire" | "revoke" | "active" | "renew";

export default function Detail({ certificate: initialCertificate }: DetailProps) {
  const [certificate, setCertificate] = useState<Certification>(initialCertificate);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get display status
  const getDisplayStatus = (status: CertificateStatus): string => {
    const statusMap: Record<CertificateStatus, string> = {
      ACTIVE: "Active",
      REVOKED: "Revoked",
      EXPIRED: "Expired",
      expire: "Expired" // Changed from "expire" to "Expired"
    };
    return statusMap[status] || status;
  };

  const [selectedStatus, setSelectedStatus] = useState(getDisplayStatus(certificate.status as CertificateStatus));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const images = certificate.application.propertyDetails.images || [];
  const totalSteps = images.length;

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleStatusChange = async (action: StatusAction, displayLabel: string) => {
  setIsUpdating(true);
  setError(null);
  setIsDropdownOpen(false);

  try {
    // 👇 Map "renew" → "active" for backend
   // 👇 Call correct endpoint based on action
const endpointAction =
  action === "renew" ? "renew" : action;

const response = await certificateApi.updateCertificateStatus(
  certificate.id,
  endpointAction as "revoke" | "active" | "expire" 
);


    // Update only the status from response, keep all other data
    if (response.data) {
      setCertificate(prevCertificate => ({
        ...prevCertificate,
       status: response.data.status || 
       (action === "renew" ? "RENEW" : 
        action === "revoke" ? "REVOKED" : 
        action === "expire" ? "EXPIRED" : prevCertificate.status)
,
      }));
      setSelectedStatus(displayLabel);
    }
  } catch (err) {
    console.error("Error updating certificate status:", err);
    setError("Failed to update certificate status");
  } finally {
    setIsUpdating(false);
  }
};


  // Get available status options based on current status
  const getStatusOptions = () => {
    const currentStatus = certificate.status as CertificateStatus;
    
    switch (currentStatus) {
      case "ACTIVE":
        return [
          { label: "Revoke", onClick: () => handleStatusChange("revoke", "Revoked") },
          { label: "Mark Expired", onClick: () => handleStatusChange("expire", "Expired") } // Changed label
        ];
      
      case "REVOKED":
        return []; // No options for revoked status
      
      case "EXPIRED":
  return [
    { label: "Active", onClick: () => handleStatusChange("renew", "Active") }
  ];

      
      case "expire":
        return [
          { label: "Revoke", onClick: () => handleStatusChange("revoke", "Revoked") }, 
          { label: "Renew", onClick: () => handleStatusChange("renew", "Renew") }
        ];
      
      default:
        return [
          { label: selectedStatus, onClick: () => {} }
        ];
    }
  };

  const statusOptions = getStatusOptions();
  
  // Check if dropdown should be disabled
  const isDropdownDisabled = certificate.status === "REVOKED" || statusOptions.length === 0;

  const Credentials = [
    {
      id: 1,
      img: "/images/apartment.svg",
      val: certificate.application.propertyDetails.propertyType,
      title: "Property Type"
    },
    {
      id: 2,
      img: "/images/manager.svg",
      val: certificate.application.propertyDetails.ownership,
      title: "Ownership"
    },
    {
      id: 3,
      img: "/images/date.svg",
      val: new Date(certificate.issuedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      title: "Issued On"
    },
    {
      id: 4,
      img: "/images/pending.svg",
      val: getDisplayStatus(certificate.status as CertificateStatus),
      title: "Status"
    },
  ];

  return (
    <div className="">
      <nav
        className="flex py-3 mb-5 text-gray-200 rounded-lg bg-transparent"
        aria-label="Breadcrumb"
      >
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <Link
              href="/admin/dashboard/certificates"
              className="text-[16px] font-regular leading-5 text-white/60 hover:text-[#EFFC76] md:ms-2"
            >
              Certificates
            </Link>
          </li>

          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="rtl:rotate-180 w-3 h-3 mx-1 text-gray-400"
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
              <p className="text-[16px] leading-5 font-regular text-white">
                {certificate.certificateNumber}
              </p>
            </div>
          </li>
        </ol>
      </nav>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
          {error}
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-0 justify-between">
        <div>
          <h1 className="text-[24px] font-medium leading-[28px] text-white">
            {certificate.application.propertyDetails.propertyName}
          </h1>
          <p className="text-white/60 text-[16px] pt-[8px] leading-5 font-regular">
            {certificate.application.propertyDetails.address}
          </p>
        </div>
        
        {/* Status Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => !isUpdating && !isDropdownDisabled && setIsDropdownOpen(!isDropdownOpen)}
            disabled={isUpdating || isDropdownDisabled}
            className={`bg-[#2D2D2D] py-3 px-4 min-w-[121px] rounded-full font-regular text-[18px] ${
              isUpdating || isDropdownDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } focus:outline-0 flex justify-between items-center gap-2`}
          >
            {isUpdating ? "Updating..." : selectedStatus}
            {!isUpdating && !isDropdownDisabled && (
              <Image src="/images/dropdown.svg" alt="Dropdown" height={16} width={16}/>
            )}
          </button>

          {isDropdownOpen && !isUpdating && !isDropdownDisabled && (
            <div className="absolute top-full mt-2 right-0 sm:right-0 z-10 min-w-[150px]">
              <Dropdown items={statusOptions} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5 flex-wrap lg:flex-nowrap justify-between">
        {Credentials.map((item) => (
          <div key={item.id} className="gap-3">
            <div className="flex items-center bg-[#121315] rounded-xl gap-4 p-5">
              <Image src={item.img} alt={item.title} width={48} height={48} />
              <div>
                <h2 className="font-medium text-[18px] leading-[22px] text-white">{item.val}</h2>
                <p className="text-white/80 font-regular text-[14px] leading-[18px] pt-2">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Slider */}
      {images.length > 0 && (
        <>
          <div className="mt-8 sm:mt-[38px] flex flex-col sm:flex-row gap-4">
            {/* Left Large Image */}
            <div className="flex-1 h-[500px] overflow-hidden bg-gray-800 rounded-xl">
              <Image
                src={images[currentStep]}
                alt={`Property view ${currentStep + 1}`}
                width={1200}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Thumbnails - Show only 3 images */}
            <div className="sm:w-[175px] flex sm:flex-col gap-2 h-[70px] sm:h-[500px]">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`relative flex-1 rounded-lg overflow-hidden transition-all ${
                    currentStep === index ? 'ring-2 ring-[#EFFC76]' : ''
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="sm:w-full sm:h-full h-[50px] object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Progress Navigation */}
          <div className="mt-8 pb-[40px] sm:pb-[60px]">
            <div className="flex items-center gap-[20px] sm:gap-[40px] w-full">
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

              <button
                onClick={nextStep}
                disabled={currentStep === totalSteps - 1}
                className="w-10 h-10 rounded border border-gray-600 flex items-center justify-center hover:border-[#EFFC76] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
              >
                <Image src="/images/right.png" alt="Next" width={11} height={13} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Property Description */}
      {certificate.application.propertyDetails.description && (
        <p className="text-[#FFFFFFCC] text-[18px] font-regular leading-[22px]">
          {certificate.application.propertyDetails.description}
        </p>
      )}
    </div>
  );
}