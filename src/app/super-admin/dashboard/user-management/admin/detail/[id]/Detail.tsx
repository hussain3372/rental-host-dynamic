"use client";
import Link from "next/link"; 
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Dropdown from "@/app/shared/Dropdown";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/admin/tables-essentials/Filter";
import { managementApi } from "@/app/api/super-admin/user-management"; 
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

interface ApplicationData {
  id: number;
  "Application ID": string;
  "Host Name": string;
  "Reviewed Property": string;
  "Review Date": string;
  "Status": "Approved" | "Rejected" | "Active" | "Submitted" | "Under Review";
}

interface GetAdminReviewedApplicationsParams {
  search?: string;
  status?: string;
  reviewedFrom?: string;
  reviewedTo?: string;
  page?: number;
  limit?: number;
}

interface AdminData {
  id: number;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  phone: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  isEmail: boolean;
  isNotification: boolean;
  mfaEnabled: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  statistics: {
    verifiedProperties: number;
    pendingApplications: number;
    rejectedApplications: number;
    approvalRate: string;
    totalReviewed: number;
  };
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

// Helper function to validate dates
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Helper function to format date
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Not Reviewed";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Not Reviewed";
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Debounce hook for search
// const useDebounce = (value: string, delay: number) => {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// };

export default function Detail() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Applications Table States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  // Filter states (similar to first example)
  const [appliedFilters, setAppliedFilters] = useState({
    status: "",
    reviewDate: "",
  });

  const [tempFilters, setTempFilters] = useState({
    status: "",
    reviewDate: "",
  });

  const [reviewDate, setReviewDate] = useState<Date | null>(null);

  // API States
  const [allApplicationsData, setAllApplicationsData] = useState<ApplicationData[]>([]);
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

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: number;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");
  const [isDeleting, setIsDeleting] = useState(false);

  // Dropdown states for filters
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const params = useParams();
  const id = parseInt(params.id as string);
  const adminId = id;
  const router = useRouter();

  // Debounced search term
  // const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Check if there are active filters (similar to first example)
  // const hasActiveFilters = useMemo(() => {
  //   return (
  //     searchTerm.trim() !== "" ||
  //     appliedFilters.status.trim() !== "" ||
  //     appliedFilters.reviewDate !== ""
  //   );
  // }, [searchTerm, appliedFilters]);

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

  // Fetch admin details - only once on component mount
  const fetchAdminDetails = useCallback(async () => {
    try {
      setIsAdminLoading(true);
      const response = await managementApi.getAdminDetail(adminId.toString());
      if (response.data) {
        setAdminData(response.data);
        setSelectedStatus(response.data.status);
      }
    } catch (err) {
      console.error("Error fetching admin details:", err);
    } finally {
      setIsAdminLoading(false);
    }
  }, [adminId]);

  // Map API status to display status
  const mapApiStatusToDisplay = (status: string): "Approved" | "Rejected" | "Active" | "Submitted" | "Under Review" => {
    switch (status) {
      case "APPROVED":
        return "Approved";
      case "REJECTED":
        return "Rejected";
      case "SUBMITTED":
        return "Submitted";
      case "UNDER_REVIEW":
        return "Under Review";
      default:
        return "Active";
    }
  };

