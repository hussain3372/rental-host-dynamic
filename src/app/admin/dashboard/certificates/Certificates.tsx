"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "../../tables-essentials/Filter";
import { certificateApi } from "@/app/api/Admin/certificate";
import { Certification } from "@/app/api/Admin/certificate/types";

interface CertificationData {
  id: number;
  "Certificate ID": string;
  "Host ID": string;
  "Property Name": string;
  "Host Name": string;
  "Issue Date": string;
  "Expiry Date": string;
  Status: "active" | "revoked" | "expired";
  originalData?: Certification;
}

interface ApiFilters {
  issuedAt?: string;
  expiredAt?: string;
  status?: "ACTIVE" | "REVOKED" | "EXPIRED";
}

export default function Certificates() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"active" | "revoked" | "expired">("active");
  // const itemsPerPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: number;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

  const [issueDate, setIssueDate] = useState<Date | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);

  const [apiFilters, setApiFilters] = useState<ApiFilters>({});
  const [allCertificationData, setAllCertificationData] = useState<CertificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if we're using date filters
  const [usingDateFilters, setUsingDateFilters] = useState(false);

  // Fetch certificates from API whenever filters or activeTab changes
  useEffect(() => {
    fetchCertificates();
  }, [apiFilters, activeTab]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters - only include specific filters
      const queryParams: ApiFilters = {};

      // If we have ANY date filters, ONLY send date filters (no status, no pagination)
      if (apiFilters.issuedAt || apiFilters.expiredAt) {
        // Send both date filters if they exist
        if (apiFilters.issuedAt) {
          queryParams.issuedAt = apiFilters.issuedAt;
        }
        if (apiFilters.expiredAt) {
          queryParams.expiredAt = apiFilters.expiredAt;
        }
        // Don't send status when using date filters
      } else {
        // Only send status when no date filters are active
        if (activeTab === "active") {
          queryParams.status = "ACTIVE";
        } else if (activeTab === "revoked") {
          queryParams.status = "REVOKED";
        } else if (activeTab === "expired") {
          queryParams.status = "EXPIRED";
        }
      }

      console.log('API Call with filters:', queryParams);

      const response = await certificateApi.getCertificates(queryParams);
      
      if (response.data && response.data.certifications) {
        const formattedData: CertificationData[] = response.data.certifications.map((cert) => {
          // Use the API status directly instead of calculating client-side
          let status: "active" | "revoked" | "expired" = "active";
          
          // Map API status to our client status
          if (cert.status === "REVOKED") {
            status = "revoked";
          } else if (cert.status === "EXPIRED") {
            status = "expired";
          } else {
            status = "active";
          }

          const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          };

          return {
            id: parseInt(cert.id.replace(/\D/g, '')) || Date.now(),
            "Certificate ID": cert.certificateNumber,
            "Host ID": cert.hostId.toString(),
            "Property Name": cert.application.propertyDetails.propertyName,
            "Host Name": cert.host.name,
            "Issue Date": formatDate(cert.issuedAt),
            "Expiry Date": formatDate(cert.expiresAt),
            Status: status,
            originalData: cert
          };
        });

        setAllCertificationData(formattedData);
      } else {
        throw new Error('No certification data received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch certificates');
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on active tab and search term
  const filteredCertificationData = useMemo(() => {
    let filtered = allCertificationData;

    // If using date filters, show all returned data
    // If not using date filters, filter by active tab (as backup)
    if (!usingDateFilters) {
      filtered = filtered.filter(item => item.Status === activeTab);
    }

    // Apply client-side search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item["Property Name"]
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item["Certificate ID"]
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item["Host ID"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Host Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Issue Date"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Expiry Date"].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm, allCertificationData, activeTab, usingDateFilters]);

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set<string>();
    if (checked) {
      filteredCertificationData.forEach((item) =>
        newSelected.add(item.id.toString())
      );
    }
    setSelectedRows(newSelected);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const isAllDisplayedSelected = useMemo(() => {
    return (
      filteredCertificationData.length > 0 &&
      filteredCertificationData.every((item) =>
        selectedRows.has(item.id.toString())
      )
    );
  }, [filteredCertificationData, selectedRows]);

  const isSomeDisplayedSelected = useMemo(() => {
    return (
      filteredCertificationData.some((item) =>
        selectedRows.has(item.id.toString())
      ) && !isAllDisplayedSelected
    );
  }, [filteredCertificationData, selectedRows, isAllDisplayedSelected]);

  // const handleDeleteCertificates = async (selectedRowIds: Set<string>) => {
  //   try {
  //     const idsToDelete = Array.from(selectedRowIds).map((id) => {
  //       const certData = allCertificationData.find(item => item.id.toString() === id);
  //       return certData?.originalData?.id;
  //     }).filter(Boolean);

  //     // for (const certId of idsToDelete) {
  //     //   await certificateApi.deleteCertificate(certId!);
  //     // }

  //     await fetchCertificates();
      
  //     setIsModalOpen(false);
  //     setSelectedRows(new Set());
  //   } catch (err) {
  //     console.error('Error deleting certificates:', err);
  //     setError('Failed to delete certificates');
  //   }
  // };

  const handleDeleteSingleCertificate = async (id: number) => {
    try {
      const certData = allCertificationData.find(item => item.id === id);
      if (certData?.originalData?.id) {
        // await certificateApi.deleteCertificate(certData.originalData.id);
        await fetchCertificates();
      }
      
      setIsModalOpen(false);
      setSingleRowToDelete(null);
    } catch (err) {
      console.error('Error deleting certificate:', err);
      setError('Failed to delete certificate');
    }
  };

  const openDeleteSingleModal = (row: Record<string, string>, id: number) => {
    setSingleRowToDelete({ row, id });
    setModalType("single");
    setIsModalOpen(true);
  };

  const handleDeleteSelected = () => {
    if (selectedRows.size > 0) {
      setModalType("multiple");
      setIsModalOpen(true);
    }
  };

  const handleModalConfirm = () => {
    if (modalType === "multiple" && selectedRows.size > 0) {
      // handleDeleteCertificates(selectedRows);
    } else if (modalType === "single" && singleRowToDelete) {
      handleDeleteSingleCertificate(singleRowToDelete.id);
    }
  };

  const displayData = useMemo(() => {
    return filteredCertificationData.map(({ id, Status, originalData, ...rest }) => {
      return rest;
    });
  }, [filteredCertificationData]);

  useEffect(() => {
    setSelectedRows(new Set());
  }, [searchTerm, apiFilters, activeTab, currentPage]);

  const handleResetFilter = () => {
    setApiFilters({});
    setUsingDateFilters(false);
    setSearchTerm("");
    setIssueDate(null);
    setExpiryDate(null);
    setCurrentPage(1);
  };

  const handleApplyFilter = () => {
    const newFilters: ApiFilters = {};

    // Send BOTH date filters if both are selected
    if (issueDate) {
      // Fix date issue - use local date without timezone conversion
      const year = issueDate.getFullYear();
      const month = String(issueDate.getMonth() + 1).padStart(2, '0');
      const day = String(issueDate.getDate()).padStart(2, '0');
      newFilters.issuedAt = `${year}-${month}-${day}`;
    }

    if (expiryDate) {
      // Fix date issue - use local date without timezone conversion
      const year = expiryDate.getFullYear();
      const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
      const day = String(expiryDate.getDate()).padStart(2, '0');
      newFilters.expiredAt = `${year}-${month}-${day}`;
    }

    // Only set usingDateFilters if at least one date is selected
    setUsingDateFilters(!!(issueDate || expiryDate));

    setApiFilters(newFilters);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const handleDownloadCertificate = (certificateData: Certification) => {
    try {
      if (certificateData.badgeUrl) {
        const link = document.createElement('a');
        link.href = certificateData.badgeUrl;
        link.download = `certificate-${certificateData.certificateNumber}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.warn('No badge URL available for this certificate');
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      if (certificateData.badgeUrl) {
        window.open(certificateData.badgeUrl, '_blank');
      }
    }
  };

  // Handle tab change - reset date filters when switching tabs
  const handleTabChange = (tab: "active" | "revoked" | "expired") => {
    setActiveTab(tab);
    setUsingDateFilters(false);
    setApiFilters({});
    setIssueDate(null);
    setExpiryDate(null);
    setCurrentPage(1);
  };

  const dropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = filteredCertificationData[index];
        if (originalRow.originalData) {
          window.location.href = `/admin/dashboard/certificates/detail/${originalRow.originalData.id}`;
        }
      },
    },
    {
      label: "Download Certificate",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = filteredCertificationData[index];
        if (originalRow.originalData) {
          handleDownloadCertificate(originalRow.originalData);
        }
      },
    },
    {
      label: "Delete Certificate",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = filteredCertificationData[index];
        openDeleteSingleModal(row, originalRow.id);
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading certificates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-red-400 mb-4">Error: {error}</div>
        <button 
          onClick={fetchCertificates}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRows(new Set());
            setSingleRowToDelete(null);
          }}
          onConfirm={handleModalConfirm}
          title="Confirm Certificate Deletion"
          description="Deleting this certificate means it will no longer appear in your records."
          image="/images/delete-modal.png"
          confirmText="Delete"
        />
      )}

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-0">
        <div className="lg:flex-1">
          <h2 className="font-semibold text-[18px] sm:text-[20px] leading-[20px]">
            Certification Management
          </h2>
          <p className="font-regular text-[14px] sm:text-[16px] leading-5 mb-4 lg:mb-[22px] pt-2 text-[#FFFFFF99]">
            View and manage all certifications issued on the platform.
          </p>
        </div>

        <div className="flex p-[6px] items-center gap-2 sm:gap-4 rounded-[12px] bg-[#121315] w-fit mx-auto lg:mx-0 mb-3 lg:mb-0 md:mb-3">
          <button
            className={`py-2 px-3 sm:px-4 font-medium cursor-pointer text-xs sm:text-sm rounded-lg transition-colors ${
              activeTab === "active"
                ? "bg-[#EFFC761F] text-[#EFFC76]"
                : "text-[#FFFFFFCC] hover:text-white"
            }`}
            onClick={() => handleTabChange("active")}
          >
            Active
          </button>
          <button
            className={`py-2 px-3 sm:px-4 font-medium cursor-pointer text-xs sm:text-sm rounded-lg transition-colors ${
              activeTab === "revoked"
                ? "bg-[#EFFC761F] text-[#EFFC76]"
                : "text-[#FFFFFFCC] hover:text-white"
            }`}
            onClick={() => handleTabChange("revoked")}
          >
            Revoked
          </button>
          <button
            className={`py-2 px-3 sm:px-4 font-medium cursor-pointer text-xs sm:text-sm rounded-lg transition-colors ${
              activeTab === "expired"
                ? "bg-[#EFFC761F] text-[#EFFC76]"
                : "text-[#FFFFFFCC] hover:text-white"
            }`}
            onClick={() => handleTabChange("expired")}
          >
            Expired
          </button>
        </div>
      </div>

      <div className="flex flex-col justify-between">
        <Table
          data={displayData}
          title="Certificates"
          showDeleteButton={true}
          onDeleteSingle={(row, index) => {
            const originalRow = filteredCertificationData[index];
            openDeleteSingleModal(row, originalRow.id);
          }}
          showPagination={true}
          currentPage={currentPage}
          // totalPages={Math.ceil(filteredCertificationData.length / itemsPerPage)}
          onPageChange={setCurrentPage}
          clickable={true}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          isAllSelected={isAllDisplayedSelected}
          isSomeSelected={isSomeDisplayedSelected}
          rowIds={filteredCertificationData.map((item) => item.id.toString())}
          dropdownItems={dropdownItems}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalItems={filteredCertificationData.length}
          showFilter={true}
          onFilterToggle={setIsFilterOpen}
          onDeleteAll={handleDeleteSelected}
          isDeleteAllDisabled={selectedRows.size === 0}
        />
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Apply Filter"
        description="Refine listings to find the right property faster."
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={{
          "issue Date": issueDate,
          "Expiry Date": expiryDate,
        }}
        onFilterChange={(newValues) => {
          if (newValues["issue Date"] !== undefined) {
            setIssueDate(newValues["issue Date"] as Date | null);
          }
          if (newValues["Expiry Date"] !== undefined) {
            setExpiryDate(newValues["Expiry Date"] as Date | null);
          }
        }}
        dropdownStates={{
          ownership: false,
          property: false,
          status: false,
        }}
        onDropdownToggle={() => {}}
        fields={[
          {
            label: "Issue Date",
            key: "issue Date",
            type: "date",
            placeholder: "Select date",
          },
          {
            label: "Expiry Date",
            key: "Expiry Date",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </>
  );
}