"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Table } from "@/app/shared/tables/Tables";
import FilterDrawer from "@/app/shared/tables/Filter";
import { setting } from "@/app/api/Host/setting";

interface PaymentData {
  id: string;
  createdAt: string;
  amount: number;
  currency: string;
  status: string;
  application?: {
    propertyDetails?: {
      propertyName: string;
    };
  };
}

interface CertificationData {
  id: number;
  "Plan Name": string;
  Amount: string;
  "Purchase Date": string;
  "End Date": string;
  Status: string;
  // Add ISO dates for proper filtering
  purchaseDateISO: string;
  endDateISO: string;
}

// const status = ["COMPLETED", "PENDING", "REJECTED"];

export default function BillingHistory() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<PaymentData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [certificationFilters, setCertificationFilters] = useState({
    planName: "",
    status: "",
    purchaseDate: "", // Store as ISO string for consistent comparison
    endDate: "", // Store as ISO string for consistent comparison
  });

  // State for date pickers
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Dropdown states
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Fetch data from API with proper query parameters
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching billing data with query parameters...");
        
        const response = await setting.getBillingWithParams({
          status: "COMPLETED",
          skip: 0,
          take: 100
        });
        
        console.log("API Response:", response);
        
        // In the useEffect where you set the API data:
if (response.success && response.data && response.data.payments) {
  // Convert amount from string to number
  const paymentsWithNumberAmount = response.data.payments.map(payment => ({
    ...payment,
    amount: parseFloat(payment.amount) || 0
  }));
  setApiData(paymentsWithNumberAmount);
}
     } catch (err: unknown) {
  console.error("Error fetching billing data:", err);
  setError((err as Error).message || "Failed to load billing history");
} finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  // Transform API data to match existing CertificationData structure
  const certificationData = useMemo((): CertificationData[] => {
    if (!apiData.length) return [];

    return apiData.map((payment, index) => {
      const purchaseDateObj = new Date(payment.createdAt);
      const endDateObj = new Date(payment.createdAt);
      
      return {
        id: index + 1,
        "Plan Name": payment.application?.propertyDetails?.propertyName || `Property ${index + 1}`,
        "Amount": `${payment.amount} ${payment.currency}`,
        "Purchase Date": purchaseDateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        "End Date": endDateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        "Status": payment.status,
        // Store ISO dates for consistent filtering
        purchaseDateISO: purchaseDateObj.toISOString().split('T')[0], // YYYY-MM-DD
        endDateISO: endDateObj.toISOString().split('T')[0], // YYYY-MM-DD
      };
    });
  }, [apiData]);

  // Unique dropdown values
  const uniquePlanNames = [
    ...new Set(certificationData.map((item) => item["Plan Name"])),
  ];
  const uniqueStatuses = [
    ...new Set(certificationData.map((item) => item["Status"])),
  ];

  // FIXED: Filter + search logic with proper date comparison
  const filteredCertificationData = useMemo(() => {
    let filtered = certificationData;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item["Plan Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Amount"].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (certificationFilters.planName) {
      filtered = filtered.filter(
        (item) => item["Plan Name"] === certificationFilters.planName
      );
    }
    if (certificationFilters.status) {
      filtered = filtered.filter(
        (item) => item["Status"] === certificationFilters.status
      );
    }
    
    // FIXED: Date filtering using ISO dates
    if (certificationFilters.purchaseDate) {
      filtered = filtered.filter(
        (item) => item.purchaseDateISO === certificationFilters.purchaseDate
      );
    }
    
    // FIXED: Date filtering using ISO dates
    if (certificationFilters.endDate) {
      filtered = filtered.filter(
        (item) => item.endDateISO === certificationFilters.endDate
      );
    }
    
    return filtered;
  }, [searchTerm, certificationFilters, certificationData]);

  // Handle row click to open detail page
  const handleRowClick = (row: Record<string, string>, index: number) => {
    const originalRow = filteredCertificationData[index];
    const actualPaymentId = apiData[index]?.id;
    window.location.href = `/dashboard/billing/detail/${actualPaymentId || originalRow.id}`;
  };

  // Transform data to exclude ID from display and ensure all values are strings