  // Format date for API
  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Main data fetching function (similar pattern to first example)
  const fetchApplicationsData = useCallback(async () => {
    try {
      setIsLoading(true);

      const queryParams: GetAdminReviewedApplicationsParams = {};

      // Always include pagination parameters
      queryParams.page = currentPage;
      queryParams.limit = itemsPerPage;

      // Add search if applicable
      if (searchTerm.trim() && searchTerm.length >= 3) {
        queryParams.search = searchTerm.trim();
      }

      // Add filters if applicable
      if (appliedFilters.status.trim()) {
        queryParams.status = appliedFilters.status.trim();
      }
      
      if (appliedFilters.reviewDate) {
        const date = new Date(appliedFilters.reviewDate);
        if (isValidDate(appliedFilters.reviewDate)) {
          const fromDate = new Date(date);
          fromDate.setHours(0, 0, 0, 0);
          
          const toDate = new Date(date);
          toDate.setHours(23, 59, 59, 999);
          
          queryParams.reviewedFrom = fromDate.toISOString();
          queryParams.reviewedTo = toDate.toISOString();
        }
      }

      console.log("🚀 Fetching applications with params:", queryParams);

      const response = await managementApi.getAdminReviewedApplications(adminId, queryParams);
      
      if (response.data && Array.isArray(response.data.data)) {
        const transformedData: ApplicationData[] = response.data.data.map((app) => ({
          id: app.id,
          "Application ID": app.applicationId || `APP-${app.id}`,
          "Host Name": app.host?.name || "N/A",
          "Reviewed Property": app.propertyDetails?.propertyName || "N/A",
          "Review Date": formatDate(app.reviewedAt),
          "Status": mapApiStatusToDisplay(app.status),
        }));

        setAllApplicationsData(transformedData);

        // Set pagination data from API response
        if (response.data.pagination) {
          setPaginationData({
            total: response.data.pagination.total || 0,
            pageSize: response.data.pagination.limit || itemsPerPage,
            currentPage: response.data.pagination.page || currentPage,
            totalPages: response.data.pagination.totalPages || 1,
            nextPage: response.data.pagination.nextPage || null,
            prevPage: response.data.pagination.prevPage || null,
            hasNextPage: response.data.pagination.hasNextPage || false,
            hasPrevPage: response.data.pagination.hasPrevPage || false
          });
        }
      } else {
        console.error("❌ Unexpected response:", response);
        setAllApplicationsData([]);
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
    } catch (err) {
      console.error("🚨 Error fetching applications:", err);
      setAllApplicationsData([]);
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
    adminId,
    searchTerm,
    appliedFilters.status,
    appliedFilters.reviewDate,
    currentPage,
    itemsPerPage,
  ]);

  // Single useEffect for data fetching (like first example)
  useEffect(() => {
    fetchApplicationsData();
  }, [fetchApplicationsData]);

  // Reset to page 1 when filters/search change (like first example)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, appliedFilters.status, appliedFilters.reviewDate]);

  // Sync temp filters when filter drawer opens (like first example)
  useEffect(() => {
    if (isFilterOpen) {
      setTempFilters(appliedFilters);
      if (appliedFilters.reviewDate) {
        setReviewDate(new Date(appliedFilters.reviewDate));
      } else {
        setReviewDate(null);
      }
    }
  }, [isFilterOpen, appliedFilters]);

  // Initial admin data fetch
  useEffect(() => {
    fetchAdminDetails();
  }, [fetchAdminDetails]);

  const handleStatusSelect = useCallback((status: string) => {
    setSelectedStatus(status);
    setIsDropdownOpen(false);
  }, []);

  const statusOptions = useMemo(() => [
    { label: "Active", onClick: () => handleStatusSelect("Active") },
    { label: "Inactive", onClick: () => handleStatusSelect("Inactive") },
    { label: "Expired", onClick: () => handleStatusSelect("Expired") }
  ], [handleStatusSelect]);

  // Get credentials from admin statistics
  const credentials = useMemo(() => [
    {
      id: 1,
      img: "/images/apartment.svg",
      val: adminData?.statistics?.verifiedProperties?.toString() || "0",
      title: "Verified Properties"
    },
    {
      id: 2,
      img: "/images/p-app.svg",
      val: adminData?.statistics?.pendingApplications?.toString() || "0",
      title: "Pending Applications"
    },
    {
      id: 3,
      img: "/images/reject.svg",
      val: adminData?.statistics?.rejectedApplications?.toString() || "0",
      title: "Rejected Applications"
    },
    {
      id: 4,
      img: "/images/approved.svg",
      val: adminData?.statistics?.approvalRate || "0%",
      title: "Approval Rate"
    }
  ], [adminData]);

  // Get unique values for filter options from current data
  const uniqueStatuses = useMemo(() => 
    [...new Set(allApplicationsData.map((item) => item["Status"]))],
    [allApplicationsData]
  );

  // Display data without IDs (like first example)
  const displayData = useMemo(() => {
    return allApplicationsData.map(({ id, ...rest }) => rest);
  }, [allApplicationsData]);

  // Table Handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelected = new Set<string>();
    if (checked) {
      allApplicationsData.forEach((item) => newSelected.add(item.id.toString()));
    }
    setSelectedRows(newSelected);
  }, [allApplicationsData]);

  const handleSelectRow = useCallback((id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  }, [selectedRows]);

  const isAllSelected = useMemo(() => {
    return (
      allApplicationsData.length > 0 &&
      allApplicationsData.every((item) => selectedRows.has(item.id.toString()))
    );
  }, [allApplicationsData, selectedRows]);

  const isSomeSelected = useMemo(() => {
    return (
      allApplicationsData.some((item) => selectedRows.has(item.id.toString())) &&
      !isAllSelected
    );
  }, [allApplicationsData, selectedRows, isAllSelected]);

  // Delete Handlers
  const deleteSingleApplication = useCallback(async (id: number) => {
    try {
      setIsDeleting(true);
      await managementApi.deleteApplication(id.toString());
      return true;
    } catch (error) {
      console.error("Error deleting application:", error);
      return false;
    }
  }, []);

  const deleteMultipleApplications = useCallback(async (ids: number[]) => {
    try {
      setIsDeleting(true);
      const deletePromises = ids.map(id => managementApi.deleteApplication(id.toString()));
      const results = await Promise.allSettled(deletePromises);
      
      const successfulDeletes = results.filter(result => result.status === 'fulfilled').length;
      return successfulDeletes > 0;
    } catch (error) {
      console.error("Error deleting applications:", error);
      return false;
    }
  }, []);

