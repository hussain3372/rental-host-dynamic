"use client";
import React, { useState } from "react";
import Image from "next/image";
import AddCertificateDrawer from "./CertificateDrawer";
import AddPropertyDrawer from "./PropertyDrawer";
import Link from "next/link";
import Dropdown from "@/app/shared/Dropdown";
import { Modal } from "@/app/shared/Modal";

type Property = {
  id: number;
  title: string;
  author: string;
  images: string[];
  status: string;
  expiry: string;
};

const staticProperties: Property[] = [
  {
    id: 1,
    title: "Hotel Safety Compliance",
    author: "Validity: 6 Months",
    images: ["/images/certificate.png"],
    status: "Hotel",
    expiry: "Aug 12, 2025",
  },
  {
    id: 2,
    title: "Hotel Safety Compliance",
    author: "Validity: 6 Months",
    images: ["/images/certificate.png"],
    status: "Hotel",
    expiry: "Aug 12, 2025",
  },
  {
    id: 3,
    title: "Hotel Safety Compliance",
    author: "Validity: 6 Months",
    images: ["/images/certificate.png"],
    status: "Hotel",
    expiry: "Aug 12, 2025",
  },
  {
    id: 4,
    title: "Hotel Safety Compliance",
    author: "Validity: 6 Months",
    images: ["/images/certificate.png"],
    status: "Hotel",
    expiry: "Aug 12, 2025",
  },
  {
    id: 5,
    title: "Hotel Safety Compliance",
    author: "Validity: 6 Months",
    images: ["/images/certificate.png"],
    status: "Hotel",
    expiry: "Aug 12, 2025",
  },
  {
    id: 6,
    title: "Hotel Safety Compliance",
    author: "Validity: 6 Months",
    images: ["/images/certificate.png"],
    status: "Hotel",
    expiry: "Aug 12, 2025",
  },
];

const compliancesData = [
  {
    title: "Hotel",
    description: "Checklist of mandatory compliances for hotel properties.",
  },
  {
    title: "Vila",
    description: "Checklist of mandatory compliances for vila properties.",
  },
  {
    title: "Restaurant",
    description: "Checklist of mandatory compliances for restaurant properties.",
  },
  {
    title: "Apartment",
    description: "Checklist of mandatory compliances for apartment properties.",
  },
  {
    title: "Hostel",
    description: "Checklist of mandatory compliances for hostel properties.",
  },
  {
    title: "Commercial Space",
    description: "Checklist of mandatory compliances for offices properties.",
  },
];

const checklistItems = [
  "Fire safety equipment (extinguishers, alarms, exit plan)",
  "Waste disposal system compliance",
  "Maintenance/inspection report",
  "Utility bills (electricity/water matching address)",
];