// Remove this line:
// const status = ["COMPLETED", "PENDING", "REJECTED"];

// In the transform function, remove unused destructured parameters:
const displayData = useMemo((): Record<string, string>[] => {
  return filteredCertificationData.map(({ id, purchaseDateISO, endDateISO, ...rest }) => {
    console.log(id, purchaseDateISO, endDateISO)
    const stringRow: Record<string, string> = {};
    Object.entries(rest).forEach(([key, value]) => {
      stringRow[key] = String(value);
    });
    return stringRow;
  });
}, [filteredCertificationData]);

  // Table control
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
    hoverBgColor: "#2D2D2D",
    hoverTextColor: "#ffffff",
    fontSize: 13,
    textAlign: "left" as const,
    rowBorder: false,
    headerBorder: true,
    borderColor: "#374151",
    highlightRowOnHover: true,
  };

  // Reset filters
  const handleResetFilter = () => {
    setCertificationFilters({
      planName: "",
      status: "",
      purchaseDate: "",
      endDate: "",
    });
    setSearchTerm("");
    setPurchaseDate(null);
    setEndDate(null);
  };

  // FIXED: Apply filter with proper date handling
  const handleApplyFilter = () => {
    const newFilters = { ...certificationFilters };

    // Store dates as ISO strings (YYYY-MM-DD) for consistent comparison
    if (purchaseDate) {
      newFilters.purchaseDate = purchaseDate.toISOString().split('T')[0];
    } else {
      newFilters.purchaseDate = "";
    }

    if (endDate) {
      newFilters.endDate = endDate.toISOString().split('T')[0];
    } else {
      newFilters.endDate = "";
    }

    setCertificationFilters(newFilters);
    setIsFilterOpen(false);
  };

  // Only keep View Details in dropdown
  const dropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = filteredCertificationData[index];
        const actualPaymentId = apiData[index]?.id;
        window.location.href = `/dashboard/billing/detail/${actualPaymentId || originalRow.id}`;
      },
    },
  ];

  // Add debug logging to see what's happening
  useEffect(() => {
    console.log("Current filters:", certificationFilters);
    console.log("Filtered data count:", filteredCertificationData.length);
    console.log("All data count:", certificationData.length);
  }, [certificationFilters, filteredCertificationData, certificationData]);

  if (loading) {
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

  if (!apiData.length && !loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">No billing history found</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col justify-between">
        <Table
          data={displayData}
          title="Billing History"
          control={tableControl}
          showDeleteButton={false}
          showPagination={false}
          clickable={true}
          onRowClick={handleRowClick}
          dropdownItems={dropdownItems}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showFilter={true}
          onFilterToggle={setIsFilterOpen}
        />
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Apply Filter"
        description="Refine listings to find the right billing history faster."
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={certificationFilters}
        onFilterChange={(filters) => {
          setCertificationFilters((prev) => ({
            ...prev,
            ...filters,
          }));
        }}
        dropdownStates={{
          planName: planDropdownOpen,
          status: statusDropdownOpen,
        }}
        onDropdownToggle={(key, value) => {
          if (key === "planName") setPlanDropdownOpen(value);
          if (key === "status") setStatusDropdownOpen(value);
        }}
        fields={[
          {
            label: "Plan Name",
            key: "planName",
            type: "dropdown",
            placeholder: "Select plan",
            options: uniquePlanNames,
          },
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: uniqueStatuses,
          },
          {
            label: "Purchase date",
            key: "purchaseDate",
            type: "date",
            placeholder: "Select date",
          },
          {
            label: "End date",
            key: "endDate",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </>
  );
}