  const openDeleteSingleModal = useCallback((row: Record<string, string>, id: number) => {
    setSingleRowToDelete({ row, id });
    setModalType("single");
    setIsModalOpen(true);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.size > 0) {
      setModalType("multiple");
      setIsModalOpen(true);
    }
  }, [selectedRows.size]);

  const handleModalConfirm = useCallback(async () => {
    if (modalType === "multiple" && selectedRows.size > 0) {
      const idsToDelete = Array.from(selectedRows).map(id => parseInt(id));
      const success = await deleteMultipleApplications(idsToDelete);
      
      if (success) {
        await fetchApplicationsData();
        setSelectedRows(new Set());
      }
    } else if (modalType === "single" && singleRowToDelete) {
      const success = await deleteSingleApplication(singleRowToDelete.id);
      
      if (success) {
        await fetchApplicationsData();
        const newSelected = new Set(selectedRows);
        newSelected.delete(singleRowToDelete.id.toString());
        setSelectedRows(newSelected);
      }
    }
    
    setIsDeleting(false);
    setIsModalOpen(false);
    setSingleRowToDelete(null);
  }, [
    modalType, 
    selectedRows, 
    deleteMultipleApplications, 
    deleteSingleApplication, 
    fetchApplicationsData, 
    singleRowToDelete
  ]);

  // Filter Handlers (like first example)
  const handleResetFilter = useCallback(() => {
    const resetFilters = {
      status: "",
      reviewDate: "",
    };

    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setReviewDate(null);
    setSearchTerm("");
    setCurrentPage(1);
    setIsFilterOpen(false);
  }, []);

  const handleApplyFilter = useCallback(() => {
    const dateString = formatDateForAPI(reviewDate);
    
    const filtersToApply = {
      status: tempFilters.status,
      reviewDate: dateString,
    };

    console.log("🟢 APPLYING FILTERS:", filtersToApply);

    setAppliedFilters(filtersToApply);
    setCurrentPage(1);
    setIsFilterOpen(false);
  }, [reviewDate, tempFilters.status]);

  const handleCloseFilter = useCallback(() => {
    setTempFilters(appliedFilters);
    if (appliedFilters.reviewDate) {
      setReviewDate(new Date(appliedFilters.reviewDate));
    } else {
      setReviewDate(null);
    }
    setIsFilterOpen(false);
  }, [appliedFilters]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const dropdownItems = useMemo(() => [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = allApplicationsData[index];
        router.push(`sub-detail/${originalRow.id}`);
      },
    },
    {
      label: "Delete Application",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = allApplicationsData[index];
        openDeleteSingleModal(row, originalRow.id);
      },
    },
  ], [allApplicationsData, openDeleteSingleModal, router]);

  if (isAdminLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading admin details...</div>
      </div>
    );
  }

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
          description={
            modalType === "multiple" 
              ? `Are you sure you want to delete ${selectedRows.size} selected applications? This action cannot be undone.`
              : "Are you sure you want to delete this application? This action cannot be undone."
          }
          image="/images/delete-modal.png"
          confirmText={isDeleting ? "Deleting..." : "Delete"}
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
                {adminData?.name || "Admin Details"}
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
            <h3 className="font-medium text-[24px] leading-7">{adminData?.name || "Loading..."}</h3>
            <p className="font-regular text-[16px] leading-5 text-[#FFFFFFCC] mt-2">
              {adminData?.email || "Loading..."}
            </p>
          </div>
        </div>
        

        {/* Status Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className="bg-[#2D2D2D] py-3 px-4 w-[121px] rounded-full font-regular text-[18px] cursor-pointer focus:outline-0 flex justify-between items-center"
            type="button"
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5 flex-wrap lg:flex-nowrap justify-between">
        {credentials.map((item) => (
          <div key={item.id} className="gap-3">
            <div className="flex items-center bg-[#121315] rounded-xl gap-4 p-5">
              <Image src={item.img} alt={item.title} width={48} height={48} />
              <div>
                <h2 className="font-medium text-[18px] leading-[22px] text-white">{item.val}</h2>
                <p className="text-white/80 font-regular text-[14px] leading-[18px] pt-2">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assigned Applications Table */}
      <div className="mt-8">
        <Table
          data={displayData}
          title="Assigned Applications"
          showDeleteButton={true}
          onDeleteSingle={(row, index) => {
            const originalRow = allApplicationsData[index];
            openDeleteSingleModal(row, originalRow.id);
          }}
          showPagination={true}
          clickable={true}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          isAllSelected={isAllSelected}
          isSomeSelected={isSomeSelected}
          rowIds={allApplicationsData.map((item) => item.id.toString())}
          dropdownItems={dropdownItems}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={paginationData.pageSize}
          totalItems={paginationData.total}
          showFilter={true}
          onFilterToggle={setIsFilterOpen}
          onDeleteAll={handleDeleteSelected}
          isDeleteAllDisabled={selectedRows.size === 0}
          disableClientSidePagination={true}
          isLoading={isLoading}
        />
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={handleCloseFilter}
        title="Apply Filter"
        description="Refine applications to find the right records faster."
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={{
          status: tempFilters.status,
          "Review date": reviewDate,
        }}
        onFilterChange={(newValues) => {
          if (newValues.status !== undefined) {
            setTempFilters(prev => ({ ...prev, status: newValues.status as string }));
          }
          if (newValues["Review date"] !== undefined) {
            setReviewDate(newValues["Review date"] as Date | null);
          }
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
            key: "Review date",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </div>
  );
}