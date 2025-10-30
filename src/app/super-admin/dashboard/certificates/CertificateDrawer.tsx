"use client";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import Dropdown from "@/app/shared/InputDropDown";
import { property } from "@/app/api/super-admin/property-type";
import { PropertyType } from "@/app/api/super-admin/property-type/types";
import { CertificateResponse } from "@/app/api/super-admin/certificates/types";
import { certificateTemplate } from "@/app/api/super-admin/certificates";
import toast from "react-hot-toast";

interface DrawerProps {
  onClose: () => void;
  isOpen: boolean;
  certificate?: CertificateResponse | null;
}

const AddCertificateDrawer: React.FC<DrawerProps> = ({
  onClose,
  isOpen,
  certificate,
}) => {
  const [certificateName, setCertificateName] = useState("");
  const [propertyTypeId, setPropertyTypeId] = useState("");
  const [propertyTypeName, setPropertyTypeName] = useState("");
  const [validity, setValidity] = useState("");
  const [validityMonths, setValidityMonths] = useState(12);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Property types state
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(false);

  // Dropdown states
  const [propertyTypeDropdownOpen, setPropertyTypeDropdownOpen] =
    useState(false);
  const [validityDropdownOpen, setValidityDropdownOpen] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Validity options with months mapping
  const validityOptions = [
    {
      label: "1 Year",
      onClick: () => {
        setValidity("1 Year");
        setValidityMonths(12);
      },
    },
    {
      label: "2 Years",
      onClick: () => {
        setValidity("2 Years");
        setValidityMonths(24);
      },
    },
    {
      label: "3 Years",
      onClick: () => {
        setValidity("3 Years");
        setValidityMonths(36);
      },
    },
    {
      label: "5 Years",
      onClick: () => {
        setValidity("5 Years");
        setValidityMonths(60);
      },
    },
    {
      label: "Permanent",
      onClick: () => {
        setValidity("Permanent");
        setValidityMonths(0);
      },
    },
  ];

  // Fetch property types on mount
  useEffect(() => {
    fetchPropertyTypes();
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (certificate) {
      setCertificateName(certificate.name);
      setDescription(certificate.description || "");
      setPropertyTypeId(certificate.propertyTypeId);
      setValidityMonths(certificate.validityMonths);
      setImageUrl(certificate.imageUrl || "");

      // Set validity display text
      const months = certificate.validityMonths;
      if (months === 12) setValidity("1 Year");
      else if (months === 24) setValidity("2 Years");
      else if (months === 36) setValidity("3 Years");
      else if (months === 60) setValidity("5 Years");
      else if (months === 0 || months >= 999) setValidity("Permanent");
      else setValidity(`${months} Months`);
    }
  }, [certificate]);

  // Set property type name when types are loaded
  useEffect(() => {
    if (propertyTypes.length > 0 && propertyTypeId) {
      const selectedType = propertyTypes.find((pt) => pt.id === propertyTypeId);
      if (selectedType) {
        setPropertyTypeName(selectedType.name);
      }
    }
  }, [propertyTypes, propertyTypeId]);

  const fetchPropertyTypes = async () => {
    setLoadingPropertyTypes(true);
    try {
      const response = await property.fetchPropertyData();
      if (response?.data?.data) {
        setPropertyTypes(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch property types:", error);
    } finally {
      setLoadingPropertyTypes(false);
    }
  };

  // Generate property type options for dropdown
  const propertyTypeOptions = propertyTypes.map((pt) => ({
    label: pt.name,
    onClick: () => {
      setPropertyTypeId(pt.id);
      setPropertyTypeName(pt.name);
    },
  }));

  // Handle mount/unmount with smooth transitions
  useEffect(() => {
    if (isOpen && !isMounted) {
      setIsMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else if (!isOpen && isMounted) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMounted]);

  // Handle form submission
const handleSubmitCertificate = async () => {
  // ... validation code ...

  setIsSubmitting(true);

  try {
    const payload = {
      propertyTypeId,
      name: certificateName,
      description: description || `Default certificate for ${propertyTypeName}`,
      imageUrl: imageUrl || "",
      validityMonths,
    };

    if (certificate) {
      // Update existing certificate
      const response = await certificateTemplate.updateCertificateTemplate(certificate.id, {
        propertyTypeId: payload.propertyTypeId,
        name: payload.name,
        description: payload.description,
        imageUrl: payload.imageUrl,
        validityMonths: payload.validityMonths,
      });
      
      // Check if response indicates failure
      if (!response.success) {
        throw new Error(response.message || "Failed to update certificate");
      }
      
      toast.success("Certificate updated successfully!");
    } else {
      // Create new certificate
      const response = await certificateTemplate.createCertificateTemplate({
        propertyTypeId: payload.propertyTypeId,
        name: payload.name,
        description: payload.description,
        imageUrl: payload.imageUrl,
        validityMonths: payload.validityMonths,
      });
      
      // Check if response indicates failure
      if (!response.success) {
        throw new Error(response.message || "Failed to create certificate");
      }
      
      toast.success("Certificate created successfully!");
    }

    // Reset form and close drawer
    setCertificateName("");
    setPropertyTypeId("");
    setPropertyTypeName("");
    setValidity("");
    setValidityMonths(12);
    setImageUrl("");
    setDescription("");
    setIsVisible(false);
    setTimeout(onClose, 300);
    
  } catch (error) {
    console.error("Failed to save certificate:", error);
    
    // Type-safe error handling
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error(`Failed to ${certificate ? "update" : "create"} certificate. Please try again.`);
    }
  } finally {
    setIsSubmitting(false);
  }
};

  // Close drawer when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }
    }

    if (isMounted) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMounted, onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape" && isMounted) {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }
    }

    if (isMounted) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isMounted, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isMounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMounted]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isVisible ? "opacity-50" : "opacity-0"
        }`}
        onClick={handleOverlayClick}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 overflow-auto scrollbar-hide right-0 h-full bg-[#0A0C0B] border-l border-l-[#FFFFFF1F] text-white flex flex-col justify-between p-[28px] w-[90vw] sm:w-[608px] z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Heading */}
        <div>
          <h2 className="text-[20px] font-medium mb-3 transition-all duration-300 ease-out">
            {certificate ? "Edit Certificate" : "Add New Certificate"}
          </h2>
          <p className="text-[#FFFFFF99] text-[16px] mb-10 leading-5 transition-all duration-300 ease-out">
            Fill in the certificate details and compliance information to{" "}
            {certificate ? "update" : "issue"} a certification for a property.
          </p>

          {/* Certificate Name */}
          <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
              Certificate name
            </label>
            <input
              type="text"
              value={certificateName}
              onChange={(e) => setCertificateName(e.target.value)}
              placeholder="Enter name"
              className="w-full h-[46px] bg-[#1a1a1a] text-white text-sm rounded-md px-3 border border-[#2b2b2b] 
                        focus:outline-none transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] 
                        focus:border-[#f8f94d] focus:shadow-[0_0_0_2px_rgba(248,249,77,0.1)] placeholder:text-white/40"
            />
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={3}
              className="w-full bg-[#1a1a1a] text-white text-sm rounded-md px-3 py-2 border border-[#2b2b2b] 
                        focus:outline-none transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] 
                        focus:border-[#f8f94d] focus:shadow-[0_0_0_2px_rgba(248,249,77,0.1)] placeholder:text-white/40 resize-none"
            />
          </div>

          {/* Property Type */}
          <div className="mb-5 relative">
            <label className="block text-[14px] font-medium text-white mb-2 transition-all duration-300 ease-out">
              Property type
            </label>
            <div className="relative">
              <button
                onClick={() => {
                  setPropertyTypeDropdownOpen(!propertyTypeDropdownOpen);
                  setValidityDropdownOpen(false);
                }}
                disabled={loadingPropertyTypes}
                className={`w-full h-[46px] bg-[#1a1a1a] text-sm rounded-md pl-3 pr-10 border transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-left ${
                  propertyTypeName
                    ? "text-white border-[#2b2b2b]"
                    : "text-white/40 border-[#2b2b2b]"
                } ${loadingPropertyTypes ? "opacity-50" : ""}`}
              >
                {loadingPropertyTypes
                  ? "Loading..."
                  : propertyTypeName || "Select type"}
              </button>
              <Image
                src="/images/dropdown.svg"
                alt="dropdown"
                height={20}
                width={20}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  propertyTypeDropdownOpen ? "rotate-180" : ""
                }`}
              />
              <Dropdown
                items={propertyTypeOptions}
                isOpen={propertyTypeDropdownOpen}
                onClose={() => setPropertyTypeDropdownOpen(false)}
              />
            </div>
          </div>

          {/* Certificate Validity */}
          <div className="mb-5 relative">
            <label className="block text-[14px] font-medium text-white mb-2 transition-all duration-300 ease-out">
              Certificate validity
            </label>
            <div className="relative">
              <button
                onClick={() => {
                  setValidityDropdownOpen(!validityDropdownOpen);
                  setPropertyTypeDropdownOpen(false);
                }}
                className={`w-full h-[46px] bg-[#1a1a1a] text-sm rounded-md pl-3 pr-10 border transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-left ${
                  validity
                    ? "text-white border-[#2b2b2b]"
                    : "text-white/40 border-[#2b2b2b]"
                }`}
              >
                {validity || "Select validity"}
              </button>
              <Image
                src="/images/dropdown.svg"
                alt="dropdown"
                height={20}
                width={20}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  validityDropdownOpen ? "rotate-180" : ""
                }`}
              />
              <Dropdown
                items={validityOptions}
                isOpen={validityDropdownOpen}
                onClose={() => setValidityDropdownOpen(false)}
              />
            </div>
          </div>

          {/* Image URL */}
          {/* <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
              Certificate Image URL (Optional)
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/certificate.png"
              className="w-full h-[46px] bg-[#1a1a1a] text-white text-sm rounded-md px-3 border border-[#2b2b2b] 
                        focus:outline-none transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] 
                        focus:border-[#f8f94d] focus:shadow-[0_0_0_2px_rgba(248,249,77,0.1)] placeholder:text-white/40"
            />
            <p className="text-[#FFFFFF99] text-[12px] mt-2">
              If not provided, a default image will be used
            </p>
          </div> */}

          {/* Image Preview */}
          {imageUrl && (
            <div className="mb-5">
              <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px]">
                Image Preview
              </label>
              <div className="relative w-full h-[200px] rounded-lg overflow-hidden border border-[#2b2b2b]">
                <Image
                  src={imageUrl}
                  alt="Certificate preview"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/certificate.png";
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="transition-all duration-300 ease-out">
          <button
            onClick={handleSubmitCertificate}
            disabled={isSubmitting}
            className={`w-full h-[52px] py-4 text-[18px] font-semibold rounded-md yellow-btn text-black text-sm 
                      transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                      hover:scale-[1.02] active:scale-[0.98] ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
          >
            {isSubmitting
              ? certificate
                ? "Updating..."
                : "Creating..."
              : certificate
              ? "Update Certificate"
              : "Add Certificate"}
          </button>
        </div>
      </div>
    </>
  );
};

AddCertificateDrawer.displayName = "AddCertificateDrawer";

export default AddCertificateDrawer;
