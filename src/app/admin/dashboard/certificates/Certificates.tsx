"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "../../tables-essentials/Filter";

interface CertificationData {
  id: number;
  "Certificate ID": string;
  "Host ID": string;
  "Property Name": string;
  "Issue Date": string;
  "Expiry Date": string;
  Status: "active" | "revoked" | "expired";
}

export default function Applications() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"active" | "revoked" | "expired">(
    "active"
  );
  const itemsPerPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: number;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

  const [showOwnershipDropdown, setShowOwnershipDropdown] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [issueDate, setIssueDate] = useState<Date | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);

  const [certificationFilters, setCertificationFilters] = useState({
    issueDate: "",
    expiryDate: "",
  });

  const [allCertificationData, setAllCertificationData] = useState<
    CertificationData[]
  >([
    {
      id: 1,
      "Certificate ID": "CER-8765",
      "Property Name": "Coastal Hillside Estate",
      "Host ID": "76890",
      "Issue Date": "Aug 12, 2024",
      "Expiry Date": "Aug 12, 2025",
      Status: "expired",
    },
    {
      id: 2,
      "Certificate ID": "CER-8766",
      "Host ID": "76891",
      "Property Name": "Coastal Hillside Estate",
      "Issue Date": "Jul 15, 2024",
      "Expiry Date": "Jul 15, 2025",
      Status: "active",
    },
    {
      id: 3,
      "Certificate ID": "CER-8767",
      "Host ID": "76892",
      "Property Name": "Coastal Hillside Estate",
      "Issue Date": "Jun 20, 2024",
      "Expiry Date": "Jun 20, 2025",
      Status: "active",
    },
    {
      id: 4,
      "Certificate ID": "CER-8768",
      "Host ID": "76893",
      "Property Name": "Coastal Hillside Estate",
      "Issue Date": "May 10, 2024",
      "Expiry Date": "May 10, 2025",
      Status: "active",
    },
    {
      id: 5,
      "Certificate ID": "CER-8769",
      "Host ID": "76894",
      "Property Name": "Coastal Hillside Estate",
      "Issue Date": "Apr 05, 2024",
      "Expiry Date": "Apr 05, 2025",
      Status: "active",
    },
    {
      id: 6,
      "Certificate ID": "CER-8770",
      "Host ID": "76895",
      "Property Name": "Coastal Hillside Estate",
      "Issue Date": "Mar 18, 2024",
      "Expiry Date": "Mar 18, 2025",
      Status: "active",
    },
    {
      id: 7,
      "Certificate ID": "CER-8771",
      "Host ID": "76896",
      "Property Name": "Mountain View Complex",
      "Issue Date": "Feb 22, 2024",
      "Expiry Date": "Feb 22, 2025",
      Status: "active",
    },
    {
      id: 8,
      "Certificate ID": "CER-8772",
      "Host ID": "76897",
      "Property Name": "Skyline Residences",
      "Issue Date": "Jan 30, 2024",
      "Expiry Date": "Jan 30, 2025",
      Status: "active",
    },
    {
      id: 9,
      "Certificate ID": "CER-8773",
      "Host ID": "76898",
      "Property Name": "Coastal Hillside Estate",
      "Issue Date": "Dec 15, 2023",
      "Expiry Date": "Dec 15, 2024",
      Status: "expired",
    },
    {
      id: 10,
      "Certificate ID": "CER-8774",
      "Host ID": "76899",
      "Property Name": "Coastal Hillside Estate",
      "Issue Date": "Nov 10, 2023",
      "Expiry Date": "Nov 10, 2024",
      Status: "expired",
    },
    {
      id: 11,
      "Certificate ID": "CER-8775",
      "Host ID": "76900",
      "Property Name": "Coastal Hillside Estate",
      "Issue Date": "Oct 05, 2023",
      "Expiry Date": "Oct 05, 2024",
      Status: "expired",
    },
    {
      id: 12,
      "Certificate ID": "CER-8776",
      "Host ID": "76901",
      "Property Name": "Coastal Hillside Estate",
      "Issue Date": "Sep 01, 2023",
      "Expiry Date": "Sep 01, 2024",
      Status: "expired",
    },
    {
      id: 13,
      "Certificate ID": "CER-8777",
      "Host ID": "76902",
      "Property Name": "Mountain View Complex",
      "Issue Date": "Aug 15, 2023",
      "Expiry Date": "Aug 15, 2024",
      Status: "expired",
    },
    {
      id: 14,
      "Certificate ID": "CER-8778",
      "Host ID": "76903",
      "Property Name": "Skyline Residences",
      "Issue Date": "Jul 20, 2024",
      "Expiry Date": "Jul 20, 2025",
      Status: "revoked",
    },
    {
      id: 15,
      "Certificate ID": "CER-8779",
      "Host ID": "76904",
      "Property Name": "Coastal Hillside Estate",
      "Issue Date": "Jun 10, 2024",
      "Expiry Date": "Jun 10, 2025",
      Status: "revoked",
    },
    {
      id: 16,
      "Certificate ID": "CER-8780",
      "Host ID": "76905",
      "Property Name": "Mountain View Complex",
      "Issue Date": "May 05, 2024",
      "Expiry Date": "May 05, 2025",
      Status: "revoked",
    },
  ]);

  const filteredCertificationData = useMemo(() => {
    let filtered = allCertificationData.filter(
      (item) => item.Status === activeTab
    );

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
          item["Issue Date"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Expiry Date"].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply Issue Date filter
    if (certificationFilters.issueDate) {
      filtered = filtered.filter(
        (item) => item["Issue Date"] === certificationFilters.issueDate
      );
    }

    // Apply Expiry Date filter
    if (certificationFilters.expiryDate) {
      filtered = filtered.filter(
        (item) => item["Expiry Date"] === certificationFilters.expiryDate
      );
    }

    return filtered;
  }, [searchTerm, certificationFilters, allCertificationData, activeTab]);

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

  const handleDeleteApplications = (selectedRowIds: Set<string>) => {
    const idsToDelete = Array.from(selectedRowIds).map((id) => parseInt(id));
    const updatedData = allCertificationData.filter(
      (item) => !idsToDelete.includes(item.id)
    );
    setAllCertificationData(updatedData);
    setIsModalOpen(false);
    setSelectedRows(new Set());
  };

  const handleDeleteSingleApplication = (
    row: Record<string, string>,
    id: number
  ) => {
    const updatedData = allCertificationData.filter((item) => item.id !== id);
    setAllCertificationData(updatedData);
    setIsModalOpen(false);
    setSingleRowToDelete(null);

    // Remove this line completely:
    // const newSelected = new Set(selectedRows);
    // newSelected.delete(id);
    // setSelectedRows(newSelected);

    const remainingDataCount = updatedData.length;
    const maxPageAfterDeletion = Math.ceil(remainingDataCount / itemsPerPage);
    if (currentPage > maxPageAfterDeletion) {
      setCurrentPage(Math.max(1, maxPageAfterDeletion));
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
      handleDeleteApplications(selectedRows);
    } else if (modalType === "single" && singleRowToDelete) {
      handleDeleteSingleApplication(
        singleRowToDelete.row,
        singleRowToDelete.id
      );
    }
  };

  const displayData = useMemo(() => {
    return filteredCertificationData.map(({ id, Status, ...rest }) => {
      console.log(id, Status);
      return rest;
    });
  }, [filteredCertificationData]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [searchTerm, certificationFilters, activeTab]);

  const handleResetFilter = () => {
    setCertificationFilters({
      issueDate: "",
      expiryDate: "",
    });
    setSearchTerm("");
    setIssueDate(null);
    setExpiryDate(null);
  };

  const handleApplyFilter = () => {
    const newFilters = { ...certificationFilters };

    if (issueDate) {
      newFilters.issueDate = issueDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    if (expiryDate) {
      newFilters.expiryDate = expiryDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    setCertificationFilters(newFilters);
    setIsFilterOpen(false);
  };

  const dropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        const originalRow = filteredCertificationData[globalIndex];
        window.location.href = `/admin/dashboard/certificates/detail/${originalRow.id}`;
      },
    },
    {
      label: "Delete Application",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        const originalRow = filteredCertificationData[globalIndex];
        openDeleteSingleModal(row, originalRow.id);
      },
    },
  ];

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
          title="Confirm Application Deletion"
          description="Deleting this application means it will no longer appear in your requests."
          image="/images/delete-modal.png"
          confirmText="Delete"
        />
      )}

      {/* Responsive Header and Tabs */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-0">
        <div className="lg:flex-1">
          <h2 className="font-semibold text-[18px] sm:text-[20px] leading-[20px]">
            Certification Management
          </h2>
          <p className="font-regular text-[14px] sm:text-[16px] leading-5 mb-4 lg:mb-[22px] pt-2 text-[#FFFFFF99]">
            View and manage all certifications issued on the platform.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-[6px] items-center gap-2 sm:gap-4 rounded-[12px] bg-[#121315] w-fit mx-auto lg:mx-0 mb-3 lg:mb-0 md:mb-3">
          <button
            className={`py-2 px-3 sm:px-4 font-medium cursor-pointer text-xs sm:text-sm rounded-lg transition-colors ${
              activeTab === "active"
                ? "bg-[#EFFC761F] text-[#EFFC76]"
                : "text-[#FFFFFFCC] hover:text-white"
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active
          </button>
          <button
            className={`py-2 px-3 sm:px-4 font-medium cursor-pointer text-xs sm:text-sm rounded-lg transition-colors ${
              activeTab === "revoked"
                ? "bg-[#EFFC761F] text-[#EFFC76]"
                : "text-[#FFFFFFCC] hover:text-white"
            }`}
            onClick={() => setActiveTab("revoked")}
          >
            Revoked
          </button>
          <button
            className={`py-2 px-3 sm:px-4 font-medium cursor-pointer text-xs sm:text-sm rounded-lg transition-colors ${
              activeTab === "expired"
                ? "bg-[#EFFC761F] text-[#EFFC76]"
                : "text-[#FFFFFFCC] hover:text-white"
            }`}
            onClick={() => setActiveTab("expired")}
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
            const globalIndex = (currentPage - 1) * itemsPerPage + index;
            const originalRow = filteredCertificationData[globalIndex];
            openDeleteSingleModal(row, originalRow.id);
          }}
          showPagination={false}
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
          isDeleteAllDisabled={
            selectedRows.size === 0 || selectedRows.size < displayData.length
          }
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
          ownership: showOwnershipDropdown,
          property: showPropertyDropdown,
          status: showStatusDropdown,
        }}
        onDropdownToggle={(key, value) => {
          if (key === "ownership") setShowOwnershipDropdown(value);
          if (key === "property") setShowPropertyDropdown(value);
          if (key === "status") setShowStatusDropdown(value);
        }}
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
