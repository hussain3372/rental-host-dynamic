"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import AddCertificateDrawer from "./CertificateDrawer";
import AddPropertyDrawer from "./PropertyDrawer";
import Link from "next/link";
import Dropdown from "@/app/shared/Dropdown";
import { Modal } from "@/app/shared/Modal";
import { PropertyType } from "@/app/api/super-admin/property-type/types";
import { property } from "@/app/api/super-admin/property-type";
import { CertificateResponse } from "@/app/api/super-admin/certificates/types";
import { certificateTemplate } from "@/app/api/super-admin/certificates";

const Certificates: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"certificates" | "compliances">(
    "certificates"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<string | null>(
    null
  );
  const [propertyTypeToDelete, setPropertyTypeToDelete] = useState<
    string | null
  >(null);
  const [showCertificateDrawer, setShowCertificateDrawer] = useState(false);
  const [showPropertyDrawer, setShowPropertyDrawer] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] =
    useState<PropertyType | null>(null);
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateResponse | null>(null);

  // Certificate templates state
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);

  // Property types state
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // State for dropdown management for each certificate
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // 🔹 Fetch certificates on mount
  useEffect(() => {
    if (activeTab === "certificates") {
      fetchCertificates();
    }
  }, [activeTab]);

  // 🔹 Fetch property types (compliances) from API
  useEffect(() => {
    if (activeTab === "compliances") {
      fetchPropertyData();
    }
  }, [activeTab]);

  // Fetch certificates
  const fetchCertificates = async () => {
    setCertificatesLoading(true);
    try {
      const response = await certificateTemplate.fetchCertificateTemplate();
      if (response?.data) {
        // Handle both array and object response
        const certificatesData = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setCertificates(certificatesData);
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    } finally {
      setCertificatesLoading(false);
    }
  };

  const fetchPropertyData = async () => {
    setLoading(true);
    try {
      const response = await property.fetchPropertyData();
      if (response?.data?.data) {
        setPropertyTypes(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch property types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCertificateDrawer = (
    event?: React.MouseEvent,
    certificate?: CertificateResponse
  ) => {
    if (event) event.stopPropagation();
    setSelectedCertificate(certificate || null);
    setShowCertificateDrawer(true);
  };

  const openModal = (certificateId: string) => {
    setCertificateToDelete(certificateId);
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const openPropertyTypeDeleteModal = (propertyTypeId: string) => {
    setPropertyTypeToDelete(propertyTypeId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCertificateToDelete(null);
    setPropertyTypeToDelete(null);
  };

  const handleOpenPropertyDrawer = (propertyType?: PropertyType) => {
    setSelectedPropertyType(propertyType || null);
    setShowPropertyDrawer(true);
  };

  const handleCloseCertificateDrawer = () => {
    setSelectedCertificate(null);
    setShowCertificateDrawer(false);
    fetchCertificates(); // Refresh certificates after closing
  };

  const handleClosePropertyDrawer = () => {
    fetchPropertyData();
    setSelectedPropertyType(null);
    setShowPropertyDrawer(false);
  };

  const handleDeleteConfirm = async () => {
    // Delete certificate
    if (certificateToDelete) {
      setDeleting(true);
      try {
        await certificateTemplate.deleteCertificateTemplate(
          certificateToDelete
        );
        await fetchCertificates();
        closeModal();
      } catch (error) {
        console.error("Failed to delete certificate:", error);
      } finally {
        setDeleting(false);
      }
    }

    // Delete property type
    if (propertyTypeToDelete) {
      setDeleting(true);
      try {
        await property.deletePropertyType(propertyTypeToDelete);
        await fetchPropertyData();
        closeModal();
      } catch (error) {
        console.error("Failed to delete property type:", error);
        alert("Failed to delete property type. Please try again.");
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleEditCertificate = (certificate: CertificateResponse) => {
    setSelectedCertificate(certificate);
    setShowCertificateDrawer(true);
    setOpenDropdownId(null);
  };

  const getCertificateOptions = (certificate: CertificateResponse) => [
    { label: "Edit", onClick: () => handleEditCertificate(certificate) },
    { label: "Delete", onClick: () => openModal(certificate.id) },
  ];

  const handleMenuClick = (certificateId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === certificateId ? null : certificateId);
  };

  const handleCloseDropdown = () => setOpenDropdownId(null);

  // Format validity months to display text
  const formatValidity = (months: number) => {
    if (months === 12) return "1 Year";
    if (months === 24) return "2 Years";
    if (months === 36) return "3 Years";
    if (months === 60) return "5 Years";
    if (months === 0 || months >= 999) return "Permanent";
    return `${months} Months`;
  };

  // Calculate expiry date from createdAt and validityMonths
  const calculateExpiryDate = (createdAt: string, validityMonths: number) => {
    if (validityMonths === 0 || validityMonths >= 999) return "No Expiry";
    const date = new Date(createdAt);
    date.setMonth(date.getMonth() + validityMonths);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
              : () => handleOpenPropertyDrawer()
          }
          className="yellow-btn cursor-pointer text-black px-[20px] py-[12px] rounded-[8px] font-semibold text-[16px] leading-[20px] hover:bg-[#E5F266] transition-colors duration-300"
        >
          {activeTab === "certificates"
            ? "Add Certificate"
            : "Add Property Type"}
        </button>
      </div>

      {/* Tabs */}
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
              : " text-[#FFFFFFCC]"
          }`}
        >
          Compliances
        </button>
      </div>

      {/* Tabs Content */}
      {activeTab === "certificates" ? (
        // CERTIFICATES
        <div className="grid gap-x-4 gap-y-[16px] sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-[20px]">
          {certificatesLoading ? (
            <p className="text-white/70 text-center col-span-full py-10">
              Loading certificates...
            </p>
          ) : certificates.length > 0 ? (
            certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="flex bg-[#121315] rounded-lg group flex-col cursor-pointer relative"
              >
                <Link
                  href={`/super-admin/dashboard/certificates/detail/${certificate.id}`}
                  className="flex flex-col flex-1"
                >
                  <div className="shadow-md overflow-hidden">
                    <div className="relative w-full h-[300px]">
                      <Image
                        src={certificate.imageUrl || "/images/certificate.png"}
                        alt={certificate.name}
                        fill
                        className="object-cover w-full"
                      />
                    </div>
                  </div>
                  <div className="flex pb-4 px-4 flex-col flex-1">
                    <div className="flex items-center justify-between mt-5">
                      <h3 className="text-[18px] leading-[22px] text-white font-medium">
                        {certificate.name}
                      </h3>
                      <p className="font-regular text-[14px] leading-[18px] text-[#FFFFFFCC]">
                        {certificate.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <p className="text-[14px] leading-[18px] text-white/60 mt-2 font-regular">
                      Validity: {formatValidity(certificate.validityMonths)}
                    </p>
                    <div className="flex items-center justify-between mt-[33px]">
                      <p className="text-[14px] leading-[18px] text-white/80 font-normal">
                        Expiry:{" "}
                        {calculateExpiryDate(
                          certificate.createdAt,
                          certificate.validityMonths
                        )}
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="absolute right-3 bottom-4">
                  <button
                    onClick={(e) => handleMenuClick(certificate.id, e)}
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
                      items={getCertificateOptions(certificate)}
                      isOpen={openDropdownId === certificate.id}
                      onClose={handleCloseDropdown}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/70 text-center col-span-full py-10">
              No certificates found.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mt-[20px]">
          {loading ? (
            <p className="text-white/70 text-center col-span-full py-10">
              Loading property types...
            </p>
          ) : propertyTypes.length > 0 ? (
            propertyTypes.map((item) => (
              <div
                key={item.id}
                className="bg-[#121315] rounded-lg p-5 flex flex-col justify-between border border-[#1E1F22]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[18px] font-semibold text-white">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenPropertyDrawer(item)}
                        className="text-[#E5F266] text-[16px] cursor-pointer font-regular underline hover:text-[#d4e155] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openPropertyTypeDeleteModal(item.id)}
                        className="text-red-400 text-[16px] cursor-pointer font-regular underline hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-[#FFFFFF99] text-[14px] mb-3">
                    {item.description}
                  </p>
                  <hr className="border-[#1E1F22] mb-4" />
                  <ul className="space-y-2">
                    {item.checklists?.map((listItem) => (
                      <li
                        key={listItem.id}
                        className="flex items-center gap-2 text-white font-regular text-[16px] leading-[20px]"
                      >
                        <Image
                          src="/images/check.svg"
                          alt="Check"
                          height={24}
                          width={24}
                        />
                        {listItem.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/70 text-center col-span-full py-10">
              No property types found.
            </p>
          )}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        image="/images/deletion.png"
        title={
          propertyTypeToDelete
            ? "Confirm Property Type Deletion"
            : "Confirm Certificate Deletion"
        }
        description={
          propertyTypeToDelete
            ? "Deleting this property type means it will no longer appear in your data."
            : "Deleting this certificate means it will no longer appear in your data."
        }
        confirmText={deleting ? "Deleting..." : "Delete"}
        onConfirm={handleDeleteConfirm}
      />

      {/* Drawers */}
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
              certificate={selectedCertificate}
            />
          </div>
        </div>
      )}

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
              propertyType={selectedPropertyType}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
