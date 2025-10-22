"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/shared/tables/Filter";

interface CertificationData {
  id: number;
  "Host Name": string;
  "Property Name": string;
  "Issue Date": string;
  "Expiry Date": string;
  "Status": "Active" | "revoked" | "Expired";
}

export default function Applications() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ActiveTab, ] = useState<"Active" | "Expired">("Active");
  const itemsPerPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
// Change from Set<number> to Set<string>
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

  const [allCertificationData, setAllCertificationData] = useState<CertificationData[]>([
    {
      id: 1,
      "Property Name": "Coastal Hillside Estate",

      "Host Name": "Emily John",
      "Issue Date": "Aug 12, 2024",
      "Expiry Date": "Aug 12, 2025",
      "Status": "Expired"
    },
    {
      id: 2,
      "Property Name": "Coastal Hillside Estate",

      "Host Name": "Emily John",
      "Issue Date": "Jul 15, 2024",
      "Expiry Date": "Jul 15, 2025",
      "Status": "Active"
    },
    {
      id: 3,
      "Property Name": "Coastal Hillside Estate",

      "Host Name": "Emily John",
      "Issue Date": "Jun 20, 2024",
      "Expiry Date": "Jun 20, 2025",
      "Status": "Active"
    },
    {
      id: 4,
      "Property Name": "Coastal Hillside Estate",

      "Host Name": "Emily John",
      "Issue Date": "May 10, 2024",
      "Expiry Date": "May 10, 2025",
      "Status": "Active"
    },
    {
      id: 5,
      "Property Name": "Coastal Hillside Estate",

      "Host Name": "Emily John",
      "Issue Date": "Apr 05, 2024",
      "Expiry Date": "Apr 05, 2025",
      "Status": "Active"
    },
    {
      id: 6,
      "Property Name": "Coastal Hillside Estate",

      "Host Name": "Emily John",
      "Issue Date": "Mar 18, 2024",
      "Expiry Date": "Mar 18, 2025",
      "Status": "Active"
    },
    {
      id: 7,
      "Property Name": "Mountain View Complex",

      "Host Name": "Emily John",
      "Issue Date": "Feb 22, 2024",
      "Expiry Date": "Feb 22, 2025",
      "Status": "Active"
    },
    {
      "Host Name": "Emily John",
      "Property Name": "Skyline Residences",
      id: 8,

      "Issue Date": "Jan 30, 2024",
      "Expiry Date": "Jan 30, 2025",
      "Status": "Active"
    },
    
      ]);

  const filteredCertificationData = useMemo(() => {
  let filtered = allCertificationData; // Remove the status filter
  
  if (searchTerm) {
    filtered = filtered.filter(
      (item) =>
        item["Property Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
        item["Host Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
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
}, [searchTerm, certificationFilters, allCertificationData]); // Remove ActiveTab from dependencies
  const handleSelectAll = (checked: boolean) => {
  const newSelected = new Set<string>();
  if (checked) {
    filteredCertificationData.forEach((item) => newSelected.add(item.id.toString()));
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
    filteredCertificationData.every((item) => selectedRows.has(item.id.toString()))
  );
}, [filteredCertificationData, selectedRows]);

  const isSomeDisplayedSelected = useMemo(() => {
  return (
    filteredCertificationData.some((item) => selectedRows.has(item.id.toString())) &&
    !isAllDisplayedSelected
  );
}, [filteredCertificationData, selectedRows, isAllDisplayedSelected]);

 const handleDeleteApplications = (selectedRowIds: Set<string>) => {
  const idsToDelete = Array.from(selectedRowIds).map(id => parseInt(id));
  const updatedData = allCertificationData.filter((item) => !idsToDelete.includes(item.id));
  setAllCertificationData(updatedData);
  setIsModalOpen(false);
  setSelectedRows(new Set());
};
  const handleDeleteSingleApplication = (row: Record<string, string>, id: number) => {
  const updatedData = allCertificationData.filter((item) => item.id !== id);
  setAllCertificationData(updatedData);
  setIsModalOpen(false);
  setSingleRowToDelete(null);

  // Remove these 3 lines:
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
      handleDeleteSingleApplication(singleRowToDelete.row, singleRowToDelete.id);
    }
  };

  const displayData = useMemo(() => {
    return filteredCertificationData.map(({ id, ...rest }) => {
      console.log(id)
      return rest;
    });
  }, [filteredCertificationData]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [searchTerm, certificationFilters, ActiveTab]);

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
    // {
    //   label: "View Details",
    //   onClick: (row: Record<string, string>, index: number) => {
    //     const globalIndex = (currentPage - 1) * itemsPerPage + index;
    //     const originalRow = filteredCertificationData[globalIndex];
    //     window.location.href = `/super-admin/dashboard/certificates/detail/${originalRow.id}`;
    //   },
    // },
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
       

        
        
         
      </div>

      <div className="flex flex-col !h-full justify-between">
        <Table
          data={displayData}
          title="Properties Verified Under This Certificate"
          setHeight={false}
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
          isDeleteAllDisabled={selectedRows.size === 0 || selectedRows.size < displayData.length}
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