const Certificates: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"certificates" | "compliances">("certificates");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<number | null>(null);
  const [showCertificateDrawer, setShowCertificateDrawer] = useState(false);
  const [showPropertyDrawer, setShowPropertyDrawer] = useState(false);
  const [properties, setProperties] = useState<Property[]>(staticProperties);
  
  // State for dropdown management for each certificate
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const handleOpenCertificateDrawer = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setShowCertificateDrawer(true);
  };

  

  const openModal = (propertyId: number) => {
    setCertificateToDelete(propertyId);
    setIsModalOpen(true);
    setOpenDropdownId(null); // Close dropdown when opening modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCertificateToDelete(null);
  };

  const handleOpenPropertyDrawer = () => {
    setShowPropertyDrawer(true);
  };

  const handleCloseCertificateDrawer = () => {
    setShowCertificateDrawer(false);
  };

  const handleClosePropertyDrawer = () => {
    setShowPropertyDrawer(false);
  };

  // Handle delete certificate confirmation
  const handleDeleteConfirm = () => {
    if (certificateToDelete) {
      setProperties(prev => prev.filter(property => property.id !== certificateToDelete));
      closeModal();
    }
  };
  
  // Handle edit certificate
  const handleEditCertificate = (propertyId: number) => {
    console.log("Edit certificate:", propertyId);
    // You can pass the property data to the drawer here if needed
    setShowCertificateDrawer(true);
    setOpenDropdownId(null);
  };

  // Dropdown options for certificate menu
  const getCertificateOptions = (propertyId: number) => [
    { 
      label: "Edit", 
      onClick: () => handleEditCertificate(propertyId) 
    },
    { 
      label: "Delete", 
      onClick: () => openModal(propertyId) 
    },
  ];

  const handleMenuClick = (propertyId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === propertyId ? null : propertyId);
  };

  const handleCloseDropdown = () => {
    setOpenDropdownId(null);
  };

  return (
    <div className="text-white pb-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row items-start justify-between mb-4">
        <div>
          <h1 className="text-[20px] leading-[24px] font-semibold text-white mb-2">
            Certificate & Compliance Setup
          </h1>
          <p className="text-[16px] leading-[20px] text-[#FFFFFF99] font-regular max-w-[573px]">
            Define rules, checklists, and validity periods to ensure properties
            meet compliance standards before certification.
          </p>
        </div>

        <button
          onClick={
            activeTab === "certificates"
              ? handleOpenCertificateDrawer
              : handleOpenPropertyDrawer
          }
          className="yellow-btn cursor-pointer text-black px-[20px] py-[12px] rounded-[8px] font-semibold text-[16px] leading-[20px] hover:bg-[#E5F266] transition-colors duration-300"
        >
          {activeTab === "certificates"
            ? "Add Certificate"
            : "Add Property Type"}
        </button>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("certificates")}
          className={`px-4 py-2 rounded-[8px] cursor-pointer text-[14px] font-medium transition-colors duration-300 ${
            activeTab === "certificates"
              ? "bg-[#EFFC761F] text-[#EFFC76]"
              : " text-[#FFFFFFCC]"
          }`}
        >
          Certificates
        </button>
        <button
          onClick={() => setActiveTab("compliances")}
          className={`px-4 py-2 rounded-[8px] cursor-pointer text-[14px] font-medium transition-colors duration-300 ${
            activeTab === "compliances"
              ? "bg-[#EFFC761F] text-[#EFFC76]"
              : "  text-[#FFFFFFCC]"
          }`}
        >
          Compliances
        </button>
      </div>

      {/* Conditional Rendering */}
      {activeTab === "certificates" ? (
        // CERTIFICATES GRID
        <div className="grid gap-x-4 gap-y-[16px] sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-[20px]">
          {properties.map((property) => (
            <div
              key={property.id}
              className="flex bg-[#121315] rounded-lg group flex-col cursor-pointer relative"
            >
              <Link
                href={`/super-admin/dashboard/certificates/detail/${property.id}`}
                className="flex flex-col flex-1"
              >
                <div className="shadow-md overflow-hidden">
                  <div className="relative w-full">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      width={373}
                      height={300}
                      className="object-cover w-full"
                    />
                  </div>
                </div>
                <div className="flex pb-4 px-4 flex-col flex-1">
                  <div className="flex items-center justify-between mt-5">
                    <h3 className="text-[18px] leading-[22px] text-white font-medium">
                      {property.title}
                    </h3>
                    <p className="font-regular text-[14px] leading-[18px] text-[#FFFFFFCC]">
                      {property.status}
                    </p>
                  </div>
                  <p className="text-[14px] leading-[18px] text-white/60 mt-2 font-regular">
                    {property.author}
                  </p>
                  <div className="flex items-center justify-between mt-[33px]">
                    <p className="text-[14px] leading-[18px] text-white/80 font-normal">
                      Expiry: {property.expiry}
                    </p>
                  </div>
                </div>
              </Link>
              
              {/* Dropdown Menu - positioned absolutely outside the Link */}
              <div className="absolute right-3 bottom-4">
                <button
                  onClick={(e) => handleMenuClick(property.id, e)}
                  className="p-2 cursor-pointer rounded transition-colors duration-200 z-10"
                >
                  <Image
                    src="/images/vertical-menu.svg"
                    alt="menu"
                    width={20}
                    height={20}
                    className="cursor-pointer"
                  />
                </button>
                <div className="absolute -right-16 top-9 z-20">
                  <Dropdown
                    items={getCertificateOptions(property.id)}
                    isOpen={openDropdownId === property.id}
                    onClose={handleCloseDropdown}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // COMPLIANCES GRID
        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mt-[20px]">
          {compliancesData.map((item, index) => (
            <div
              key={index}
              className="bg-[#121315] rounded-lg p-5 flex flex-col justify-between border border-[#1E1F22]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[18px] font-semibold text-white">
                    {item.title}
                  </h3>
                  <p
                    onClick={handleOpenPropertyDrawer}
                    className="text-[#E5F266] text-[16px] cursor-pointer font-regular underline"
                  >
                    Edit
                  </p>
                </div>
                <p className="text-[#FFFFFF99] text-[14px] mb-3">
                  {item.description}
                </p>
                <hr className="border-[#1E1F22] mb-4" />
                <ul className="space-y-2">
                  {checklistItems.map((listItem, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-white font-regular text-[16px] leading-[20px]"
                    >
                      <Image
                        src="/images/check.svg"
                        alt="Check"
                        height={24}
                        width={24}
                      />
                      {listItem}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        image="/images/deletion.png" 
        title="Confirm Certificate Deletion" 
        description="Deleting this certificate means it will no longer appear in your data." 
        confirmText="Delete"  
        onConfirm={handleDeleteConfirm}
      />
      

      {/* Certificate Drawer */}
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

      {/* Property Drawer */}
      {showPropertyDrawer && (
        <div className="fixed inset-0 z-[9000] flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClosePropertyDrawer}
          ></div>
          <div className="relative ml-auto h-full">
            <AddPropertyDrawer
              onClose={handleClosePropertyDrawer}
              isOpen={showPropertyDrawer}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;