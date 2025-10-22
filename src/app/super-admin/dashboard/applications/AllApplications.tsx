"use client";
import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Table } from "@/app/shared/tables/Tables";
import FilterDrawer from "../../../shared/tables/Filter";
import "react-datepicker/dist/react-datepicker.css";
import AdminDrawer from "./AddAdminDrawer";
import { Modal } from "@/app/shared/Modal";

interface CustomDateInputProps {
  value?: string;
  onClick?: () => void;
}

interface CertificationData {
  id: number;
  "Property Name": string;
  "Host Name": string;
  Ownership: string;
  "Submitted Date": string;
  Status: string;
}

export default function Applications() {
  const application = [
    {
      id: 1,
      title: "Total Applications",
      number: "2300",
      status: "+8%",
      color: "#28EB1D",
      braces: "(growth compared to last month)",
      img: "/images/card1.svg",
    },
    {
      id: 2,
      title: "Active Applications",
      number: "1870",
      status: "+4%",
      color: "#28EB1D",
      braces: "increase in certifications last month",
      img: "/images/card2.svg",
    },
    {
      id: 3,
      title: "Pending Applications",
      number: "670",
      status: "+4%",
      color: "#FF3F3F",
      braces: "expired certifications last month",
      img: "/images/reject.svg",
    },
  ];

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openConfirm, setOpenConfirm] = useState(false);

  const itemsPerPage = 6;

  // Drawer state
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);

  // Modal and delete states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: number;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

  // Dropdown states for filter drawer
  const [showOwnershipDropdown, setShowOwnershipDropdown] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showRejectionDropdown, setShowRejectionDropdown] = useState(false);

  // Filter states
  const [certificationFilters, setCertificationFilters] = useState({
    ownership: "",
    property: "",
    status: "",
    submittedDate: "",
  });

  const confirm = () => {
    setOpenConfirm(false)
  }


  const [allCertificationData, setAllCertificationData] = useState<CertificationData[]>([
    {
      id: 1,
      "Property Name": "Coastal Hillside Estate",
      "Host Name": "Dianne Russell",
      Ownership: "Owner",
      "Submitted Date": "Aug 12, 2025",
      Status: "Approved",
    },
    {
      id: 2,
      "Property Name": "Coastal Hillside Estate",
      "Host Name": "Dianne Russell",
      Ownership: "Manager",
      "Submitted Date": "Aug 12, 2025",
      Status: "Pending",
    },
    {
      id: 3,
      "Property Name": "Coastal Hillside Estate",
      "Host Name": "Dianne Russell",
      Ownership: "Owner",
      "Submitted Date": "Aug 12, 2025",
      Status: "Approved",
    },
    {
      id: 4,
      "Property Name": "Coastal Hillside Estate",
      "Host Name": "Dianne Russell",
      Ownership: "Manager",
      "Submitted Date": "Aug 12, 2025",
      Status: "Pending",
    },
    {
      id: 5,
      "Property Name": "Coastal Hillside Estate",
      "Host Name": "Dianne Russell",
      Ownership: "Agent",
      "Submitted Date": "Aug 12, 2025",
      Status: "Rejected",
    },
    {
      id: 6,
      "Property Name": "Coastal Hillside Estate",
      "Host Name": "Dianne Russell",
      Ownership: "Agent",
      "Submitted Date": "Aug 12, 2025",
      Status: "Approved",
    },
    {
      id: 7,
      "Property Name": "Coastal Hillside Estate",
      "Host Name": "Dianne Russell",
      Ownership: "Owner",
      "Submitted Date": "Aug 12, 2025",
      Status: "Approved",
    },
    {
      id: 8,
      "Property Name": "Coastal Hillside Estate",
      "Host Name": "Dianne Russell",
      Ownership: "Manager",
      "Submitted Date": "Aug 12, 2025",
      Status: "Pending",
    },
    {
      id: 9,
      "Property Name": "Coastal Hillside Estate",
      "Host Name": "Dianne Russell",
      Ownership: "Owner",
      "Submitted Date": "Aug 12, 2025",
      Status: "Approved",
    },
    {
      id: 10,
      "Property Name": "Coastal Hillside Estate",
      "Host Name": "Dianne Russell",
      Ownership: "Manager",
      "Submitted Date": "Aug 12, 2025",
      Status: "Pending",
    },
    {
      id: 11,
      "Property Name": "Coastal Hillside Estate",
      "Host Name": "Dianne Russell",
      Ownership: "Agent",
      "Submitted Date": "Aug 12, 2025",
      Status: "Rejected",
    },
    {
      id: 12,
      "Property Name": "Coastal Hillside Estate",
      "Host Name": "Dianne Russell",
      Ownership: "Agent",
      "Submitted Date": "Aug 12, 2025",
      Status: "Approved",
    },
  ]);

  const filterOptions = {
    properties: ["0-50", "50-100", "100-200"],
    applications: ["0-50", "50-100", "100-200"],
    Rejections: ["0-50", "50-100", "100-200"],
    status: ["Approved", "Rejected", "Pending"],
  };

  const filteredCertificationData = useMemo(() => {
    let filtered = allCertificationData;
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item["Property Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Host Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Ownership"].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (certificationFilters.property) {
      filtered = filtered.filter(
        (item) => item["Property Name"] === certificationFilters.property
      );
    }
    if (certificationFilters.status) {
      filtered = filtered.filter((item) => item["Status"] === certificationFilters.status);
    }
    if (certificationFilters.ownership) {
      filtered = filtered.filter(
        (item) => item["Ownership"] === certificationFilters.ownership
      );
    }
    return filtered;
  }, [searchTerm, certificationFilters, allCertificationData]);

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      filteredCertificationData.forEach((item) => newSelected.add(item.id));
    } else {
      filteredCertificationData.forEach((item) => newSelected.delete(item.id));
    }
    setSelectedRows(newSelected);
  };

  // const handleSelectRow = (id: string, checked: boolean) => {
  //   const newSelected = new Set(selectedRows);
  //   const numericId = parseInt(id);
  //   checked ? newSelected.add(numericId) : newSelected.delete(numericId);
  //   setSelectedRows(newSelected);
  // };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    const numericId = parseInt(id);

    if (checked) {
      newSelected.add(numericId);
    } else {
      newSelected.delete(numericId);
    }

    setSelectedRows(newSelected);
  };

  const isAllDisplayedSelected = useMemo(() => {
    return (
      filteredCertificationData.length > 0 &&
      filteredCertificationData.every((item) => selectedRows.has(item.id))
    );
  }, [filteredCertificationData, selectedRows]);

  const isSomeDisplayedSelected = useMemo(() => {
    return (
      filteredCertificationData.some((item) => selectedRows.has(item.id)) &&
      !isAllDisplayedSelected
    );
  }, [filteredCertificationData, selectedRows, isAllDisplayedSelected]);

  const handleDeleteApplications = (selectedRowIds: Set<number>) => {
    const idsToDelete = Array.from(selectedRowIds);
    const updatedData = allCertificationData.filter(
      (item) => !idsToDelete.includes(item.id)
    );
    setAllCertificationData(updatedData);
    setIsModalOpen(false);
    setSelectedRows(new Set());
  };

  const handleDeleteSingleApplication = (row: Record<string, string>, id: number) => {
    const updatedData = allCertificationData.filter((item) => item.id !== id);
    setAllCertificationData(updatedData);
    setIsModalOpen(false);
    setSingleRowToDelete(null);
    const newSelected = new Set(selectedRows);
    newSelected.delete(id);
    setSelectedRows(newSelected);
    const remainingDataCount = updatedData.length;
    const maxPageAfterDeletion = Math.ceil(remainingDataCount / itemsPerPage);
    if (currentPage > maxPageAfterDeletion) {
      setCurrentPage(Math.max(1, maxPageAfterDeletion));
    }
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
  return filteredCertificationData.map((item) => {
    const { id, ...rest } = item;
    const displayRow: Record<string, string> = {};
    
    Object.keys(rest).forEach((key) => {
      displayRow[key] = String(rest[key as keyof typeof rest]);
    });
    console.log(id);
    
    return displayRow;
  });
}, [filteredCertificationData]);

  const openDrawer = () => {
    setIsAdminDrawerOpen(true)
  }


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, certificationFilters]);

  const handleResetFilter = () => {
    setCertificationFilters({
      ownership: "",
      property: "",
      status: "",
      submittedDate: "",
    });
    setSearchTerm("");
  };

  const handleApplyFilter = () => {
    setIsFilterOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  const dropdownItems = [
    {
      label: "Assign Admin",
      onClick: () => openDrawer(), // Fixed: pass as function
    },
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        const originalRow = filteredCertificationData[globalIndex];
        window.location.href = `/super-admin/dashboard/applications/detail/${originalRow.id}`;
      },
    },
    {
      label: "Delete",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        const originalRow = filteredCertificationData[globalIndex];
        openDeleteSingleModal(row, originalRow.id);
      }
    },
  ];

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
          <Image src="/images/calender.svg" alt="Pick date" width={20} height={20} />
        </div>
      </div>
    )
  );

  CustomDateInput.displayName = "CustomDateInput";

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

      <div className="grid grid-cols-1 sm:grid-cols-3 mb-5 gap-[12px] flex-1">
        {application.map((item) => (
          <div
            key={item.id}
            className="bg-[#121315] rounded-[12px] py-[20px] pr-[20px] pl-[20px] flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-regular text-[14px] leading-[18px] text-[#FFFFFFCC]">
                  {item.title}
                </p>
                <p className="font-semibold text-[24px] leading-[28px] pt-3 text-[white]">
                  {item.number}
                </p>
              </div>
              <Image
                src={item.img}
                alt={item.title}
                height={44}
                width={44}
                className="object-contain"
              />
            </div>
            <div className="pt-[16px] flex gap-1 items-center">
              <span
                className="bg-[#252628] py-1 px-2 rounded-[4px] text-[14px] leading-[18px] font-medium"
                style={{ color: item.color }}
              >
                {item.status}
              </span>
              <p className="text-[14px] font-regular leading-[18px] overflow-hidden text-white opacity-80 ">
                {item.braces}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col justify-between">
        <Table
          data={displayData}
          title="Applications"
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
          isDeleteAllDisabled={selectedRows.size === 0 || selectedRows.size < displayData.length}
        />
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Apply Filter"
        description="Refine listings to find the right property faster."
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={certificationFilters}
        onFilterChange={(filters) => {
          setCertificationFilters((prev) => ({ ...prev, ...filters }));
        }}
        dropdownStates={{
          ownership: showOwnershipDropdown,
          property: showPropertyDropdown,
          status: showStatusDropdown,
          rejections: showRejectionDropdown,
        }}
        onDropdownToggle={(key: string, value: boolean) => {
          if (key === "ownership") setShowOwnershipDropdown(value);
          if (key === "property") setShowPropertyDropdown(value);
          if (key === "status") setShowStatusDropdown(value);
          if (key === "rejections") setShowRejectionDropdown(value);
        }}
        fields={[
          {
            label: "Properties verified",
            key: "ownership",
            type: "dropdown",
            placeholder: "Select Properties",
            options: filterOptions.properties,
          },
          {
            label: "Pending applications",
            key: "property",
            type: "dropdown",
            placeholder: "Select applications",
            options: filterOptions.applications,
          },
          {
            label: "Rejected applications",
            key: "rejections",
            type: "dropdown",
            placeholder: "Select applications",
            options: filterOptions.Rejections,
          },
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: filterOptions.status,
          },
        ]}
      />

      {/* ✅ Admin Drawer Overlay with Smooth Slide Animation */}
      <div
        className={`fixed inset-0 z-[2000] bg-black/40 transition-opacity duration-300 ${isAdminDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={() => setIsAdminDrawerOpen(false)}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full z-[2000] max-w-[70vw] md:max-w-[608px] bg-[#101010]  transform transition-transform duration-300 ease-in-out ${isAdminDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <AdminDrawer onClose={() => { setIsAdminDrawerOpen(false); setOpenConfirm(true) }} />
      </div>
      {
        openConfirm &&
        <Modal
          isOpen={openConfirm}
          onClose={confirm}
          onConfirm={confirm}
          image="/images/assignment.png"
          title="Application Assigned Successfully!"
          description="You have successfully assigned an application to the admin “Sarah Kim”."
          confirmText="Back To Applications"
        />
      }
    </>
  );
}
