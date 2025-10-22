"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/admin/tables-essentials/Filter";
import Image from "next/image";
import Drawer from "./Drawer";

interface CertificationData {
  id: number;
  "Report ID": string;
  "Report Type": string;
  "Date Range": string;
  "Generated On": string;
  Format: string;
}

export default function Reports() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportDrawerOpen, setIsExportDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
// Change from Set<number> to Set<string>
const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: number;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

  const [showReportTypeDropdown, setShowReportTypeDropdown] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);

  const [generatedDate, setGeneratedDate] = useState<Date | null>(null);

  const [certificationFilters, setCertificationFilters] = useState({
    reportType: "",
    format: "",
    generatedDate: "",
  });

  const [allCertificationData, setAllCertificationData] = useState<CertificationData[]>([
    {
      id: 1,
      "Report ID": "REP -8765",
      "Report Type": "Weekly",
      "Date Range": "Aug 20, 2025  -  Sep 20, 2025",
      "Generated On": "Aug 12, 2024",
      Format: "PDF",
    },
    {
      id: 2,
      "Report ID": "REP -8766",
      "Report Type": "Monthly",
      "Date Range": "Aug 20, 2025  -  Sep 20, 2025",
      "Generated On": "Jul 15, 2024",
      Format: "CSV",
    },
    {
      id: 3,
      "Report ID": "REP -8767",
      "Report Type": "Yearly",
      "Date Range": "Aug 20, 2025  -  Sep 20, 2025",
      "Generated On": "Jun 20, 2024",
      Format: "PDF",
    },
    {
      id: 4,
      "Report ID": "REP -8768",
      "Report Type": "Weekly",
      "Date Range": "Aug 20, 2025  -  Sep 20, 2025",
      "Generated On": "May 10, 2024",
      Format: "PDF",
    },
    {
      id: 5,
      "Report ID": "REP -8769",
      "Report Type": "Weekly",
      "Date Range": "Aug 20, 2025  -  Sep 20, 2025",
      "Generated On": "Apr 05, 2024",
      Format: "PDF",
    },
    {
      id: 6,
      "Report ID": "REP -8770",
      "Report Type": "Weekly",
      "Date Range": "Aug 20, 2025  -  Sep 20, 2025",
      "Generated On": "Mar 18, 2024",
      Format: "CSV",
    },
  ]);

  const Credentials = [
    {
      id: 1,
      img: "/images/ravanue.svg",
      val: "$125,430",
      title: "Total Revenue",
    },
    {
      id: 2,
      img: "/images/manager.svg",
      val: "3268",
      title: "Total Applications",
    },
    {
      id: 3,
      img: "/images/certificate.svg",
      val: "2870",
      title: "Certificates Issued",
    },
    {
      id: 4,
      img: "/images/p-app.svg",
      val: "420",
      title: "Pending Approvals",
    },
  ];

  // Get unique values for filter options
  const uniqueReportTypes = [...new Set(allCertificationData.map((item) => item["Report Type"]))];
  const uniqueFormats = [...new Set(allCertificationData.map((item) => item["Format"]))];

  const filteredCertificationData = useMemo(() => {
    let filtered = [...allCertificationData];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item["Date Range"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Report ID"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Report Type"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Generated On"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Format"].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (certificationFilters.reportType) {
      filtered = filtered.filter((item) => item["Report Type"] === certificationFilters.reportType);
    }

    if (certificationFilters.format) {
      filtered = filtered.filter((item) => item["Format"] === certificationFilters.format);
    }

    if (certificationFilters.generatedDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item["Generated On"]);
        const filterDate = new Date(certificationFilters.generatedDate);
        return (
          itemDate.getDate() === filterDate.getDate() &&
          itemDate.getMonth() === filterDate.getMonth() &&
          itemDate.getFullYear() === filterDate.getFullYear()
        );
      });
    }

    return filtered;
  }, [searchTerm, certificationFilters, allCertificationData]);

 const handleSelectAll = (checked: boolean) => {
  const newSelected = new Set<string>();
  if (checked) {
    filteredCertificationData.forEach((item) => newSelected.add(item.id.toString()));
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
    filteredCertificationData.length > 0 &&
    filteredCertificationData.every((item) => selectedRows.has(item.id.toString()))
  );
}, [filteredCertificationData, selectedRows]);

 const isSomeDisplayedSelected = useMemo(() => {
  return (
    filteredCertificationData.some((item) => selectedRows.has(item.id.toString())) &&
    !isAllDisplayedSelected
  );
}, [filteredCertificationData, selectedRows, isAllDisplayedSelected]);

  const handleDeleteApplications = (selectedRowIds: Set<string>) => {
  const idsToDelete = Array.from(selectedRowIds).map(id => parseInt(id));
  const updatedData = allCertificationData.filter((item) => !idsToDelete.includes(item.id));
  setAllCertificationData(updatedData);
  setIsModalOpen(false);
  setSelectedRows(new Set());
};
 const handleDeleteSingleApplication = (row: Record<string, string>, id: number) => {
  const updatedData = allCertificationData.filter((item) => item.id !== id);
  setAllCertificationData(updatedData);
  setIsModalOpen(false);
  setSingleRowToDelete(null);

  // Remove these 3 lines:
  // const newSelected = new Set(selectedRows);
  // newSelected.delete(id);
  // setSelectedRows(newSelected);

  const remainingDataCount = updatedData.length;
  const maxPageAfterDeletion = Math.ceil(remainingDataCount / itemsPerPage);

  if (currentPage > maxPageAfterDeletion) {
    setCurrentPage(Math.max(1, maxPageAfterDeletion));
  }
};

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const openDeleteSingleModal = (row: Record<string, string>, id: number) => {
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
      handleDeleteSingleApplication(singleRowToDelete.row, singleRowToDelete.id);
    }
  };

  const displayData = useMemo(() => {
  return filteredCertificationData.map(({ id: _id, ...rest }) => rest);  // eslint-disable-line @typescript-eslint/no-unused-vars
}, [filteredCertificationData]); 

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [searchTerm, certificationFilters]);

  const handleResetFilter = () => {
    setCertificationFilters({
      reportType: "",
      format: "",
      generatedDate: "",
    });
    setSearchTerm("");
    setGeneratedDate(null);
  };

  const handleApplyFilter = () => {
    const newFilters = { ...certificationFilters };
    if (generatedDate) {
      newFilters.generatedDate = generatedDate.toISOString();
    }
    setCertificationFilters(newFilters);
    setIsFilterOpen(false);
  };

  const dropdownItems = [
    {
      label: "Download Report",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        const originalRow = filteredCertificationData[globalIndex];
        console.log("Download report:", originalRow);
      },
    },
    {
      label: "Delete Report",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        const originalRow = filteredCertificationData[globalIndex];
        openDeleteSingleModal(row, originalRow.id);
      },
    },
  ];

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
      <div className={`fixed inset-0 z-[2000] transition-all duration-300 ease-in-out ${
        isExportDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
            isExportDrawerOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsExportDrawerOpen(false)}
        />
        
        {/* Drawer */}
        <div className={`absolute right-0 top-0 h-full transform transition-transform duration-300 ease-in-out ${
          isExportDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <Drawer onClose={() => setIsExportDrawerOpen(false)} />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-0 justify-between items-center">
        <div>
          <h2 className="font-semibold text-[20px] leading-[20px]">Reports & Analytics</h2>
          <p className="font-regular text-[16px] leading-5 mb-[22px] pt-2 text-[#FFFFFF99]">
            Track revenue, certifications, and compliance activity with detailed insights and exportable reports.
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
                <h2 className="font-medium text-[18px] leading-[22px] text-white">{item.val}</h2>
                <p className="text-white/80 font-regular text-[14px] leading-[18px] pt-2">
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
          onDeleteSingle={(row, index) => {
            const globalIndex = (currentPage - 1) * itemsPerPage + index;
            const originalRow = filteredCertificationData[globalIndex];
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
          rowIds={filteredCertificationData.map((item) => item.id.toString())}
          dropdownItems={dropdownItems}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredCertificationData.length}
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
        // dateValue={generatedDate}
        // onDateChange={setGeneratedDate}
        dropdownStates={{
          reportType: showReportTypeDropdown,
          format: showFormatDropdown,
        }}
        onDropdownToggle={(key, value) => {
          if (key === "reportType") setShowReportTypeDropdown(value);
          if (key === "format") setShowFormatDropdown(value);
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
            label: "Report format",
            key: "format",
            type: "dropdown",
            placeholder: "Select format",
            options: uniqueFormats,
          },
          {
            label: "Generated on",
            key: "generatedDate",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </>
  );
}