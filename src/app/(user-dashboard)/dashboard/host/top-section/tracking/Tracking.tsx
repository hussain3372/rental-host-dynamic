"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Table } from "@/app/shared/tables/Tables";
import FilterDrawer from "@/app/shared/tables/Filter";
import { certifications } from "@/app/api/Host/certification/index";
import { dashboard } from "@/app/api/Host/dashboard";
import { useRouter } from "next/navigation";

interface ApiParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  propertyName?: string;
  issuedAt?: string;
  expiresAt?: string;
}

interface CertificationData {
  id: string;
  "Property Name": string;
  Address: string;
  "Certificate Expiry Date": string;
  Status: string;
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
  const [isLoading, setIsLoading] = useState(false);
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
  const [allCertificationData, setAllCertificationData] = useState<CertificationData[]>([]);
  const [trackingData, setTrackingData] = useState<ApplicationTrackerData[]>([]);
  const [isTrackerLoading, setIsTrackerLoading] = useState(false);
  const [tooltip, setTooltip] = useState({
    show: false,
    text: "",
    bgColor: "",
    x: 0,
    y: 0
  });
  const [allProperties, setAllProperties] = useState<string[]>([]);
  const [allStatuses, setAllStatuses] = useState<string[]>([]);

  // Remove search-related state and effects

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await certifications.getCertifications();
     
      if (response?.data?.certifications && Array.isArray(response.data.certifications)) {
        const properties = [...new Set(response.data.certifications.map((item) =>
          item.application?.propertyDetails?.propertyName || ""
        ))].filter(Boolean);
       
        const statuses = [...new Set(response.data.certifications.map((item) =>
          item.status ? capitalizeStatus(item.status) : ""
        ))].filter(Boolean);
        setAllProperties(properties as string[]);
        setAllStatuses(statuses as string[]);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Sync temp filters with applied filters when drawer opens
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

  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const capitalizeStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace("_", " ");
  };

  const getStatusForAPI = (status: string): string => {
    if (!status) return "";
    return status.toUpperCase().replace(" ", "_");
  };

  const buildApiParams = useCallback((): ApiParams => {
    const params: ApiParams = {
      page: 1, 
      pageSize: 5, 
    };
    
    // Remove search from API params
    if (appliedFilters.listedProperty.trim()) {
      params.propertyName = appliedFilters.listedProperty.trim();
    }
    if (appliedFilters.status.trim()) {
      params.status = getStatusForAPI(appliedFilters.status.trim());
    }
    if (appliedFilters.expiryDate) {
      params.expiresAt = appliedFilters.expiryDate; 
    }
    return params;
  }, [appliedFilters]); // Remove search term dependency

  const fetchCertifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = buildApiParams();
      console.log("🚀 HITTING CERTIFICATIONS API WITH PARAMS:", params);
      const response = await certifications.getCertifications(params);
      if (response?.data?.certifications && Array.isArray(response.data.certifications)) {
        const firstFiveRecords = response.data.certifications.slice(0, 5);
       
        const mappedData: CertificationData[] = firstFiveRecords.map(
          (item, index: number) => ({
            id: item.id || `cert-${index}`,
            "Property Name": item.application?.propertyDetails?.propertyName || "Coastal Hillside Estate",
            Address: item.application?.propertyDetails?.address || "762 Evergreen Terrace",
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
        setAllCertificationData(mappedData);
      } else {
        console.error("❌ Unexpected certifications response:", response);
        setAllCertificationData([]);
      }
    } catch (error) {
      console.error("🚨 Error fetching certifications:", error);
      setAllCertificationData([]);
    } finally {
      setIsLoading(false);
    }
  }, [buildApiParams]);

  useEffect(() => {
    fetchCertifications();
  }, [fetchCertifications]);

  const fetchApplicationTracker = useCallback(async () => {
    try {
      setIsTrackerLoading(true);
      const response = await dashboard.fetchApplicationTracker();
      if (response?.data?.data && Array.isArray(response.data.data)) {
        const firstFourProperties = response.data.data.slice(0, 4);
       
        const mappedTrackerData: ApplicationTrackerData[] = firstFourProperties.map((item, index: number) => {
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

  // Tooltip handlers (unchanged)
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

  const handleFilterChange = (filters: Record<string, string | Date | null>) => {
    const updatedFilters = { ...tempFilters };
    if (filters.listedProperty !== undefined) {
      updatedFilters.listedProperty = filters.listedProperty as string;
    }
    if (filters.status !== undefined) {
      updatedFilters.status = filters.status as string;
    }
    if (filters.expiryDate !== undefined) {
      setExpiryDate(filters.expiryDate as Date | null);
    }
    setTempFilters(updatedFilters);
  };

  const handleResetFilter = () => {
    const resetFilters = {
      listedProperty: "",
      status: "",
      expiryDate: "",
    };
    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setExpiryDate(null);
    // Remove search reset
    setIsFilterOpen(false);
  };

  const handleApplyFilter = () => {
    const dateString = formatDateForAPI(expiryDate);
   
    const filtersToApply = {
      listedProperty: tempFilters.listedProperty,
      status: tempFilters.status,
      expiryDate: dateString,
    };
    console.log("🟢 APPLYING CERTIFICATION FILTERS:", filtersToApply);
    setAppliedFilters(filtersToApply);
    setIsFilterOpen(false);
  };

  const handleCloseFilter = () => {
    setTempFilters(appliedFilters);
    if (appliedFilters.expiryDate) {
      setExpiryDate(new Date(appliedFilters.expiryDate));
    } else {
      setExpiryDate(null);
    }
    setIsFilterOpen(false);
  };

  const handleDropdownToggle = (key: string, value: boolean) => {
    if (key === "listedProperty") {
      setShowPropertyDropdown(value);
    } else if (key === "status") {
      setShowStatusDropdown(value);
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

  const displayData = useMemo(() => {
    return allCertificationData.map(({ id, ...rest }) => {
      console.log(id)
      return rest;
    });
  }, [allCertificationData]);

  const dropdownItems = [
    {
      label: "View Detail",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = allCertificationData[index];
        if (originalRow && originalRow.id) {
          router.push(`/dashboard/certificates/detail/${originalRow.id}`);
        }
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">Loading certifications...</p>
      </div>
    );
  }

  return (
    <>
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
      <div className="py-[20px] flex flex-col w-full gap-3 xl:flex-row">
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
              showPagination={false}
              clickable={true}
              dropdownItems={dropdownItems}
              showFilter={true}
              onFilterToggle={setIsFilterOpen}
              selectedRows={new Set()}
              setSelectedRows={() => {}}
              onSelectAll={() => {}}
              onSelectRow={() => {}}
              isAllSelected={false}
              isSomeSelected={false}
              rowIds={[]}
            />
          </div>
        </div>
      </div>
      {/* Filter Drawer */}
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
          listedProperty: tempFilters.listedProperty,
          status: tempFilters.status,
          expiryDate: expiryDate,
        }}
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
            options: allProperties,
          },
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: allStatuses,
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