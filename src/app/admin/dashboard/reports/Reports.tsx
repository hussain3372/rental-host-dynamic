"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "../../tables-essentials/Filter";
import { reports } from "@/app/api/Admin/reports";
import Image from "next/image";
import Drawer from "./Drawer";
import { ReportItem } from "@/app/api/Admin/reports/types";
import { toast } from "react-hot-toast";

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

interface ApiParams {
  search?: string;
  reportType?: "WEEKLY" | "MONTHLY" | "CUSTOM" | "ALL";
  certificationStatus?: "ALL" | "ACTIVE" | "EXPIRED" | "REVOKED";
  generatedDateTo?: string;
  page?: number;
  // pageSize?: number;
}

export default function Reports() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportDrawerOpen, setIsExportDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  
  const [stats, setStats] = useState<ReportStats>({
    total: 0,
    active: 0,
    expired: 0,
    revoked: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: string;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

  const [showReportTypeDropdown, setShowReportTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    reportType: "",
    certificationStatus: "",
    generatedDateTo: "",
  });

  const [tempFilters, setTempFilters] = useState({
    reportType: "",
    certificationStatus: "",
    generatedDateTo: "",
  });

  const [generatedDate, setGeneratedDate] = useState<Date | null>(null);

  const [allReportsData, setAllReportsData] = useState<ReportItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const credentials = [
    {
      id: 1,
      img: "/images/manager.svg",
      val: stats.total,
      title: "Total Issued Certificates",
    },
    {
      id: 2,
      img: "/images/pending.svg",
      val: stats.active,
      title: "Active Certificates",
    },
    {
      id: 3,
      img: "/images/certificate.svg",
      val: stats.expired,
      title: "Expired Certificates",
    },
    {
      id: 4,
      img: "/images/revoke.svg",
      val: stats.revoked,
      title: "Revoked Certificates",
    },
  ];

  // Fetch reports from API
  const fetchReports = useCallback(async () => {
    // Don't make API call if search term is less than 3 characters and not empty
    if (debouncedSearchTerm && debouncedSearchTerm.length < 3) {
      return;
    }

    try {
      // setIsLoading(true);
      const params: ApiParams = {
        page: currentPage,
        // pageSize: itemsPerPage,
      };

      // Only include search if it has 3+ characters
      if (debouncedSearchTerm.trim().length >= 3) {
        params.search = debouncedSearchTerm.trim();
      }

      if (appliedFilters.reportType) {
        params.reportType = appliedFilters.reportType as "WEEKLY" | "MONTHLY" | "CUSTOM" | "ALL";
      }

      if (appliedFilters.certificationStatus) {
        params.certificationStatus = appliedFilters.certificationStatus as "ALL" | "ACTIVE" | "EXPIRED" | "REVOKED";
      }

      if (appliedFilters.generatedDateTo) {
        params.generatedDateTo = appliedFilters.generatedDateTo;
      }

      console.log("🚀 Fetching reports with params:", params);

      const response = await reports.getReports(params);

      if (response.success && response.data) {
        setAllReportsData(response.data.reports);
        setTotalItems(response.data.total);
      } else {
        console.log("❌ No reports found or API error");
        setAllReportsData([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("💥 Error fetching reports:", error);
      // toast.error("Failed to fetch reports");
      setAllReportsData([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, appliedFilters, currentPage, itemsPerPage]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await reports.getReportStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch statistics");
    }
  }, []);

  // Fetch reports when filters or page change
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Fetch stats only on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Sync temp filters when filter drawer opens
  useEffect(() => {
    if (isFilterOpen) {
      setTempFilters(appliedFilters);
      if (appliedFilters.generatedDateTo) {
        setGeneratedDate(new Date(appliedFilters.generatedDateTo));
      } else {
        setGeneratedDate(null);
      }
    }
  }, [isFilterOpen, appliedFilters]);

  // Date formatting method
  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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
      const generatedDateFormatted = new Date(report.generatedAt).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );

      const fileExtension =
        report.fileName.split(".").pop()?.toUpperCase() || "PDF";

      return {
        "Report ID": report.id,
        "Report Type": report.reportType,
        "Date Range": `${startDate} - ${endDate}`,
        "Generated Date": generatedDateFormatted,
        Format: fileExtension,
      };
    });
  }, [allReportsData]);

  // Selection handlers
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

  // Delete handlers
  const handleDeleteApplications = async (selectedRowIds: Set<string>) => {
    try {
      setIsLoading(true);
      const deletePromises = Array.from(selectedRowIds).map((id) =>
        reports.deleteReport(id)
      );

      await Promise.all(deletePromises);
      toast.success("Reports deleted successfully");

      setIsModalOpen(false);
      setSelectedRows(new Set());

      await fetchReports();
    } catch (error) {
      console.error("Error deleting reports:", error);
      toast.error("Failed to delete reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSingleApplication = async (
    row: Record<string, string>,
    id: string
  ) => {
    try {
      setIsLoading(true);
      await reports.deleteReport(id);

      toast.success("Report deleted successfully");
      setIsModalOpen(false);
      setSingleRowToDelete(null);

      await fetchReports();

      const remainingDataCount = totalItems - 1;
      const maxPageAfterDeletion = Math.ceil(remainingDataCount / itemsPerPage);

      if (currentPage > maxPageAfterDeletion) {
        setCurrentPage(Math.max(1, maxPageAfterDeletion));
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination and search handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
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

  // Download report
  const handleDownloadReport = async (reportId: string) => {
    try {
      setIsLoading(true);
      const response = await reports.reDownloadReport(reportId);

      if (response.success && response.data) {
        const { filePath, fileName } = response.data;

        if (filePath) {
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
  };

  // Display data without Report ID
  const displayData = useMemo(() => {
    return transformedData.map(({ "Report ID": id, ...rest }) => {
      return {
        ...rest,
        id, // Include id as hidden field for row identification
      };
    });
  }, [transformedData]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [debouncedSearchTerm, appliedFilters]);

  // Filter handlers
  const handleResetFilter = () => {
    const resetFilters = {
      reportType: "",
      certificationStatus: "",
      generatedDateTo: "",
    };

    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setGeneratedDate(null);
    setSearchTerm("");
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleApplyFilter = () => {
    const dateString = formatDateForAPI(generatedDate);

    const filtersToApply = {
      reportType: tempFilters.reportType,
      certificationStatus: tempFilters.certificationStatus,
      generatedDateTo: dateString,
    };

    console.log("🟢 APPLYING FILTERS:", filtersToApply);

    setAppliedFilters(filtersToApply);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleCloseFilter = () => {
    setTempFilters(appliedFilters);
    if (appliedFilters.generatedDateTo) {
      setGeneratedDate(new Date(appliedFilters.generatedDateTo));
    } else {
      setGeneratedDate(null);
    }
    setIsFilterOpen(false);
  };

  // Get unique values for filter options
  const uniqueReportTypes = useMemo(() => 
    [...new Set(allReportsData.map((item) => item.reportType))],
    [allReportsData]
  );

  const uniqueStatuses = useMemo(() => 
    [...new Set(allReportsData.map((item) => item.certificationStatus))],
    [allReportsData]
  );

  const dropdownItems = [
    {
      label: "Download Report",
      onClick: (row: Record<string, string>) => {
        // Find the report by matching display data properties
        const report = allReportsData.find((r) => {
          const startDate = new Date(r.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const endDate = new Date(r.endDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const generatedDateFormatted = new Date(r.generatedAt).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          );
          const fileExtension = r.fileName.split(".").pop()?.toUpperCase() || "PDF";

          return (
            row["Report Type"] === r.reportType &&
            row["Date Range"] === `${startDate} - ${endDate}` &&
            row["Generated Date"] === generatedDateFormatted &&
            row["Format"] === fileExtension
          );
        });

        if (report?.id) {
          handleDownloadReport(report.id);
        }
      },
    },
    {
      label: "Delete Report",
      onClick: (row: Record<string, string>) => {
        // Find the report by matching display data properties
        const report = allReportsData.find((r) => {
          const startDate = new Date(r.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const endDate = new Date(r.endDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const generatedDateFormatted = new Date(r.generatedAt).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          );
          const fileExtension = r.fileName.split(".").pop()?.toUpperCase() || "PDF";

          return (
            row["Report Type"] === r.reportType &&
            row["Date Range"] === `${startDate} - ${endDate}` &&
            row["Generated Date"] === generatedDateFormatted &&
            row["Format"] === fileExtension
          );
        });

        if (report?.id) {
          openDeleteSingleModal(row, report.id);
        }
      },
    },
  ];

  const tableControl = {
    hover: true,
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">Loading reports...</p>
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
          type="button"
        >
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5 flex-wrap lg:flex-nowrap justify-between">
        {credentials.map((item) => (
          <div key={item.id} className="gap-3">
            <div className="flex items-center bg-[#121315] rounded-xl gap-4 p-5">
              <Image src={item.img} alt={item.title} width={48} height={48} />
              <div>
                <h2 className="font-medium text-[18px] leading-[22px] text-white">
                  {item.val}
                </h2>
                <p className="text-white/80 font-normal text-[14px] leading-[18px] pt-2  ">
                  {item.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col justify-between mt-5">
        <Table
          data={displayData}
          title="Reports"
          control={tableControl}
          showDeleteButton={true}
          onDeleteSingle={(row) => {
            // Find the report by matching display data properties
            const report = allReportsData.find((r) => {
              const startDate = new Date(r.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const endDate = new Date(r.endDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const generatedDateFormatted = new Date(r.generatedAt).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              );
              const fileExtension = r.fileName.split(".").pop()?.toUpperCase() || "PDF";

              return (
                row["Report Type"] === r.reportType &&
                row["Date Range"] === `${startDate} - ${endDate}` &&
                row["Generated Date"] === generatedDateFormatted &&
                row["Format"] === fileExtension
              );
            });

            if (report?.id) {
              openDeleteSingleModal(row, report.id);
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
          onSearchChange={handleSearch}
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
          disableClientSidePagination={true}
        />
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={handleCloseFilter}
        title="Filter Reports"
        description="Refine reports to find the specific data you need."
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={{
          reportType: tempFilters.reportType,
          certificationStatus: tempFilters.certificationStatus,
          "Generated on": generatedDate,
        }}
        onFilterChange={(newValues) => {
          if (newValues.reportType !== undefined) {
            setTempFilters((prev) => ({
              ...prev,
              reportType: newValues.reportType as string,
            }));
          }
          if (newValues.certificationStatus !== undefined) {
            setTempFilters((prev) => ({
              ...prev,
              certificationStatus: newValues.certificationStatus as string,
            }));
          }
          if (newValues["Generated on"] !== undefined) {
            setGeneratedDate(newValues["Generated on"] as Date | null);
          }
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
            label: "Generated on",
            key: "Generated on",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </>
  );
}