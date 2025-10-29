  "use client";
  import React, { useMemo, useState, useEffect, useCallback } from "react";
  import Image from "next/image";
import { Table } from "@/app/admin/tables-essentials/Tables";
  import FilterDrawer from "../../../shared/tables/Filter";
  import "react-datepicker/dist/react-datepicker.css";
  import AdminDrawer from "./AddAdminDrawer";
  import { Modal } from "@/app/shared/Modal";
  import { application } from "@/app/api/super-admin/application";
  import { Application } from "@/app/api/super-admin/application/types";
import toast from "react-hot-toast";

  interface ApiParams {
    page?: number;
    pageSize?: number;
    search?: string;
    ownership?: string;
    status?: string;
    submittedAt?: string;
  }

  interface CertificationData {
    id: string;
    "Application ID": string;
    "Property Name": string;
    "Host Name": string;
    Address: string;
    Ownership: string;
    Status: string;
    "Submitted Date": string;
  }

  interface PaginationData {
    total: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    nextPage: number | null;
    prevPage: number | null;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }

  interface CustomDateInputProps {
    value?: string;
    onClick?: () => void;
  }

  export default function Applications() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [isLoading, setIsLoading] = useState(true);
    const [, setOpenConfirm] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);


    // Drawer state
    const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);

    // Modal and delete states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [singleRowToDelete, setSingleRowToDelete] = useState<{
      row: Record<string, string>;
      id: string;
    } | null>(null);
    const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

    // Dropdown states for filter drawer
    const [showOwnershipDropdown, setShowOwnershipDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    // Filter states
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
    const [paginationData, setPaginationData] = useState<PaginationData>({
      total: 0,
      pageSize: 6,
      currentPage: 1,
      totalPages: 1,
      nextPage: null,
      prevPage: null,
      hasNextPage: false,
      hasPrevPage: false
    });

    const [allStatuses, setAllStatuses] = useState<string[]>([]);
    const [allOwnerships, setAllOwnerships] = useState<string[]>([]);

    // Stats data
    const [statsData, setStatsData] = useState([
      {
        id: 1,
        title: "Total Applications",
        number: "0",
        status: "+0%",
        color: "#28EB1D",
        braces: "(growth compared to last month)",
        img: "/images/card1.svg",
      },
      {
        id: 2,
        title: "Active Applications",
        number: "0",
        status: "+0%",
        color: "#28EB1D",
        braces: "increase in certifications last month",
        img: "/images/card2.svg",
      },
      {
        id: 3,
        title: "Pending Applications",
        number: "0",
        status: "+0%",
        color: "#FF3F3F",
        braces: "expired certifications last month",
        img: "/images/reject.svg",
      },
    ]);

    const hasActiveFilters = useMemo(() => {
      return (
        searchTerm.trim() !== "" ||
        appliedFilters.ownership.trim() !== "" ||
        appliedFilters.status.trim() !== "" ||
        appliedFilters.submittedDate !== ""
      );
    }, [searchTerm, appliedFilters]);

    const fetchFilterOptions = useCallback(async () => {
      try {
        const response = await application.getAllApplicationsForFilters();

        if (response.success && response.data) {
          const applications = response.data.applications;
          
          const statuses = [...new Set(applications.map((app) => 
            app.status ? app.status.toUpperCase() : ''
          ))].filter(Boolean);
          
          const ownerships = [...new Set(applications.map((app) => 
            app.propertyDetails?.ownership || ''
          ))].filter(Boolean);

          setAllStatuses(statuses);
          setAllOwnerships(ownerships);
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    }, []);

    useEffect(() => {
      fetchFilterOptions();
    }, [fetchFilterOptions]);

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
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const capitalizeStatusForDisplay = (status: string): string => {
      if (!status) return "";
      return status.charAt(0) + status.slice(1).toLowerCase();
    };

    const getStatusForAPI = (status: string): string => {
      if (!status) return "";
      return status.toUpperCase();
    };

const fetchApplications = useCallback(async () => {
  try {
    // Check if search term exists and is less than 3 characters
    if (searchTerm.trim() && searchTerm.trim().length < 3) {
      return; // Don't make API call for short search terms
    }

    // setIsLoading(true);

    const queryParams: ApiParams = {};

    if (!hasActiveFilters) {
      queryParams.page = currentPage;
      queryParams.pageSize = itemsPerPage;
    } else {
      if (currentPage > 1) {
        queryParams.page = currentPage;
      }
      if (itemsPerPage !== 6) {
        queryParams.pageSize = itemsPerPage;
      }
    }

    if (searchTerm.trim() && searchTerm.trim().length >= 3) {
      queryParams.search = searchTerm.trim();
    }

    if (appliedFilters.ownership.trim()) {
      queryParams.ownership = appliedFilters.ownership.trim();
    }
    
    if (appliedFilters.status.trim()) {
      queryParams.status = getStatusForAPI(appliedFilters.status.trim());
    }
    
    if (appliedFilters.submittedDate) {
      queryParams.submittedAt = appliedFilters.submittedDate;
    }

    console.log("🚀 HITTING API WITH PARAMS:", queryParams);

    const response = await application.getApplication(queryParams);

    if (response.success && response.data) {
      const transformedData: CertificationData[] = response.data.applications.map((app) => ({
        id: app.id,
        "Application ID": app.id.substring(0, 8) + "...",
        "Property Name": app.propertyDetails?.propertyName || "N/A",
        "Host Name": app.propertyDetails?.ownership || "N/A",
        Address: app.propertyDetails?.address || "N/A", 
        Ownership: app.propertyDetails?.ownership || "N/A",
        Status: capitalizeStatusForDisplay(app.status),
        "Submitted Date": app.submittedAt ? formatDate(app.submittedAt) : "—",
      }));

      setAllCertificationData(transformedData);

      if (response.data.pagination) {
        setPaginationData(response.data.pagination);
      }

      // Update stats based on the response
      updateStatsData(response.data.applications);
    } else {
      console.error("❌ Unexpected response:", response);
      setAllCertificationData([]);
      setPaginationData({
        total: 0,
        pageSize: itemsPerPage,
        currentPage: 1,
        totalPages: 1,
        nextPage: null,
        prevPage: null,
        hasNextPage: false,
        hasPrevPage: false
      });
    }
  } catch (error) {
    console.error("🚨 Error fetching applications:", error);
    setAllCertificationData([]);
    setPaginationData({
      total: 0,
      pageSize: itemsPerPage,
      currentPage: 1,
      totalPages: 1,
      nextPage: null,
      prevPage: null,
      hasNextPage: false,
      hasPrevPage: false
    });
  } finally {
    setIsLoading(false);
  }
}, [
  searchTerm,
  appliedFilters.ownership,
  appliedFilters.status,
  appliedFilters.submittedDate,
  currentPage,
  itemsPerPage,
  hasActiveFilters,
]);

    // Add this function to fetch stats
const fetchStats = useCallback(async () => {
  try {
    const response = await application.getApplicationStats();
    if (response.success && response.data) {
      setStatsData([
        {
          id: 1,
          title: "Total Applications",
          number: response.data.dashboard.applications.total?.toString() || "0",
          status: "+8%",
          color: "#28EB1D",
          braces: "(growth compared to last month)",
          img: "/images/card1.svg",
        },
        {
          id: 2,
          title: "Active Applications",
          number:response.data.dashboard.applications.approved?.toString() || "0",
          status: "+4%",
          color: "#28EB1D",
          braces: "increase in certifications last month",
          img: "/images/card2.svg",
        },
        {
          id: 3,
          title: "Pending Applications",
          number: response.data.dashboard.applications.pending?.toString() || "0",
          status: "+4%",
          color: "#FF3F3F",
          braces: "expired certifications last month",
          img: "/images/reject.svg",
        },
      ]);
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
}, []);


useEffect(() => {
  fetchStats();
}, [fetchStats]);

    

    const updateStatsData = (applications: Application[]) => {
      const totalApplications = applications.length;
      const activeApplications = applications.filter(app => 
        app.status === 'APPROVED' || app.status === 'PENDING'
      ).length;
      const pendingApplications = applications.filter(app => 
        app.status === 'PENDING'
      ).length;

      setStatsData([
        {
          id: 1,
          title: "Total Applications",
          number: totalApplications.toString(),
          status: "+8%",
          color: "#28EB1D",
          braces: "(growth compared to last month)",
          img: "/images/card1.svg",
        },
        {
          id: 2,
          title: "Active Applications",
          number: activeApplications.toString(),
          status: "+4%",
          color: "#28EB1D",
          braces: "increase in certifications last month",
          img: "/images/card2.svg",
        },
        {
          id: 3,
          title: "Pending Applications",
          number: pendingApplications.toString(),
          status: "+4%",
          color: "#FF3F3F",
          braces: "expired certifications last month",
          img: "/images/reject.svg",
        },
      ]);
    };

    useEffect(() => {
      fetchApplications();
    }, [fetchApplications]);

    const displayData = useMemo(() => {
      return allCertificationData.map(({ id, ...rest }) => {
        return rest;
      });
    }, [allCertificationData]);

    const handleSelectAll = (checked: boolean) => {
      const newSelected = new Set(selectedRows);
      if (checked) {
        allCertificationData.forEach((item) => newSelected.add(item.id));
      } else {
        allCertificationData.forEach((item) => newSelected.delete(item.id));
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
        allCertificationData.length > 0 &&
        allCertificationData.every((item) => selectedRows.has(item.id))
      );
    }, [allCertificationData, selectedRows]);

    const isSomeDisplayedSelected = useMemo(() => {
      return (
        allCertificationData.some((item) => selectedRows.has(item.id)) &&
        !isAllDisplayedSelected
      );
    }, [allCertificationData, selectedRows, isAllDisplayedSelected]);

   const handleDeleteApplications = async (selectedRowIds: Set<string>) => {
  try {
    const deletePromises = Array.from(selectedRowIds).map((id) =>
      application.deleteApplication(id)
    );

    const results = await Promise.all(deletePromises);
    
    // Check if all deletions were successful
    const allSuccessful = results.every(result => result.success);
    
    if (allSuccessful) {
      await fetchApplications();
      setIsModalOpen(false);
      setSelectedRows(new Set());
      toast.success("Applications deleted successfully");
    } else {
      // Find the first error message
      const errorResult = results.find(result => !result.success);
      if (errorResult?.message) {
        toast.error(errorResult.message);
      } else {
        toast.error("Failed to delete some applications");
      }
    }
  } catch (error) {
    console.error("Error deleting applications:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete applications";
    toast.error(errorMessage);
  }
};

    const handleDeleteSingleApplication = async (
  row: Record<string, string>,
  id: string
) => {
  try {
    const response = await application.deleteApplication(id);
    console.log(response)
    // Check if the response indicates success
    if (response.success) {
      await fetchApplications();
      setIsModalOpen(false);
      setSingleRowToDelete(null);
      const newSelected = new Set(selectedRows);
      newSelected.delete(id);
      setSelectedRows(newSelected);
      toast.success("Application deleted successfully");
    } else {
      // Handle API error with proper message
      if (response.message) {
        toast.error(response.message);
      } else {
        toast.error("Failed to delete application");
      }
    }
  } catch (error) {
    console.error("Error deleting application:", error);
    // This will catch network errors or other exceptions
    const errorMessage = error instanceof Error ? error.message : "Failed to delete application";
    toast.error(errorMessage);
  }
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
      setSearchTerm("");
      setCurrentPage(1);
      setIsFilterOpen(false);
    };

    const handleApplyFilter = () => {
      const dateString = formatDateForAPI(submittedDate);
      
      const filtersToApply = {
        ownership: tempFilters.ownership,
        status: tempFilters.status,
        submittedDate: dateString,
      };

      console.log("🟢 APPLYING FILTERS:", filtersToApply);

      setAppliedFilters(filtersToApply);
      setCurrentPage(1);
      setIsFilterOpen(false);
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

    // const confirm = () => {
    //   setOpenConfirm(false)
    // }

    // const openDrawer = () => {
    //   setIsAdminDrawerOpen(true)
    // }

    const dropdownItems = [
  {
    label: "Assign Admin",
    onClick: (row: Record<string, string>, index: number) => {
      const originalRow = allCertificationData[index];
      setSelectedApplicationId(originalRow.id); // ✅ store the ID
      setIsAdminDrawerOpen(true);
    },
  },
  {
    label: "View Details",
    onClick: (row: Record<string, string>, index: number) => {
      const originalRow = allCertificationData[index];
      window.location.href = `/super-admin/dashboard/applications/detail/${originalRow.id}`;
    },
  },
  {
    label: "Delete Application",
    onClick: (row: Record<string, string>, index: number) => {
      const originalRow = allCertificationData[index];
      openDeleteSingleModal(row, originalRow.id);
    },
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

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-white">Loading applications...</p>
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
            title="Confirm Application Deletion"
            description="Deleting this application means it will no longer appear in your requests."
            image="/images/delete-modal.png"
            confirmText="Delete"
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 mb-5 gap-[12px] flex-1">
          {statsData.map((item) => (
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
              const originalRow = allCertificationData[index];
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
            rowIds={allCertificationData.map((item) => item.id)}
            dropdownItems={dropdownItems}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            itemsPerPage={paginationData.pageSize}
            totalItems={paginationData.total || 0}
            showFilter={true}
            onFilterToggle={setIsFilterOpen}
            onDeleteAll={handleDeleteSelected}
            isDeleteAllDisabled={
              selectedRows.size < 2
            }
            disableClientSidePagination={true}
          />
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
          filterValues={{
            ownership: tempFilters.ownership,
            status: tempFilters.status,
            "Submitted On": submittedDate,
          }}
          onFilterChange={(newValues) => {
            if (newValues.ownership !== undefined) {
              setTempFilters(prev => ({ ...prev, ownership: newValues.ownership as string }));
            }
            if (newValues.status !== undefined) {
              setTempFilters(prev => ({ ...prev, status: newValues.status as string }));
            }
            if (newValues["Submitted On"] !== undefined) {
              setSubmittedDate(newValues["Submitted On"] as Date | null);
            }
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
              options: allOwnerships,
            },
            {
              label: "Status",
              key: "status",
              type: "dropdown",
              placeholder: "Select status",
              options: allStatuses.map(status => capitalizeStatusForDisplay(status)),
            },
            {
              label: "Submitted On",
              key: "Submitted On",
              type: "date",
              placeholder: "Select date",
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
          <AdminDrawer applicationId={selectedApplicationId||""} onClose={() => { setIsAdminDrawerOpen(false); setOpenConfirm(true) }} />
        </div>
        
      </>
    );
  }