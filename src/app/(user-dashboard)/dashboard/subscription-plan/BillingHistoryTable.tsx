"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Table } from "@/app/shared/tables/Tables";
import FilterDrawer from "@/app/shared/tables/Filter";
import { setting } from "@/app/api/Host/setting";

interface PaymentData {
  id: string;
  createdAt: string;
  amount: string; // Changed from number to string to match API response
  currency: string;
  status: "COMPLETED" | "PENDING" | string; // Added specific status types
  application?: {
    propertyDetails?: {
      propertyName: string;
    };
  };
}

interface CertificationData {
  id: string;
  "Plan Name": string;
  Amount: string;
  "Purchase Date": string;
  "End Date": string;
  Status: string;
}

interface ApiParams {
  skip?: number;
  take?: number;
  search?: string;
  planName?: string;
  status?: string;
  purchaseDate?: string;
  endDate?: string;
}

interface FilterValues {
  planName: string;
  status: string;
  purchaseDate: string;
  endDate: string;
}

interface FilterDrawerValues {
  planName?: string;
  status?: string;
  "Purchase Date"?: Date | null;
  "End Date"?: Date | null;
}

export default function BillingHistory() {
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [showPlanNameDropdown, setShowPlanNameDropdown] = useState<boolean>(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState<boolean>(false);

  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({
    planName: "",
    status: "",
    purchaseDate: "",
    endDate: "",
  });

  const [tempFilters, setTempFilters] = useState<FilterValues>({
    planName: "",
    status: "",
    purchaseDate: "",
    endDate: "",
  });

  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [allBillingData, setAllBillingData] = useState<CertificationData[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);

  // State for filter options
  const [allStatuses, setAllStatuses] = useState<string[]>([]);
  const [allPlanNames, setAllPlanNames] = useState<string[]>([]);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Convert status to uppercase for API
  const getStatusForAPI = (status: string): string => {
    if (!status) return "";
    return status.toUpperCase();
  };

  // Fetch filter options method
  const fetchFilterOptions = useCallback(async (): Promise<void> => {
    try {
      const response = await setting.getBillingWithParams({
        skip: 0,
        take: 1000,
      });

      if (response.success && response.data && response.data.payments) {
        const payments = response.data.payments;

        const statuses = [
          ...new Set(
            payments.map((payment: PaymentData) => 
              payment.status ? payment.status.toUpperCase() : ""
            )
          ),
        ].filter(Boolean);

        const planNames = [
          ...new Set(
            payments.map(
              (payment: PaymentData) =>
                payment.application?.propertyDetails?.propertyName || ""
            )
          ),
        ].filter(Boolean);

        setAllStatuses(statuses);
        setAllPlanNames(planNames);
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    if (isFilterOpen) {
      setTempFilters(appliedFilters);
      if (appliedFilters.purchaseDate) {
        setPurchaseDate(new Date(appliedFilters.purchaseDate));
      } else {
        setPurchaseDate(null);
      }
      if (appliedFilters.endDate) {
        setEndDate(new Date(appliedFilters.endDate));
      } else {
        setEndDate(null);
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
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const capitalizeStatusForDisplay = (status: string): string => {
    if (!status) return "";
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  // Calculate skip value based on current page
  const getSkipValue = (page: number): number => {
    return (page - 1) * itemsPerPage;
  };

  // Updated fetchBillingData method following the same pattern
  const fetchBillingData = useCallback(async (): Promise<void> => {
    try {
      // Don't make API call if search term is 1-2 characters
      if (
        debouncedSearchTerm.trim().length > 0 &&
        debouncedSearchTerm.trim().length < 3
      ) {
        console.log("🔍 Search term too short, skipping API call");
        setIsLoading(false);
        return;
      }

      // setIsLoading(true);

      const queryParams: ApiParams = {
        skip: getSkipValue(currentPage),
        take: itemsPerPage,
      };

      // Only include search if it has 3+ characters
      if (debouncedSearchTerm.trim().length >= 3) {
        queryParams.search = debouncedSearchTerm.trim();
      }

      if (appliedFilters.planName.trim()) {
        queryParams.planName = appliedFilters.planName.trim();
      }

      if (appliedFilters.status.trim()) {
        queryParams.status = getStatusForAPI(appliedFilters.status.trim());
      }

      if (appliedFilters.purchaseDate) {
        queryParams.purchaseDate = appliedFilters.purchaseDate;
      }

      if (appliedFilters.endDate) {
        queryParams.endDate = appliedFilters.endDate;
      }

      console.log("🚀 HITTING BILLING API WITH PARAMS:", queryParams);

      const response = await setting.getBillingWithParams(queryParams);

      if (response.success && response.data && response.data.payments) {
        const transformedData: CertificationData[] = response.data.payments.map(
          (payment: PaymentData, index: number) => ({
            id: payment.id,
            "Plan Name":
              payment.application?.propertyDetails?.propertyName ||
              `Property ${index + 1}`,
            Amount: `${payment.amount} ${payment.currency}`,
            "Purchase Date": payment.createdAt
              ? formatDate(payment.createdAt)
              : "—",
            "End Date": payment.createdAt
              ? formatDate(payment.createdAt)
              : "—",
            Status: capitalizeStatusForDisplay(payment.status || ""),
          })
        );

        setAllBillingData(transformedData);
        setTotalItems(response.data.total || response.data.payments.length || 0);
        setError(null);
      } else {
        console.log("❌ No billing data found or API error");
        setAllBillingData([]);
        setTotalItems(0);
        setError("No billing data found");
      }
    } catch (err) {
      console.error("💥 Error fetching billing data:", err);
      setAllBillingData([]);
      setTotalItems(0);
      setError("Failed to load billing history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearchTerm,
    appliedFilters.planName,
    appliedFilters.status,
    appliedFilters.purchaseDate,
    appliedFilters.endDate,
    currentPage,
    itemsPerPage,
  ]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  // Include id in display data for row click handling
  const displayData = useMemo((): Record<string, string>[] => {
    return allBillingData.map(({ id, ...rest }) => {
      const stringRow: Record<string, string> = {};
      Object.entries(rest).forEach(([key, value]) => {
        stringRow[key] = String(value);
      });
      stringRow.id = id;
      return stringRow;
    });
  }, [allBillingData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    appliedFilters.planName,
    appliedFilters.status,
    appliedFilters.purchaseDate,
    appliedFilters.endDate,
  ]);

  // Filter handler methods
  const handleResetFilter = (): void => {
    const resetFilters: FilterValues = {
      planName: "",
      status: "",
      purchaseDate: "",
      endDate: "",
    };

    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPurchaseDate(null);
    setEndDate(null);
    setSearchTerm("");
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleApplyFilter = (): void => {
    const purchaseDateString = formatDateForAPI(purchaseDate);
    const endDateString = formatDateForAPI(endDate);

    const filtersToApply: FilterValues = {
      planName: tempFilters.planName,
      status: tempFilters.status,
      purchaseDate: purchaseDateString,
      endDate: endDateString,
    };

    console.log("🟢 APPLYING BILLING FILTERS:", filtersToApply);

    setAppliedFilters(filtersToApply);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleCloseFilter = (): void => {
    setTempFilters(appliedFilters);
    if (appliedFilters.purchaseDate) {
      setPurchaseDate(new Date(appliedFilters.purchaseDate));
    } else {
      setPurchaseDate(null);
    }
    if (appliedFilters.endDate) {
      setEndDate(new Date(appliedFilters.endDate));
    } else {
      setEndDate(null);
    }
    setIsFilterOpen(false);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleSearch = (term: string): void => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilterChange = (newValues: Partial<FilterDrawerValues>): void => {
    if (newValues.planName !== undefined) {
      setTempFilters((prev) => ({
        ...prev,
        planName: newValues.planName as string,
      }));
    }
    if (newValues.status !== undefined) {
      setTempFilters((prev) => ({
        ...prev,
        status: newValues.status as string,
      }));
    }
    if (newValues["Purchase Date"] !== undefined) {
      setPurchaseDate(newValues["Purchase Date"] as Date | null);
    }
    if (newValues["End Date"] !== undefined) {
      setEndDate(newValues["End Date"] as Date | null);
    }
  };

  const dropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>) => {
        if (row.id) {
          window.location.href = `/dashboard/billing/detail/${row.id}`;
        }
      },
    },
  ];

  // Table control
  const tableControl = {
    hover: true,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading billing history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-center">
          <p className="font-semibold">Error Loading Data</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Only hide completely if there's no data initially and no error
  if (!isLoading && allBillingData.length === 0 && !error) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col justify-between">
        <form onSubmit={(e) => e.preventDefault()}>
          <Table
            data={displayData}
            title="Billing History"
            control={tableControl}
            showDeleteButton={false}
            showPagination={true}
            clickable={false}
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
        description="Refine listings to find the right billing history faster."
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={{
          planName: tempFilters.planName,
          status: tempFilters.status,
          "Purchase Date": purchaseDate,
          "End Date": endDate,
        }}
        onFilterChange={handleFilterChange}
        dropdownStates={{
          planName: showPlanNameDropdown,
          status: showStatusDropdown,
        }}
        onDropdownToggle={(key: string, value: boolean) => {
          if (key === "planName") setShowPlanNameDropdown(value);
          if (key === "status") setShowStatusDropdown(value);
        }}
        fields={[
          {
            label: "Plan Name",
            key: "planName",
            type: "dropdown",
            placeholder: "Select plan",
            options: allPlanNames.map((planName) =>
              capitalizeStatusForDisplay(planName)
            ),
          },
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: allStatuses.map((status) =>
              capitalizeStatusForDisplay(status)
            ),
          },
          {
            label: "Purchase Date",
            key: "Purchase Date",
            type: "date",
            placeholder: "Select date",
          },
          {
            label: "End Date",
            key: "End Date",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </>
  );
}