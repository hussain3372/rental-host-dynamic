"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Dropdown from "@/app/shared/InputDropDown";

// Define property type interface
interface PropertyType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  checklists: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
}

interface Step1aProps {
  formData: {
    propertyName: string;
    propertyAddress: string;
    propertyType: string;
    propertyTypeName: string;
    ownership: string;
  };
  errors: { [key: string]: string };
  onFieldChange: (field: string, value: string) => void;
  propertyTypes: PropertyType[];
  loadingPropertyTypes: boolean;
}

export default function Step1a({ 
  formData, 
  errors, 
  onFieldChange, 
  propertyTypes, 
  loadingPropertyTypes 
}: Step1aProps) {
  const [showPropertyType, setShowPropertyType] = useState(false);
  const [showOwnership, setShowOwnership] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const propertyTypeRef = useRef<HTMLDivElement>(null);
  const ownershipRef = useRef<HTMLDivElement>(null);

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!isClient) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        propertyTypeRef.current &&
        !propertyTypeRef.current.contains(event.target as Node)
      ) {
        setShowPropertyType(false);
      }
      if (
        ownershipRef.current &&
        !ownershipRef.current.contains(event.target as Node)
      ) {
        setShowOwnership(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isClient]);

  // Transform property types for dropdown
  const propertyTypeItems = (propertyTypes || []).map((type) => ({
    label: type.name,
    onClick: () => {
      // Store both ID and name
      onFieldChange("propertyType", type.id);
      onFieldChange("propertyTypeName", type.name);
      setShowPropertyType(false);
    },
  }));

  // Handle property type selection
  const handlePropertyTypeToggle = () => {
    setShowPropertyType((prev) => !prev);
  };

  // Handle ownership selection
  const handleOwnershipToggle = () => {
    setShowOwnership((prev) => !prev);
  };

  // Display text for property type
  const getPropertyTypeDisplayText = () => {
    if (loadingPropertyTypes) return "Loading types...";
    if (!formData.propertyTypeName) return "Select type";
    return formData.propertyTypeName;
  };

  return (
    <div className="flex flex-col !justify-center">
      <div>
        <h2 className="text-[28px] leading-[32px] flex font-bold mb-3">
          Enter Your Property Information
        </h2>
        <p className="text-white/60 text-[16px] font-regular mb-10 max-w-[573px]">
          Provide basic details about your property to begin the certification
          process. Make sure the information matches your official records.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Property Name */}
          <div>
            <label className="block text-[14px] font-medium text-white">
              Property name
            </label>
            <input
              type="text"
              value={formData.propertyName}
              onChange={(e) => onFieldChange("propertyName", e.target.value)}
              placeholder="Enter name"
              className={`w-full mt-2 px-4 py-3 bg-gradient-to-b from-[#202020] to-[#101010] border rounded-lg text-white placeholder:text-white/40 text-[14px] focus:outline-none ${
                errors.propertyName ? "border-red-500" : "border-[#464646]"
              }`}
            />
            {errors.propertyName && (
              <p className="text-red-500 text-sm mt-1">{errors.propertyName}</p>
            )}
          </div>

          {/* Property Address */}
          <div className="relative">
            <label className="block text-[14px] font-medium text-white">
              Property address
            </label>
            <input
              type="text"
              value={formData.propertyAddress}
              onChange={(e) => onFieldChange("propertyAddress", e.target.value)}
              placeholder="Enter address"
              className={`w-full mt-2 px-4 py-3 bg-gradient-to-b from-[#202020] to-[#101010] border rounded-lg text-white placeholder:text-white/40 focus:outline-none ${
                errors.propertyAddress ? "border-red-500" : "border-[#464646]"
              }`}
            />
            <Image
              src="/images/location-icon.svg"
              alt="Location"
              width={20}
              height={20}
              className="absolute top-[43px] right-4"
            />
            {errors.propertyAddress && (
              <p className="text-red-500 text-sm mt-1">{errors.propertyAddress}</p>
            )}
          </div>

          {/* Property Type */}
          <div ref={propertyTypeRef}>
            <label className="block text-[14px] font-regular text-white">
              Property type
            </label>
            <div className="relative mt-4">
              <button
                type="button"
                onClick={handlePropertyTypeToggle}
                disabled={loadingPropertyTypes || propertyTypes.length === 0}
                className={`
                  w-full px-4 py-3 pr-10 rounded-lg border
                  bg-gradient-to-b from-[#202020] to-[#101010]
                  text-[14px] font-medium text-left
                  ${
                    !formData.propertyTypeName ? "text-white/40" : "text-white"
                  }
                  ${(loadingPropertyTypes || propertyTypes.length === 0) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  ${
                    errors.propertyType ? "border-red-500" : "border-[#464646]"
                  }
                  transition duration-200 ease-in-out
                `}
              >
                {propertyTypes.length === 0 && !loadingPropertyTypes 
                  ? "No types available" 
                  : getPropertyTypeDisplayText()}
                {(propertyTypes.length > 0 && !loadingPropertyTypes) && (
                  <Image
                    src="/images/dropdown.svg"
                    alt="dropdown"
                    width={15}
                    height={8}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                )}
              </button>

              {isClient && showPropertyType && propertyTypeItems.length > 0 && (
                <div className="absolute z-10 mt-1 w-full">
                  <Dropdown items={propertyTypeItems} />
                </div>
              )}
            </div>
            {errors.propertyType && (
              <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>
            )}
          </div>

          {/* Ownership */}
          <div ref={ownershipRef}>
            <label className="block text-[14px] font-medium text-white">
              Ownership
            </label>
            <div className="relative mt-4">
              <button
                type="button"
                onClick={handleOwnershipToggle}
                className={`
                  w-full px-4 py-3 pr-10 rounded-lg border
                  bg-gradient-to-b from-[#202020] to-[#101010]
                  text-[14px] font-regular text-left
                  ${formData.ownership === "" ? "text-white/40" : "text-white"}
                  ${
                    errors.ownership ? "border-red-500" : "border-[#464646]"
                  }
                  cursor-pointer transition duration-200 ease-in-out
                `}
              >
                {formData.ownership || "Select ownership"}
                <Image
                  src="/images/dropdown.svg"
                  alt="dropdown"
                  width={15}
                  height={8}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </button>

              {isClient && showOwnership && (
                <div className="absolute z-10 mt-1 w-full">
                  <Dropdown
                    items={[
                      {
                        label: "Owner",
                        onClick: () => {
                          onFieldChange("ownership", "Owner");
                          setShowOwnership(false);
                        },
                      },
                      {
                        label: "Manager",
                        onClick: () => {
                          onFieldChange("ownership", "Manager");
                          setShowOwnership(false);
                        },
                      },
                    ]}
                  />
                </div>
              )}
            </div>
            {errors.ownership && (
              <p className="text-red-500 text-sm mt-1">{errors.ownership}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}