"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "../../tables-essentials/Filter";
import { application } from "@/app/api/Admin/application";
import type { Application } from "@/app/api/Admin/application/types";

interface ApiParams {
  page: number;
  pageSize: number;
  search?: string;
  ownership?: string;
  status?: string;
  submittedAt?: string;
}

interface CertificationData {
  id: string;
  "Application ID": string;
  "Property Name": string;
  Address: string;
  Ownership: string;
  Status: string;
  "Submitted Date": string;
}

interface PaginationData {
  total: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function Applications() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // This should match your desired page size
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: string;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

  const [showOwnershipDropdown, setShowOwnershipDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    ownership: "",
    status: "",
    submittedDate: "",
  });

  const [tempFilters, setTempFilters] = useState({
    ownership: "",
    status: "",
    submittedDate: "",
  });

  const [submittedDate, setSubmittedDate] = useState<Date | null>(null);

  const [allCertificationData, setAllCertificationData] = useState<CertificationData[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData>({
    total: 0,
    pageSize: 6,
    currentPage: 1,
    totalPages: 1,
    nextPage: null,
    prevPage: null,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    if (isFilterOpen) {
      setTempFilters(appliedFilters);
      if (appliedFilters.submittedDate) {
        setSubmittedDate(new Date(appliedFilters.submittedDate));
      } else {
        setSubmittedDate(null);
      }
    }
  }, [isFilterOpen, appliedFilters]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const capitalizeStatus = (status: string): string => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);

      const apiParams: ApiParams = {
        page: currentPage, // Use current page from state
        pageSize: itemsPerPage, // Use itemsPerPage from state
      };

      if (searchTerm) apiParams.search = searchTerm.trim();
      if (appliedFilters.ownership)
        apiParams.ownership = appliedFilters.ownership.trim();
      if (appliedFilters.status)
        apiParams.status = appliedFilters.status.trim();
      if (appliedFilters.submittedDate)
        apiParams.submittedAt = appliedFilters.submittedDate;

      console.log("🔹 API Parameters:", apiParams);

      const response = await application.getApplication(apiParams);
      console.log("🔹 API Response:", response);

      if (response.success && response.data) {
        // Transform API response into table data
        const transformedData: CertificationData[] = response.data.applications.map((app: unknown) => ({
  id: (app as { id: string }).id,
  "Application ID": (app as { id: string }).id.substring(0, 8) + "...",
  "Property Name": (app as { propertyDetails?: { propertyName?: string } }).propertyDetails?.propertyName || "N/A",
  Address: (app as { propertyDetails?: { address?: string } }).propertyDetails?.address || "N/A", 
  Ownership: (app as { propertyDetails?: { ownership?: string } }).propertyDetails?.ownership || "N/A",
  "Current Step": (app as { currentStep?: string }).currentStep || "N/A",
  Status: capitalizeStatus((app as { status: string }).status),
  "Submitted Date": (app as { submittedAt?: string }).submittedAt ? formatDate((app as { submittedAt?: string }).submittedAt!) : "—",
}));
        console.log("🔹 Transformed data count:", transformedData.length);

        // Set the data and pagination from API response
        setAllCertificationData(transformedData);

        if (response.data.pagination) {
          setPaginationData(response.data.pagination);
          console.log("🔹 Pagination data:", response.data.pagination);
        }
      } else {
        console.error("❌ Unexpected response:", response);
        setAllCertificationData([]);
        setPaginationData({
          total: 0,
          pageSize: itemsPerPage,
          currentPage: 1,
          totalPages: 1,
          nextPage: null,
          prevPage: null,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error("🚨 Error fetching applications:", error);
      setAllCertificationData([]);
      setPaginationData({
        total: 0,
        pageSize: itemsPerPage,
        currentPage: 1,
        totalPages: 1,
        nextPage: null,
        prevPage: null,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    searchTerm,
    appliedFilters.ownership,
    appliedFilters.status,
    appliedFilters.submittedDate,
    currentPage,
    itemsPerPage,
  ]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const displayData = useMemo(() => {
    return allCertificationData.map(({ id, ...rest }) => {
      console.log("🆔 Certification ID:", id);
      return rest;
    });
  }, [allCertificationData]);
  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      allCertificationData.forEach((item) => newSelected.add(item.id));
    } else {
      allCertificationData.forEach((item) => newSelected.delete(item.id));
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
      allCertificationData.length > 0 &&
      allCertificationData.every((item) => selectedRows.has(item.id))
    );
  }, [allCertificationData, selectedRows]);

  const isSomeDisplayedSelected = useMemo(() => {
    return (
      allCertificationData.some((item) => selectedRows.has(item.id)) &&
      !isAllDisplayedSelected
    );
  }, [allCertificationData, selectedRows, isAllDisplayedSelected]);

  const handleDeleteApplications = async (selectedRowIds: Set<string>) => {
    try {
      const deletePromises = Array.from(selectedRowIds).map((id) =>
        application.deleteApplication(id)
      );

      await Promise.all(deletePromises);

      await fetchApplications();

      setIsModalOpen(false);
      setSelectedRows(new Set());
    } catch (error) {
      console.error("Error deleting applications:", error);
    }
  };

  const handleDeleteSingleApplication = async (
    row: Record<string, string>,
    id: string
  ) => {
    try {
      await application.deleteApplication(id);

      await fetchApplications();

      setIsModalOpen(false);
      setSingleRowToDelete(null);

      const newSelected = new Set(selectedRows);
      newSelected.delete(id);
      setSelectedRows(newSelected);
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const openDeleteSingleModal = (row: Record<string, string>, id: string) => {
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

  const tableControl = {
    hover: true,
    striped: false,
    bordered: false,
    shadow: false,
    compact: false,
    headerBgColor: "#252628",
    headerTextColor: "white",
    rowBgColor: "black",
    rowTextColor: "#e5e7eb",
    hoverBgColor: "black",
    hoverTextColor: "#ffffff",
    fontSize: 13,
    textAlign: "left" as const,
    rowBorder: false,
    headerBorder: true,
    borderColor: "#374151",
    highlightRowOnHover: true,
  };

  const uniqueStatuses = [
    ...new Set(allCertificationData.map((item) => item["Status"])),
  ];
  const uniqueOwnerships = [
    ...new Set(allCertificationData.map((item) => item["Ownership"])),
  ];

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    appliedFilters.ownership,
    appliedFilters.status,
    appliedFilters.submittedDate,
  ]);

  const handleResetFilter = () => {
    const resetFilters = {
      ownership: "",
      status: "",
      submittedDate: "",
    };

    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSubmittedDate(null);
    setIsFilterOpen(false);
  };

  const handleApplyFilter = () => {
    const filtersToApply = {
      ...tempFilters,
      submittedDate: submittedDate
        ? submittedDate.toISOString().split("T")[0]
        : "",
    };

    console.log("Applying filters:", filtersToApply);
    setAppliedFilters(filtersToApply);
    setIsFilterOpen(false);
  };

  const handleCloseFilter = () => {
    setTempFilters(appliedFilters);
    if (appliedFilters.submittedDate) {
      setSubmittedDate(new Date(appliedFilters.submittedDate));
    } else {
      setSubmittedDate(null);
    }
    setIsFilterOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const dropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = allCertificationData[index];
        window.location.href = `/admin/dashboard/application/detail/${originalRow.id}`;
      },
    },
    {
      label: "Delete Application",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = allCertificationData[index];
        openDeleteSingleModal(row, originalRow.id);
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">Loading applications...</p>
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
          title="Confirm Application Deletion"
          description="Deleting this application means it will no longer appear in your requests."
          image="/images/delete-modal.png"
          confirmText="Delete"
        />
      )}

      <div>
        <h2 className="font-semibold text-[20px] leading-[20px]">
          Review Applications
        </h2>
        <p className="font-regular text-[16px] leading-5 mb-[22px] pt-2 text-[#FFFFFF99]">
          Review and manage all submitted property certification applications in
          one place.
        </p>
      </div>

      <div className="flex flex-col justify-between">
        <Table
          data={displayData}
          title="Applications"
          control={tableControl}
          showDeleteButton={true}
          onDeleteSingle={(row, index) => {
            const originalRow = allCertificationData[index];
            openDeleteSingleModal(row, originalRow.id);
          }}
          showPagination={true}
          clickable={true}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          isAllSelected={isAllDisplayedSelected}
          isSomeSelected={isSomeDisplayedSelected}
          rowIds={allCertificationData.map((item) => item.id)}
          dropdownItems={dropdownItems}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={paginationData.pageSize}
          totalItems={paginationData.total || 0}
          showFilter={true}
          onFilterToggle={setIsFilterOpen}
          onDeleteAll={handleDeleteSelected}
          isDeleteAllDisabled={
            selectedRows.size === 0 || selectedRows.size < displayData.length
          }
          disableClientSidePagination={true}

        />
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={handleCloseFilter}
        title="Apply Filter"
        description="Refine listings to find the right property faster."
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={tempFilters}
        onFilterChange={(filters) => {
          setTempFilters((prev) => ({
            ...prev,
            ...filters,
          }));
        }}
        dropdownStates={{
          ownership: showOwnershipDropdown,
          status: showStatusDropdown,
        }}
        onDropdownToggle={(key, value) => {
          if (key === "ownership") setShowOwnershipDropdown(value);
          if (key === "status") setShowStatusDropdown(value);
        }}
        fields={[
          {
            label: "Ownership",
            key: "ownership",
            type: "dropdown",
            placeholder: "Select ownership",
            options: uniqueOwnerships,
          },
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: uniqueStatuses,
          },
          {
            label: "Submitted On",
            key: "submittedDate",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </>
  );
}