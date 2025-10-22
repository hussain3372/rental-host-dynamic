"use client";
import Link from "next/link"; 
import { useEffect, useRef, useState, useMemo } from "react";
// import { useParams } from "next/navigation";
import Image from "next/image";
// import { allProperties } from "@/app/admin/data/Info";
import Dropdown from "@/app/shared/Dropdown";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/admin/tables-essentials/Filter";

interface ApplicationData {
  id: number;
  "Application ID": string;
  "Host Name": string;
  "Reviewed Property": string;
  "Review Date": string;
  "Status": "Approved" | "Rejected" | "Active";
}

export default function Detail() {

  const Credentials = [
    {
      id:1,
      img:"/images/apartment.svg",
      val:"120",
      title:"Listed Properties"
    },
    {
      id:2,
      img:"/images/p-app.svg",
      val:"86",
      title:"Certified Properties"
    },
    {
      id:3,
      img:"/images/reject.svg",
      val:"12",
      title:"Expired Certificates"
    },
    {
      id:4,
      img:"/images/approved.svg",
      val:"05",
      title:"Rejected Properties"
    },
  ]

  
  // const { id } = useParams();
  // const propertyId = Number(id);

  // Get property by ID
  // const property = allProperties.find((p) => p.id === propertyId);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Applications Table States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
// Change from Set<number> to Set<string>
const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [reviewDate, setReviewDate] = useState<Date | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    reviewDate: "",
  });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: number;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

  // Dropdown states for filters
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const itemsPerPage = 6;

  // Sample Data based on the image content
  const [allApplicationsData, setAllApplicationsData] = useState<ApplicationData[]>([
    {
      id: 1,
      "Application ID": "TAO-6789",
      "Host Name": "Emily John",
      "Reviewed Property": "Coastal Hillside Estate",
      "Review Date": "Aug 20, 2025",
      "Status": "Approved"
    },
    {
      id: 2,
      "Application ID": "TAO-6789",
      "Host Name": "Emily John",
      "Reviewed Property": "Coastal Hillside Estate",
      "Review Date": "Aug 20, 2025",
      "Status": "Rejected"
    },
    {
      id: 3,
      "Application ID": "TAO-6789",
      "Host Name": "Emily John",
      "Reviewed Property": "Coastal Hillside Estate",
      "Review Date": "Aug 20, 2025",
      "Status": "Active"
    },
    {
      id: 4,
      "Application ID": "TAO-6789",
      "Host Name": "Emily John",
      "Reviewed Property": "Coastal Hillside Estate",
      "Review Date": "Aug 20, 2025",
      "Status": "Active"
    },
    {
      id: 5,
      "Application ID": "TAO-6789",
      "Host Name": "Emily John",
      "Reviewed Property": "Coastal Hillside Estate",
      "Review Date": "Aug 20, 2025",
      "Status": "Active"
    },
    {
      id: 6,
      "Application ID": "TAO-6789",
      "Host Name": "Emily John",
      "Reviewed Property": "Coastal Hillside Estate",
      "Review Date": "Aug 20, 2025",
      "Status": "Approved"
    },
  ]);

