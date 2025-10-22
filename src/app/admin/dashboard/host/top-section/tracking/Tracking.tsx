"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/admin/tables-essentials/Filter";
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

export default function Applications() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: string;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

  // Dropdown states
  const [showOwnershipDropdown, setShowOwnershipDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Separate state for applied filters vs temporary filter selections
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
  const [, setTotalItems] = useState(0);

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

  // Helper function to format date
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
        page: 1,
        pageSize: 100,
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
        // 🔹 Step 1: Convert API response into table data
        let transformedData: CertificationData[] =
          response.data.applications.map((app: Application) => ({
            id: app.id,
            "Application ID": app.id.substring(0, 8) + "...",
            "Property Name": app.propertyDetails?.propertyName || "N/A",
            Address: app.propertyDetails?.address || "N/A",
            Ownership: app.propertyDetails?.ownership || "N/A",
            Status: capitalizeStatus(app.status),
            "Submitted Date": app.submittedAt
              ? formatDate(app.submittedAt)
              : "—",
          }));

        // 🔹 Step 2: Apply ownership filter client-side (if backend doesn't filter)
        if (appliedFilters.ownership) {
          const ownershipFilter = appliedFilters.ownership.toLowerCase();
          transformedData = transformedData.filter(
            (item) => item.Ownership.toLowerCase() === ownershipFilter
          );
        }

        // 🔹 Step 3: Update the UI
        console.log("🔹 Filtered data count:", transformedData.length);
        setAllCertificationData(transformedData);
        setTotalItems(transformedData.length);
      } else {
        console.error("❌ Unexpected response:", response);
        setAllCertificationData([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("🚨 Error fetching applications:", error);
      setAllCertificationData([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    searchTerm,
    appliedFilters.ownership,
    appliedFilters.status,
    appliedFilters.submittedDate,
  ]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // 🔹 Only show first 5 applications
  const limitedData = useMemo(() => {
    return allCertificationData.slice(0, 5);
  }, [allCertificationData]);

  const displayData = useMemo(() => {
    return limitedData.map(({ id, ...rest }) => {
      console.log("Application ID:", id);
      return rest;
    });
  }, [limitedData]);

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      limitedData.forEach((item) => newSelected.add(item.id));
    } else {
      limitedData.forEach((item) => newSelected.delete(item.id));
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
      limitedData.length > 0 &&
      limitedData.every((item) => selectedRows.has(item.id))
    );
  }, [limitedData, selectedRows]);

  const isSomeDisplayedSelected = useMemo(() => {
    return (
      limitedData.some((item) => selectedRows.has(item.id)) &&
      !isAllDisplayedSelected
    );
  }, [limitedData, selectedRows, isAllDisplayedSelected]);

  const handleDeleteApplications = async (selectedRowIds: Set<string>) => {
    try {
      const deletePromises = Array.from(selectedRowIds).map((id) =>
        application.deleteApplication(id)
      );

      await Promise.all(deletePromises);

      // Refresh the applications list
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

      // Refresh the applications list
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

  // ✅ ENHANCED RESET FILTER FUNCTION
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

  const dropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = limitedData[index];
        window.location.href = `/admin/dashboard/application/detail/${originalRow.id}`;
      },
    },
    {
      label: "Delete Application",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = limitedData[index];
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

      <div className="flex flex-col justify-between pt-5">
        <Table
          setHeight={false}
          data={displayData}
          title="Applications"
          control={tableControl}
          showDeleteButton={true}
          onDeleteSingle={(row, index) => {
            const originalRow = limitedData[index];
            openDeleteSingleModal(row, originalRow.id);
          }}
          showPagination={false} // 🔹 Remove pagination
          clickable={true}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          isAllSelected={isAllDisplayedSelected}
          isSomeSelected={isSomeDisplayedSelected}
          rowIds={limitedData.map((item) => item.id)}
          dropdownItems={dropdownItems}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalItems={limitedData.length}
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