"use client";
import Image from "next/image";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Table } from "@/app/shared/tables/Tables";
import "react-datepicker/dist/react-datepicker.css";
import FilterDrawer from "@/app/shared/tables/Filter";
import { certifications } from "@/app/api/Host/certification/index";
import { dashboard } from "@/app/api/Host/dashboard";
import { useRouter } from "next/navigation";

interface CustomDateInputProps {
  value?: string;
  onClick?: () => void;
}

interface CertificationDataItem {
  id: number;
  "Property Name": string;
  Address: string;
  "Certificate Expiry Date": string;
  Status: string;
  [key: string]: string | number;
}

interface CertificationApiItem {
  id: string;
  status?: string;
  expiresAt?: string | null;
  application?: {
    propertyDetails?: {
      propertyName?: string;
      address?: string;
    };
  };
}

interface ApplicationTrackerData {
  id: number;
  title: string;
  percentage: string;
  bg: string;
  minibg: string;
}

export default function Tracking() {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // const [, ] = useState<"certification" | "application">(
  //   "certification"
  // );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const [appliedFilters, setAppliedFilters] = useState({
    listedProperty: "",
    status: "",
    expiryDate: "",
  });

  const [tempFilters, setTempFilters] = useState({
    listedProperty: "",
    status: "",
    expiryDate: "",
  });

  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [expiryDate, setExpiryDate] = useState<Date | null>(null);

  const [certificationData, setCertificationData] = useState<
    CertificationDataItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const [trackingData, setTrackingData] = useState<ApplicationTrackerData[]>([]);
  const [isTrackerLoading, setIsTrackerLoading] = useState(false);

  // State for tooltip
  const [tooltip, setTooltip] = useState({
    show: false,
    text: "",
    bgColor: "",
    x: 0,
    y: 0
  });

  useEffect(() => {
    if (isFilterOpen) {
      setTempFilters(appliedFilters);
      if (appliedFilters.expiryDate) {
        setExpiryDate(new Date(appliedFilters.expiryDate));
      } else {
        setExpiryDate(null);
      }
    }
  }, [isFilterOpen, appliedFilters]);

  const fetchCertifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await certifications.getCertifications();

      if (
        response?.data?.certifications &&
        Array.isArray(response.data.certifications)
      ) {
        const mappedData: CertificationDataItem[] =
          response.data.certifications.map(
            (item: CertificationApiItem, index: number) => ({
              id: index + 1,
              "Property Name":
                item.application?.propertyDetails?.propertyName ||
                "Coastal Hillside Estate",
              Address:
                item.application?.propertyDetails?.address ||
                "762 Evergreen Terrace",
              "Certificate Expiry Date": item.expiresAt
                ? new Date(item.expiresAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Aug 12, 2025",
              Status: item.status ? capitalizeStatus(item.status) : "Verified",
            })
          );

        setCertificationData(mappedData);
      } else {
        setCertificationData([]);
      }
    } catch (error) {
      console.error("Error fetching certifications:", error);
      setCertificationData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertifications();
  }, [fetchCertifications]);

  const fetchApplicationTracker = useCallback(async () => {
    try {
      setIsTrackerLoading(true);
      const response = await dashboard.fetchApplicationTracker();

      if (response?.data?.data && Array.isArray(response.data.data)) {
        const firstFourProperties = response.data.data.slice(0, 4);

        const something = response.data

        console.log("Final Data : " , something)
        
        const mappedTrackerData: ApplicationTrackerData[] = firstFourProperties.map((item, index) => {
          const colorIndex = index % 4;
          const colors = [
            { bg: "#aae6ff", minibg: "#2185AF" }, 
            { bg: "#f5ff94", minibg: "#BCCC29" }, 
            { bg: "#CCFFA4", minibg: "#6BBE2B" }, 
            { bg: "#EFC8FF", minibg: "#A745CE" },
          ];

          const colorSet = colors[colorIndex];

          return {
            id: item.id ? parseInt(item.id) : index + 1,
            title: item.name?.propertyName || "Unnamed Property",
            percentage: item.percentage.toString(),
            bg: colorSet.bg,
            minibg: colorSet.minibg,
          };
        });

        setTrackingData(mappedTrackerData);
      } else {
        setTrackingData([]);
      }
    } catch (error) {
      console.error("Error fetching application tracker:", error);
      setTrackingData([]);
    } finally {
      setIsTrackerLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplicationTracker();
  }, [fetchApplicationTracker]);

  // ✅ FIXED: Added the missing handleFilterChange function
  const handleFilterChange = (
    filters: Record<string, string | Date | null>
  ) => {
    // Filter out Date and null values, only keep string values for tempFilters
    const stringFilters: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === "string") {
        stringFilters[key] = value;
      }
      // Ignore Date and null values as they are handled separately by the date picker state
    });

    setTempFilters((prev) => ({
      ...prev,
      ...stringFilters,
    }));
  };

  // Tooltip handlers
  const handleMouseEnter = (e: React.MouseEvent, text: string, bgColor: string) => {
    const element = e.currentTarget;
    const isTextOverflowing = element.scrollWidth > element.clientWidth;
    
    if (isTextOverflowing) {
      setTooltip({
        show: true,
        text,
        bgColor,
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltip.show) {
      setTooltip(prev => ({
        ...prev,
        x: e.clientX,
        y: e.clientY
      }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip({
      show: false,
      text: "",
      bgColor: "",
      x: 0,
      y: 0
    });
  };

  const capitalizeStatus = (status: string): string => {
    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase().replace("_", " ")
    );
  };

  const formatDateForComparison = (dateString: string): string => {
    if (dateString === "—") return "";

    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const filteredCertificationData = useMemo(() => {
    return certificationData.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        Object.values(item).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesProperty =
        appliedFilters.listedProperty === "" ||
        item["Property Name"].toLowerCase() ===
          appliedFilters.listedProperty.toLowerCase();

      const matchesStatus =
        appliedFilters.status === "" ||
        item["Status"].toLowerCase() === appliedFilters.status.toLowerCase();

      const matchesDate =
        appliedFilters.expiryDate === "" ||
        (item["Certificate Expiry Date"] !== "—" &&
          formatDateForComparison(item["Certificate Expiry Date"]) ===
            appliedFilters.expiryDate);

      return matchesSearch && matchesProperty && matchesStatus && matchesDate;
    });
  }, [certificationData, searchTerm, appliedFilters]);

  // Table control - same as before
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

  const uniqueProperties = [
    ...new Set(certificationData.map((item) => item["Property Name"])),
  ];
  const uniqueStatuses = [
    ...new Set(certificationData.map((item) => item["Status"])),
  ];

  const displayData = useMemo(() => {
    return filteredCertificationData.map(({ id, ...rest }) => {
      console.log("Application ID:", id); // ✅ Safely log the ID

      // Convert all values to strings to match Table component expectations
      const stringifiedRest: Record<string, string> = {};
      Object.entries(rest).forEach(([key, value]) => {
        stringifiedRest[key] = String(value);
      });

      return stringifiedRest;
    });
  }, [filteredCertificationData]);


  // ✅ FIXED: Reset to page 1 when filters or search term changes (same as application table)
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    appliedFilters.listedProperty,
    appliedFilters.status,
    appliedFilters.expiryDate,
  ]);

  // ✅ FIXED: Enhanced reset filter function (same as application table)
  const handleResetFilter = () => {
    const resetFilters = {
      listedProperty: "",
      status: "",
      expiryDate: "",
    };

    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setExpiryDate(null);
    setIsFilterOpen(false); // Auto-close the filter
  };

  // ✅ FIXED: Enhanced apply filter function (same as application table)
  const handleApplyFilter = () => {
    const filtersToApply = {
      ...tempFilters,
      expiryDate: expiryDate ? expiryDate.toISOString().split("T")[0] : "",
    };

    setAppliedFilters(filtersToApply);
    setIsFilterOpen(false);
  };

  // ✅ FIXED: Handle closing the drawer - reset temp filters to current applied state (same as application table)
  const handleCloseFilter = () => {
    setTempFilters(appliedFilters);
    if (appliedFilters.expiryDate) {
      setExpiryDate(new Date(appliedFilters.expiryDate));
    } else {
      setExpiryDate(null);
    }
    setIsFilterOpen(false);
  };

  // Handle dropdown toggle
  const handleDropdownToggle = (key: string, value: boolean) => {
    if (key === "listedProperty") {
      setShowPropertyDropdown(value);
    } else if (key === "status") {
      setShowStatusDropdown(value);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Dropdown items for table actions
  const dropdownItems = [
    {
      label: "View Detail",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        const originalRow = filteredCertificationData[globalIndex];
        if (originalRow && originalRow.id) {
          router.push(`/dashboard/certificates/detail/${originalRow.id}`);
        }
      },
    },
  ];

  const CustomDateInput = React.forwardRef(
    (
      { value, onClick }: CustomDateInputProps,
      ref: React.Ref<HTMLInputElement>
    ) => (
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
        <p className="text-white">Loading certifications...</p>
      </div>
    );
  }

  return (
    <>
      {/* Tooltip Component */}
      {tooltip.show && (
        <div 
          className="fixed z-50 px-3 py-2 text-sm text-[#121315CC] font-semibold rounded-lg shadow-lg pointer-events-none transition-opacity duration-200"
          style={{
            backgroundColor: tooltip.bgColor,
            left: tooltip.x + 10,
            top: tooltip.y - 40,
            opacity: tooltip.show ? 1 : 0,
            transform: 'translateY(-10px)'
          }}
        >
          {tooltip.text}
          <div 
            className="absolute w-2 h-2 rotate-45 -bottom-1 left-4"
            style={{ backgroundColor: tooltip.bgColor }}
          />
        </div>
      )}

      <div className="py-[20px] flex flex-col w-full gap-3 xl:flex-row items-center ">
        {/* Left Panel - Application Tracker */}
        <div className="rounded-md w-full lg:max-w-[50%] bg-[#121315] p-5 ">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-[16px] leading-[20px] text-white">
              Application Tracker
            </p>
          </div>

          {isTrackerLoading ? (
            <div className="pt-[37px] flex items-center justify-center">
              <p className="text-white">Loading application tracker...</p>
            </div>
          ) : trackingData.length > 0 ? (
            <div className="pt-[37px] flex flex-col gap-2">
              {trackingData.map((item) => (
                <div className="flex items-center relative" key={item.id}>
                  <div
                    className="h-[76.25px] pl-2 pb-3 text-[#121315CC] opacity-80 text-[14px] leading-[18px] font-semibold flex flex-col justify-end rounded-xl relative"
                    style={{
                      backgroundColor: item.bg,
                      width: `${item.percentage}%`,
                    }}
                  >
                    {/* ✅ FIXED: Added tooltip functionality */}
                    <span 
                      className="whitespace-nowrap overflow-hidden pr-2 absolute bottom-2 left-2 right-2 cursor-help"
                      onMouseEnter={(e) => handleMouseEnter(e, item.title, item.bg)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      {item.title}
                    </span>
                  </div>
                  <span
                    className="w-10 h-[36px] z-[43] -ml-4 text-center flex items-center justify-center text-white text-[12px] leading-[16px] font-bold rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.minibg }}
                  >
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="pt-[37px] flex items-center justify-center">
              <p className="text-white">No application data available</p>
            </div>
          )}
        </div>

        {/* Right Panel - Certification Table */}
        <div className="flex-1 w-full xl:w-[70%] max-w-none">
          <div className="bg-[#121315] min-w-[50vw] home-table z-[10000000] rounded-lg overflow-hidden">
            <Table
              data={displayData}
              title="Certification"
              control={tableControl}
              showDeleteButton={false}
              showPagination={true}
              clickable={true}
              dropdownItems={dropdownItems}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              showFilter={true}
              onFilterToggle={setIsFilterOpen}
              selectedRows={new Set()}
              setSelectedRows={() => {}}
              onSelectAll={() => {}}
              onSelectRow={() => {}}
              isAllSelected={false}
              isSomeSelected={false}
              rowIds={[]}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={filteredCertificationData.length}
            />
          </div>
        </div>
      </div>

      {/* Filter Drawer - Using the same component as Applications */}
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
        onFilterChange={handleFilterChange}
        dropdownStates={{
          listedProperty: showPropertyDropdown,
          status: showStatusDropdown,
        }}
        onDropdownToggle={handleDropdownToggle}
        fields={[
          {
            label: "Listed property",
            key: "listedProperty",
            type: "dropdown",
            placeholder: "Select property",
            options: uniqueProperties,
          },
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: uniqueStatuses,
          },
          {
            label: "Expiry date",
            key: "expiryDate",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </>
  );
}