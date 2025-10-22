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

export default function Applications() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Match backend default or use from response
  const [isLoading, setIsLoading] = useState(true);

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
  const [, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [totalItems, setTotalItems] = useState(0);

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

  const fetchApplications = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);

      // Include pagination parameters in the API call
      const response = await application.getApplications({
        page: page,
        pageSize: itemsPerPage,
        ...(appliedFilters.ownership && { ownership: appliedFilters.ownership }),
        ...(appliedFilters.status && { status: appliedFilters.status }),
        ...(appliedFilters.submittedDate && { submittedAt: appliedFilters.submittedDate }),
        ...(searchTerm && { search: searchTerm }),
      });

      console.log("API Response:", response);
      console.log("Pagination Info:", response.data?.pagination);

      if (response.success && response.data?.applications) {
        const transformedData: CertificationData[] = response.data.applications.map((app: ApplicationData) => ({
          id: app.id,
          "Application ID": app.id,
          "Property Name": app.propertyDetails?.propertyName || "N/A",
          Address: app.propertyDetails?.address || "N/A",
          Ownership: app.propertyDetails?.ownership || "-",
          "Current Step": app.currentStep || "-",
          Status: capitalizeStatus(app.status || ""),
          "Submitted Date": app.submittedAt ? formatDate(app.submittedAt) : "—",
        }));

        console.log("Transformed Data:", transformedData);

        setAllCertificationData(transformedData);
        setPaginationInfo(response.data.pagination || null);
        setTotalItems(response.data.pagination?.total || response.data.total || 0);
      } else {
        console.log("No applications found or API error");
        setAllCertificationData([]);
        setPaginationInfo(null);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setAllCertificationData([]);
      setPaginationInfo(null);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage, appliedFilters, searchTerm]);

  useEffect(() => {
    fetchApplications(currentPage);
  }, [currentPage, fetchApplications]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const capitalizeStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Remove client-side filtering since we're using backend pagination
  const displayData = useMemo(() => {
    return allCertificationData.map(({ id, ...rest }) => {
      console.log(id);
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
    setCurrentPage(1);
  };

  const handleApplyFilter = () => {
    const filtersToApply = {
      ...tempFilters,
      submittedDate: submittedDate ? submittedDate.toISOString().split("T")[0] : "",
    };

    setAppliedFilters(filtersToApply);
    setIsFilterOpen(false);
    setCurrentPage(1); // Reset to first page when filters change
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
    setCurrentPage(1); // Reset to first page when searching
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
            // control={tableControl}
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
            onSearchChange={handleSearch} // Use the new search handler
            currentPage={currentPage}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems} // Use total from backend
            showFilter={true}
            onFilterToggle={setIsFilterOpen}
            disableClientSidePagination={true} // ✅ ADD THIS

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
            options: [], // These will be populated from backend response
          },
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: [], // These will be populated from backend response
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