"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Table } from "@/app/shared/tables/Tables";
import FilterDrawer from "../../../shared/tables/Filter";
import "react-datepicker/dist/react-datepicker.css";
import { application } from "@/app/api/Host/application";
import type { ApplicationData, PaginationInfo } from "@/app/api/Host/application/types";

interface CustomDateInputProps {
  value?: string;
  onClick?: () => void;
  onChange?: () => void;
}

interface CertificationData {
  id: string;
  "Application ID": string;
  "Property Name": string;
  Address: string;
  Ownership: string;
  "Submitted Date": string;
  Status: string;
}

interface ApiParams {
  page?: number;
  pageSize?: number;
  search?: string;
  ownership?: string;
  status?: string;
  submittedAt?: string;
  propertyName?: string;
}

export default function Applications() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [isLoading, setIsLoading] = useState(true);

  const [showOwnershipDropdown, setShowOwnershipDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    ownership: "",
    status: "",
    submittedDate: "",
    propertyName: "",
  });

  const [tempFilters, setTempFilters] = useState({
    ownership: "",
    status: "",
    submittedDate: "",
    propertyName: "",
  });

  const [submittedDate, setSubmittedDate] = useState<Date | null>(null);

  const [allCertificationData, setAllCertificationData] = useState<CertificationData[]>([]);
  const [, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // State for filter options
  const [allStatuses, setAllStatuses] = useState<string[]>([]);
  const [allOwnerships, setAllOwnerships] = useState<string[]>([]);
  const [, setAllPropertyNames] = useState<string[]>([]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm.trim() !== "" ||
      appliedFilters.ownership.trim() !== "" ||
      appliedFilters.status.trim() !== "" ||
      appliedFilters.submittedDate !== "" ||
      appliedFilters.propertyName.trim() !== ""
    );
  }, [searchTerm, appliedFilters]);

  // Fetch filter options method
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await application.getApplications({
        page: 1,
        pageSize: 1000,
      });

      if (response.success && response.data) {
        const applications = response.data.applications;
        
        const statuses = [...new Set(applications.map((app: ApplicationData) => 
          app.status ? app.status.toUpperCase() : ''
        ))].filter(Boolean);
        
        const ownerships = [...new Set(applications.map((app: ApplicationData) => 
          app.propertyDetails?.ownership || ''
        ))].filter(Boolean);

        const propertyNames = [...new Set(applications.map((app: ApplicationData) => 
          app.propertyDetails?.propertyName || ''
        ))].filter(Boolean);

        setAllStatuses(statuses);
        setAllOwnerships(ownerships);
        setAllPropertyNames(propertyNames);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

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

  // Date formatting methods
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const capitalizeStatusForDisplay = (status: string): string => {
    if (!status) return "";
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const getStatusForAPI = (status: string): string => {
    if (!status) return "";
    return status.toUpperCase();
  };

  // Updated fetchApplications method
  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);

      const queryParams: ApiParams = {};

      if (!hasActiveFilters) {
        queryParams.page = currentPage;
        queryParams.pageSize = itemsPerPage;
      } else {
        if (currentPage > 1) {
          queryParams.page = currentPage;
        }
        if (itemsPerPage !== 6) {
          queryParams.pageSize = itemsPerPage;
        }
      }

      if (searchTerm.trim()) {
        queryParams.search = searchTerm.trim();
      }

      if (appliedFilters.ownership.trim()) {
        queryParams.ownership = appliedFilters.ownership.trim();
      }
      
      if (appliedFilters.status.trim()) {
        queryParams.status = getStatusForAPI(appliedFilters.status.trim());
      }
      
      if (appliedFilters.submittedDate) {
        queryParams.submittedAt = appliedFilters.submittedDate;
      }

      if (appliedFilters.propertyName.trim()) {
        queryParams.propertyName = appliedFilters.propertyName.trim();
      }

      console.log("🚀 HITTING API WITH PARAMS:", queryParams);

      const response = await application.getApplications(queryParams);

      if (response.success && response.data) {
        const transformedData: CertificationData[] = response.data.applications.map((app: ApplicationData) => ({
          id: app.id,
          "Application ID": app.id,
          "Property Name": app.propertyDetails?.propertyName || "N/A",
          Address: app.propertyDetails?.address || "N/A",
          Ownership: app.propertyDetails?.ownership || "-",
          "Current Step": app.currentStep || "-",
          Status: capitalizeStatusForDisplay(app.status || ""),
          "Submitted Date": app.submittedAt ? formatDate(app.submittedAt) : "—",
        }));

        setAllCertificationData(transformedData);
        setPaginationInfo(response.data.pagination || null);
        setTotalItems(response.data.pagination?.total || response.data.total || 0);
      } else {
        console.log("❌ No applications found or API error");
        setAllCertificationData([]);
        setPaginationInfo(null);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("💥 Error fetching applications:", error);
      setAllCertificationData([]);
      setPaginationInfo(null);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    searchTerm,
    appliedFilters.ownership,
    appliedFilters.status,
    appliedFilters.submittedDate,
    appliedFilters.propertyName,
    currentPage,
    itemsPerPage,
    hasActiveFilters,
  ]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const displayData = useMemo(() => {
    return allCertificationData.map(({ id, ...rest }) => {
      return rest;
    });
  }, [allCertificationData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    appliedFilters.ownership,
    appliedFilters.status,
    appliedFilters.submittedDate,
    appliedFilters.propertyName,
  ]);

  // Filter handler methods
  const handleResetFilter = () => {
    const resetFilters = {
      ownership: "",
      status: "",
      submittedDate: "",
      propertyName: "",
    };

    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSubmittedDate(null);
    setSearchTerm("");
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleApplyFilter = () => {
    const dateString = formatDateForAPI(submittedDate);
    
    const filtersToApply = {
      ownership: tempFilters.ownership,
      status: tempFilters.status,
      submittedDate: dateString,
      propertyName: tempFilters.propertyName,
    };

    console.log("🟢 APPLYING FILTERS:", filtersToApply);

    setAppliedFilters(filtersToApply);
    setCurrentPage(1);
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const dropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        const originalRow = allCertificationData[globalIndex];
        if (originalRow) {
          window.location.href = `/dashboard/application/detail/${originalRow.id}`;
        }
      },
    },
  ];

  // Custom input component for date picker
  const CustomDateInput = React.forwardRef<HTMLInputElement, CustomDateInputProps>(
    ({ value, onClick }, ref) => (
      <div className="relative">
        <input
          type="text"
          value={value}
          onClick={onClick}
          ref={ref}
          readOnly
          className="w-full bg-gradient-to-b from-[#202020] to-[#101010] border rounded-xl px-4 py-3 text-sm border-[#404040] focus:border-[#EFFC76] focus:outline-none cursor-pointer text-white placeholder-white/40"
          placeholder="Select date"
        />
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <Image
            src="/images/calender.svg"
            alt="Pick date"
            width={20}
            height={20}
          />
        </div>
      </div>
    )
  );

  CustomDateInput.displayName = "CustomDateInput";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">Loading applications...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col justify-between">
        <form onSubmit={(e) => e.preventDefault()}>
          <Table
            data={displayData}
            title="Applications"
            showDeleteButton={false}
            showPagination={true}
            clickable={true}
            onRowClick={(row: Record<string, string>, index: number) => {
              const globalIndex = (currentPage - 1) * itemsPerPage + index;
              const originalRow = allCertificationData[globalIndex];
              if (originalRow) {
                window.location.href = `/dashboard/application/detail/${originalRow.id}`;
              }
            }}
            dropdownItems={dropdownItems}
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            showFilter={true}
            onFilterToggle={setIsFilterOpen}
            disableClientSidePagination={true}
          />
        </form>
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
        filterValues={{
          ownership: tempFilters.ownership,
          status: tempFilters.status,
          "Submitted On": submittedDate,
          propertyName: tempFilters.propertyName,
        }}
        onFilterChange={(newValues) => {
          if (newValues.ownership !== undefined) {
            setTempFilters(prev => ({ ...prev, ownership: newValues.ownership as string }));
          }
          if (newValues.status !== undefined) {
            setTempFilters(prev => ({ ...prev, status: newValues.status as string }));
          }
          if (newValues["Submitted On"] !== undefined) {
            setSubmittedDate(newValues["Submitted On"] as Date | null);
          }
          if (newValues.propertyName !== undefined) {
            setTempFilters(prev => ({ ...prev, propertyName: newValues.propertyName as string }));
          }
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
            options: allOwnerships.map(ownership => capitalizeStatusForDisplay(ownership)),
          },
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: allStatuses.map(status => capitalizeStatusForDisplay(status)),
          },
          {
            label: "Submitted On",
            key: "Submitted On",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </>
  );
}