// Close dropdown when clicking outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  // If property not found
  

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setIsDropdownOpen(false);
  };

  const statusOptions = [
    { label: "Active", onClick: () => handleStatusSelect("Active") },
    { label: "Inactive", onClick: () => handleStatusSelect("Inactive") },
    { label: "Expired", onClick: () => handleStatusSelect("Expired") }
  ];

  // Get unique values for filter options
  const uniqueStatuses = [...new Set(allApplicationsData.map((item) => item["Status"]))];

  // Filter Applications Data
  const filteredData = useMemo(() => {
    let filtered = allApplicationsData;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item["Application ID"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Host Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Reviewed Property"].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((item) => item["Status"] === filters.status);
    }

    if (filters.reviewDate) {
      filtered = filtered.filter((item) =>
        item["Review Date"].includes(filters.reviewDate)
      );
    }

    return filtered;
  }, [searchTerm, filters, allApplicationsData]);

  // Table Handlers
 const handleSelectAll = (checked: boolean) => {
  const newSelected = new Set<string>();
  if (checked) {
    filteredData.forEach((item) => newSelected.add(item.id.toString()));
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
 const isAllSelected = useMemo(() => {
  return (
    filteredData.length > 0 &&
    filteredData.every((item) => selectedRows.has(item.id.toString()))
  );
}, [filteredData, selectedRows]);


 const isSomeSelected = useMemo(() => {
  return (
    filteredData.some((item) => selectedRows.has(item.id.toString())) &&
    !isAllSelected
  );
}, [filteredData, selectedRows, isAllSelected]);


  // Delete Handlers
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
  if (modalType === "multiple") {
    if (selectedRows.size > 0) {
      const idsToDelete = Array.from(selectedRows).map(id => parseInt(id));
      const updatedData = allApplicationsData.filter((item) => !idsToDelete.includes(item.id));
      setAllApplicationsData(updatedData);
      setSelectedRows(new Set());
    }
  } else if (modalType === "single" && singleRowToDelete) {
    const updatedData = allApplicationsData.filter((item) => item.id !== singleRowToDelete.id);
    setAllApplicationsData(updatedData);
    const newSelected = new Set(selectedRows);
    newSelected.delete(singleRowToDelete.id.toString()); // Convert to string
    setSelectedRows(newSelected);
  }
  setIsModalOpen(false);
  setSingleRowToDelete(null);
};

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Filter Handlers
  const handleResetFilter = () => {
    setFilters({
      status: "",
      reviewDate: "",
    });
    setSearchTerm("");
    setReviewDate(null);
  };

  const handleApplyFilter = () => {
    if (reviewDate) {
      setFilters((prev) => ({
        ...prev,
        reviewDate: reviewDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }));
    }
    setIsFilterOpen(false);
  };

  const displayData = useMemo(() => {
    return filteredData.map(({ id, ...rest }) => {
      console.log(id);
      return rest;
    });
  }, [filteredData]);

  const dropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        const originalRow = filteredData[globalIndex];
        console.log("View application details:", originalRow);
      },
    },
    {
      label: "Delete Application",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        const originalRow = filteredData[globalIndex];
        openDeleteSingleModal(row, originalRow.id);
      },
    },
  ];

  return (
    <div className="">
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSingleRowToDelete(null);
          }}
          onConfirm={handleModalConfirm}
          title="Confirm Deletion"
          description="Deleting this item means it will no longer appear in your records."
          image="/images/delete-modal.png"
          confirmText="Delete"
        />
      )}

      <nav
        className="flex py-3 mb-5 text-gray-200 rounded-lg bg-transparent"
        aria-label="Breadcrumb"
      >
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <Link
              href="/super-admin/dashboard/user-management"
              className="text-[16px] font-regular leading-5 text-white/60 hover:text-[#EFFC76] md:ms-2"
            >
              Registered Hosts
            </Link>
          </li>

          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="rtl:rotate-180 w-3 h-3 mx-1 text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <p className="text-[16px] leading-5 font-regular text-white">
                Sarah Kim
              </p>
            </div>
          </li>
        </ol>
      </nav>
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-0 justify-between">
        <div className="flex gap-4 items-center">
          <Image src="/images/profile.png" alt="profile" height={72} width={72} />
          <div>
            <h3 className="font-medium text-[24px] leading-7">Sarah Kim</h3>
            <p className="font-regular text-[16px] leading-5 text-[#FFFFFFCC] mt-2">sarah@gmail.com</p>
          </div>
        </div>
        

        {/* Status Dropdown */}
<div className="relative" ref={dropdownRef}> {/* Add ref here */}
  <button
    onClick={(e) => {
      e.stopPropagation(); // Add this to prevent immediate closing
      setIsDropdownOpen(!isDropdownOpen);
    }}
    className="bg-[#2D2D2D] py-3 px-4 w-[121px] rounded-full font-regular text-[18px] cursor-pointer focus:outline-0 flex justify-between items-center"
  >
    {selectedStatus}
    <Image src="/images/dropdown.svg" alt="Dropdown" height={16} width={16}/>
  </button>

  {isDropdownOpen && (
    <div className="absolute top-full mt-2 right-10 sm:-right-21 z-10 w-[121px]">
      <Dropdown items={statusOptions} />
    </div>
  )}
</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-4 gap-3 pt-5  flex-wrap lg:flex-nowrap justify-between">
              { Credentials.map((item)=>(
                <div key={item.id} className="gap-3">
                  <div className="flex items-center bg-[#121315] rounded-xl gap-4 p-5">
                  <Image src={item.img} alt={item.title} width={48} height={48} />
                  <div>
                  <h2 className="font-medium text-[18px] leading-[22px] text-white">{item.val}</h2>
                  <p className="text-white/80 font-regular text-[14px] leading-[18px] pt-2">{item.title}</p>
                  </div>
                  </div>
                </div>
              )) }
            </div>

      {/* Assigned Applications Table */}
      <div className="mt-8">
        <Table
          data={displayData}
          title="Assigned Applications"
          showDeleteButton={true}
          onDeleteSingle={(row, index) => {
            const globalIndex = (currentPage - 1) * itemsPerPage + index;
            const originalRow = filteredData[globalIndex];
            openDeleteSingleModal(row, originalRow.id);
          }}
          showPagination={false}
          clickable={true}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          isAllSelected={isAllSelected}
          isSomeSelected={isSomeSelected}
          rowIds={filteredData.map((item) => item.id.toString())}
          dropdownItems={dropdownItems}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalItems={filteredData.length}
          showFilter={true}
          onFilterToggle={setIsFilterOpen}
          onDeleteAll={handleDeleteSelected}
          isDeleteAllDisabled={selectedRows.size === 0 || selectedRows.size < displayData.length}
        />
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Apply Filter"
        description="Refine applications to find the right records faster."
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={filters}
        onFilterChange={(newFilters) => {
          setFilters(prev => ({
            ...prev,
            ...newFilters
          }));
        }}
        dropdownStates={{
          status: showStatusDropdown,
        }}
        onDropdownToggle={(key, value) => {
          if (key === "status") setShowStatusDropdown(value);
        }}
        fields={[
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: uniqueStatuses,
          },
          {
            label: "Review date",
            key: "reviewDate",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </div>
  );
}