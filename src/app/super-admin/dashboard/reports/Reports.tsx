"use client";
import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import { reports } from "@/app/api/super-admin/reports";
import Image from "next/image";
import Drawer from "./Drawer";
import { ReportItem } from "@/app/api/super-admin/reports/types";
import { toast } from "react-hot-toast";
import FilterDrawer from "@/app/admin/tables-essentials/Filter";

interface CertificationData {
  "Report ID": string;
  "Report Type": string;
  "Date Range": string;
  "Generated Date": string;
  Format: string;
}

interface ReportStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
}

interface ReportParams {
  search?: string;
  reportType?: "WEEKLY" | "MONTHLY" | "CUSTOM" | "ALL";
  certificationStatus?: "ALL" | "ACTIVE" | "EXPIRED" | "REVOKED";
  generatedDateTo?: string;
}

export default function Reports() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportDrawerOpen, setIsExportDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ReportStats>({
    total: 0,
    active: 0,
    expired: 0,
    revoked: 0,
  });
  const itemsPerPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: string;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

  const [showReportTypeDropdown, setShowReportTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [certificationFilters, setCertificationFilters] = useState({
    reportType: "",
    certificationStatus: "",
    generatedDateTo: "",
  });

  const [allReportsData, setAllReportsData] = useState<ReportItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const Credentials = [
    {
      id: 1,
      img: "/images/manager.svg",
      val: data.total,
      title: "Total Issued Certificates",
    },
    {
      id: 2,
      img: "/images/pending.svg",
      val: data.active,
      title: "Active Certificates",
    },
    {
      id: 3,
      img: "/images/certificate.svg",
      val: data.expired,
      title: "Expired Certificates",
    },
    {
      id: 4,
      img: "/images/revoke.svg",
      val: data.revoked,
      title: "Revoked Certificates",
    },
  ];

  // Fetch reports from API
  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: ReportParams = {};

      // Only add search to params if it has 3 or more characters
      if (searchTerm && searchTerm.length >= 3) {
        params.search = searchTerm;
      }

      if (certificationFilters.reportType) {
        params.reportType =
          certificationFilters.reportType as ReportParams["reportType"];
      }

      if (certificationFilters.certificationStatus) {
        params.certificationStatus =
          certificationFilters.certificationStatus as ReportParams["certificationStatus"];
      }

      if (certificationFilters.generatedDateTo) {
        params.generatedDateTo = certificationFilters.generatedDateTo;
      }

      console.log("API Call with params:", params);

      const response = await reports.getReports(params);

      if (response.success && response.data) {
        setAllReportsData(response.data.reports);
        setTotalItems(response.data.total);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  }, [
    searchTerm,
    certificationFilters.reportType,
    certificationFilters.certificationStatus,
    certificationFilters.generatedDateTo,
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await reports.getReportStats();
      if (response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search term is less than 3 characters and not empty, don't make API call
    if (searchTerm.length > 0 && searchTerm.length < 3) {
      return;
    }

    // Set timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      fetchReports();
    }, 500); // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchReports]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Get unique values for filter options
  const uniqueReportTypes = useMemo(
    () => [...new Set(allReportsData.map((item) => item.reportType))],
    [allReportsData]
  );

  const uniqueStatuses = useMemo(
    () => [...new Set(allReportsData.map((item) => item.certificationStatus))],
    [allReportsData]
  );

  // Transform API data to display format
  const transformedData: CertificationData[] = useMemo(() => {
    return allReportsData.map((report) => {
      const startDate = new Date(report.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const endDate = new Date(report.endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const generatedDate = new Date(report.generatedAt).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );

      // Extract file extension from fileName
      const fileExtension =
        report.fileName.split(".").pop()?.toUpperCase() || "PDF";

      return {
        "Report ID": report.id,
        "Report Type": report.reportType,
        "Date Range": `${startDate} - ${endDate}`,
        "Generated Date": generatedDate,
        "Generated By": report.generatedByUser.name,
        Format: fileExtension,
      };
    });
  }, [allReportsData]);

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set<string>();
    if (checked) {
      transformedData.forEach((item) => newSelected.add(item["Report ID"]));
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
      transformedData.length > 0 &&
      transformedData.every((item) => selectedRows.has(item["Report ID"]))
    );
  }, [transformedData, selectedRows]);

  const isSomeDisplayedSelected = useMemo(() => {
    return (
      transformedData.some((item) => selectedRows.has(item["Report ID"])) &&
      !isAllDisplayedSelected
    );
  }, [transformedData, selectedRows, isAllDisplayedSelected]);

  // Delete multiple reports
  const handleDeleteApplications = useCallback(
    async (selectedRowIds: Set<string>) => {
      try {
        setIsLoading(true);
        const deletePromises = Array.from(selectedRowIds).map((id) =>
          reports.deleteReport(id)
        );

        await Promise.all(deletePromises);
        toast.success("Reports deleted successfully");

        setIsModalOpen(false);
        setSelectedRows(new Set());

        // Refetch data
        await fetchReports();
      } catch (error) {
        console.error("Error deleting reports:", error);
        toast.error("Failed to delete reports");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchReports]
  );

  // Delete single report
  const handleDeleteSingleApplication = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        await reports.deleteReport(id);

        toast.success("Report deleted successfully");
        setIsModalOpen(false);
        setSingleRowToDelete(null);

        // Refetch data
        await fetchReports();

        // Adjust page if needed
        const remainingDataCount = totalItems - 1;
        const maxPageAfterDeletion = Math.ceil(
          remainingDataCount / itemsPerPage
        );

        if (currentPage > maxPageAfterDeletion) {
          setCurrentPage(Math.max(1, maxPageAfterDeletion));
        }
      } catch (error) {
        console.error("Error deleting report:", error);
        toast.error("Failed to delete report");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchReports, totalItems, currentPage, itemsPerPage]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const openDeleteSingleModal = useCallback(
    (row: Record<string, string>, id: string) => {
      setSingleRowToDelete({ row, id });
      setModalType("single");
      setIsModalOpen(true);
    },
    []
  );

  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.size > 0) {
      setModalType("multiple");
      setIsModalOpen(true);
    }
  }, [selectedRows.size]);

  const handleModalConfirm = useCallback(() => {
    if (modalType === "multiple" && selectedRows.size > 0) {
      handleDeleteApplications(selectedRows);
    } else if (modalType === "single" && singleRowToDelete) {
      handleDeleteSingleApplication(singleRowToDelete.id);
    }
  }, [
    modalType,
    selectedRows,
    singleRowToDelete,
    handleDeleteApplications,
    handleDeleteSingleApplication,
  ]);

  // Download report
  const handleDownloadReport = useCallback(async (reportId: string) => {
    try {
      setIsLoading(true);
      const response = await reports.reDownloadReport(reportId);

      if (response.success && response.data) {
        const { filePath, fileName } = response.data;

        if (filePath) {
          // Open report in a new tab
          window.open(filePath, "_blank");
          toast.success(`${fileName || "Report"} downloaded successfully`);
        } else {
          toast.error("File path not found in response");
        }
      } else {
        toast.error("Failed to re-download report");
      }
    } catch (error) {
      console.error("Error re-downloading report:", error);
      toast.error("Failed to re-download report");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const displayData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return transformedData
      .slice(startIndex, endIndex)
      .map(({ "Report ID": reportId, ...rest }) => {
        console.log("Report ID:", reportId);
        return rest;
      });
  }, [transformedData, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [searchTerm, certificationFilters]);

  const handleResetFilter = useCallback(() => {
    setCertificationFilters({
      reportType: "",
      certificationStatus: "",
      generatedDateTo: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  const handleApplyFilter = useCallback(() => {
    setIsFilterOpen(false);
    setCurrentPage(1);
  }, []);

  const dropdownItems = useMemo(
    () => [
      {
        label: "Download Report",
        onClick: (row: Record<string, string>, index: number) => {
          // Use index to find the corresponding item in transformedData
          const startIndex = (currentPage - 1) * itemsPerPage;
          const originalIndex = startIndex + index;
          const originalRow = transformedData[originalIndex];

          if (originalRow) {
            const reportId = originalRow["Report ID"];
            handleDownloadReport(reportId);
          } else {
            console.error("🔴 Could not find original row for index:", index);
          }
        },
      },
      {
        label: "Delete Report",
        onClick: (row: Record<string, string>, index: number) => {
          // Use index to find the corresponding item in transformedData
          const startIndex = (currentPage - 1) * itemsPerPage;
          const originalIndex = startIndex + index;
          const originalRow = transformedData[originalIndex];

          if (originalRow) {
            const reportId = originalRow["Report ID"];
            openDeleteSingleModal(row, reportId);
          } else {
            console.error("🔴 Could not find original row for index:", index);
          }
        },
      },
    ],
    [
      handleDownloadReport,
      openDeleteSingleModal,
      transformedData,
      currentPage,
      itemsPerPage,
    ]
  );

  const tableControl = useMemo(
    () => ({
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
    }),
    []
  );

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
          title="Confirm Report Deletion"
          description="Deleting this report means it will no longer appear in your reports list."
          image="/images/delete-modal.png"
          confirmText="Delete"
        />
      )}

      {/* Enhanced Export Drawer with Smooth Animation */}
      <div
        className={`fixed inset-0 z-[2000] transition-all duration-300 ease-in-out ${
          isExportDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
            isExportDrawerOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setIsExportDrawerOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute right-0 top-0 h-full transform transition-transform duration-300 ease-in-out ${
            isExportDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Drawer
            onClose={() => setIsExportDrawerOpen(false)}
            onReportCreated={fetchReports}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-0 justify-between items-center">
        <div>
          <h2 className="font-semibold text-[20px] leading-[20px]">
            Report & Analytics
          </h2>
          <p className="font-regular text-[16px] leading-5 mb-[22px] pt-2 text-[#FFFFFF99]">
            Generate insights and export certification data for compliance and
            record-keeping.
          </p>
        </div>

        <button
          className="py-3 px-5 yellow-btn text-[#121315] font-semibold text-[16px] leading-5 transition-all duration-200 hover:scale-105"
          onClick={() => setIsExportDrawerOpen(true)}
        >
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5 flex-wrap lg:flex-nowrap justify-between">
        {Credentials.map((item) => (
          <div key={item.id} className="gap-3">
            <div className="flex items-center bg-[#121315] rounded-xl gap-4 p-5">
              <Image src={item.img} alt={item.title} width={48} height={48} />
              <div>
                <h2 className="font-medium text-[18px] leading-[22px] text-white">
                  {item.val}
                </h2>
                <p className="text-white/80 font-normal text-[14px] leading-[18px] pt-2 min-h-[44px]">
                  {item.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col justify-between mt-5">
        {isLoading && (
          <div className="text-center py-4 text-white">Loading...</div>
        )}
        <Table
          data={displayData}
          title="Reports"
          control={tableControl}
          showDeleteButton={true}
          onDeleteSingle={(row, index) => {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const originalIndex = startIndex + index;
            const originalRow = transformedData[originalIndex];

            if (originalRow) {
              const reportId = originalRow["Report ID"];
              openDeleteSingleModal(row, reportId);
            } else {
              console.error("🔴 Could not find original row for index:", index);
            }
          }}
          showPagination={true}
          clickable={true}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          isAllSelected={isAllDisplayedSelected}
          isSomeSelected={isSomeDisplayedSelected}
          rowIds={transformedData.map((item) => item["Report ID"])}
          dropdownItems={dropdownItems}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
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
        title="Filter Reports"
        description="Refine reports to find the specific data you need."
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
          reportType: showReportTypeDropdown,
          certificationStatus: showStatusDropdown,
        }}
        onDropdownToggle={(key, value) => {
          if (key === "reportType") setShowReportTypeDropdown(value);
          if (key === "certificationStatus") setShowStatusDropdown(value);
        }}
        fields={[
          {
            label: "Report Type",
            key: "reportType",
            type: "dropdown",
            placeholder: "Select type",
            options: uniqueReportTypes,
          },
          {
            label: "Certification Status",
            key: "certificationStatus",
            type: "dropdown",
            placeholder: "Select status",
            options: uniqueStatuses,
          },
          {
            label: "Generated on",
            key: "generatedDateTo",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </>
  );
}
