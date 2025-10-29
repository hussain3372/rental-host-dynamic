"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Dropdown from "@/app/shared/Dropdown";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/admin/tables-essentials/Filter";
import { managementApi } from "@/app/api/super-admin/user-management";
import { useParams, useRouter } from "next/navigation";
import {
  PropertyResponse,
  BillingHistoryResponse,
  GetUserPropertiesParams,
  GetUserBillingParams,
} from "@/app/api/super-admin/user-management/types";

interface UserDetail {
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
    listedProperties: number;
    certifiedProperties: number;
    expiredCertificates: number;
    rejectedProperties: number;
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

// Debounce hook for search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function Detail() {
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const [userData, setUserData] = useState<UserDetail | null>(null);
  const [credentials, setCredentials] = useState([
    {
      id: 1,
      img: "/images/apartment.svg",
      val: "0",
      title: "Listed Properties",
    },
    {
      id: 2,
      img: "/images/p-app.svg",
      val: "0",
      title: "Certified Properties",
    },
    {
      id: 3,
      img: "/images/reject.svg",
      val: "0",
      title: "Expired Certificates",
    },
    {
      id: 4,
      img: "/images/approved.svg",
      val: "0",
      title: "Rejected Properties",
    },
  ]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Properties Table States
  const [propertySearchTerm, setPropertySearchTerm] = useState("");
  const [propertyCurrentPage, setPropertyCurrentPage] = useState(1);
  const [propertyItemsPerPage] = useState(10);
  const [isPropertyFilterOpen, setIsPropertyFilterOpen] = useState(false);
  const [propertySelectedRows, setPropertySelectedRows] = useState<Set<string>>(new Set());
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [, setDeletingProperties] = useState<Set<string>>(new Set());

  // Property Filter states
  const [propertyAppliedFilters, setPropertyAppliedFilters] = useState({
    ownership: "",
    status: "",
    submittedDate: "",
  });

  const [propertyTempFilters, setPropertyTempFilters] = useState({
    ownership: "",
    status: "",
    submittedDate: "",
  });

  const [propertySubmittedDate, setPropertySubmittedDate] = useState<Date | null>(null);

  const [allPropertyData, setAllPropertyData] = useState<PropertyResponse["data"]>([]);
  const [propertyPagination, setPropertyPagination] = useState<PaginationData>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    totalPages: 1,
    nextPage: null,
    prevPage: null,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Billing Table States
  const [billingSearchTerm, setBillingSearchTerm] = useState("");
  const [billingCurrentPage, setBillingCurrentPage] = useState(1);
  const [billingItemsPerPage] = useState(10);
  const [isBillingFilterOpen, setIsBillingFilterOpen] = useState(false);
  const [billingSelectedRows, setBillingSelectedRows] = useState<Set<string>>(new Set());
  const [billingLoading, setBillingLoading] = useState(false);

  // Billing Filter states
  const [billingAppliedFilters, setBillingAppliedFilters] = useState({
    status: "",
    purchaseDate: "",
    endDate: "",
  });

  const [billingTempFilters, setBillingTempFilters] = useState({
    status: "",
    purchaseDate: "",
    endDate: "",
  });

  const [billingPurchaseDate, setBillingPurchaseDate] = useState<Date | null>(null);
  const [billingEndDate, setBillingEndDate] = useState<Date | null>(null);

  const [allBillingData, setAllBillingData] = useState<BillingHistoryResponse["data"]>([]);
  const [billingPagination, setBillingPagination] = useState<PaginationData>({
    total: 0,
    pageSize: 10,
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
    id: string;
    type: "property" | "billing";
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");
  const [deleteType, setDeleteType] = useState<"property" | "billing">("property");

  // Dropdown states for filters
  const [showOwnershipDropdown, setShowOwnershipDropdown] = useState(false);
  const [showPropertyStatusDropdown, setShowPropertyStatusDropdown] = useState(false);
  const [showBillingStatusDropdown, setShowBillingStatusDropdown] = useState(false);

  // Debounced search terms
  const debouncedPropertySearch = useDebounce(propertySearchTerm, 500);
  const debouncedBillingSearch = useDebounce(billingSearchTerm, 500);

  // Check if search term is valid for API call (3+ chars or empty)
  const isValidPropertySearch = useMemo(() => {
    return debouncedPropertySearch.length >= 3 || debouncedPropertySearch.length === 0;
  }, [debouncedPropertySearch]);

  const isValidBillingSearch = useMemo(() => {
    return debouncedBillingSearch.length >= 3 || debouncedBillingSearch.length === 0;
  }, [debouncedBillingSearch]);

  // Format date for API
  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        const response = await managementApi.getUserDetail(userId);
        setUserData(response.data as UserDetail);

        // Update credentials with API data
        setCredentials([
          {
            id: 1,
            img: "/images/apartment.svg",
            val: response.data.statistics.listedProperties.toString(),
            title: "Listed Properties",
          },
          {
            id: 2,
            img: "/images/p-app.svg",
            val: response.data.statistics.certifiedProperties.toString(),
            title: "Certified Properties",
          },
          {
            id: 3,
            img: "/images/reject.svg",
            val: response.data.statistics.expiredCertificates.toString(),
            title: "Expired Certificates",
          },
          {
            id: 4,
            img: "/images/approved.svg",
            val: response.data.statistics.rejectedProperties.toString(),
            title: "Rejected Properties",
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };

    fetchData();
  }, [userId]);

  // Fetch properties data with proper pagination
  const fetchProperties = useCallback(async () => {
    if (!userId) return;

    setPropertyLoading(true);
    try {
      const queryParams: GetUserPropertiesParams = {
        page: propertyCurrentPage,
        limit: propertyItemsPerPage,
      };

      // Only include search if it has 3 or more characters OR is empty (to clear search)
      if (isValidPropertySearch && debouncedPropertySearch.trim()) {
        queryParams.search = debouncedPropertySearch.trim();
      }

      // Add filters if applicable
      if (propertyAppliedFilters.ownership.trim()) {
        queryParams.ownership = propertyAppliedFilters.ownership.trim();
      }

      if (propertyAppliedFilters.status.trim()) {
        queryParams.status = propertyAppliedFilters.status.trim();
      }

      if (propertyAppliedFilters.submittedDate) {
        const submittedDateObj = new Date(propertyAppliedFilters.submittedDate);
        queryParams.submittedFrom = submittedDateObj.toISOString().split("T")[0];
        // queryParams.submittedTo = submittedDateObj.toISOString().split("T")[0];
      }

      console.log('🔍 Fetching properties with params:', queryParams);
      const response = await managementApi.getUserProperties(userId, queryParams);
      
      setAllPropertyData(response.data.data);
      
      // Update pagination from API response
      if (response.data.pagination) {
        setPropertyPagination({
          total: response.data.pagination.total || 0,
          pageSize: response.data.pagination.limit || propertyItemsPerPage,
          currentPage: response.data.pagination.page || propertyCurrentPage,
          totalPages: response.data.pagination.totalPages || 1,
          nextPage: response.data.pagination.nextPage || null,
          prevPage: response.data.pagination.prevPage || null,
          hasNextPage: response.data.pagination.hasNextPage || false,
          hasPrevPage: response.data.pagination.hasPrevPage || false
        });
      }
      
    } catch (error) {
      console.error("❌ Failed to fetch properties:", error);
      setAllPropertyData([]);
      setPropertyPagination({
        total: 0,
        pageSize: propertyItemsPerPage,
        currentPage: 1,
        totalPages: 1,
        nextPage: null,
        prevPage: null,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setPropertyLoading(false);
    }
  }, [
    userId,
    debouncedPropertySearch,
    propertyAppliedFilters.ownership,
    propertyAppliedFilters.status,
    propertyAppliedFilters.submittedDate,
    propertyCurrentPage,
    propertyItemsPerPage,
    isValidPropertySearch, // Add this dependency
  ]);

  // Fetch billing data with proper pagination
  const fetchBilling = useCallback(async () => {
    if (!userId) return;

    setBillingLoading(true);
    try {
      const queryParams: GetUserBillingParams = {
        page: billingCurrentPage,
        limit: billingItemsPerPage,
      };

      // Only include search if it has 3 or more characters OR is empty (to clear search)
      if (isValidBillingSearch && debouncedBillingSearch.trim()) {
        queryParams.search = debouncedBillingSearch.trim();
      }

      // Add filters if applicable
      if (billingAppliedFilters.status.trim()) {
        queryParams.status = billingAppliedFilters.status.trim();
      }

      if (billingAppliedFilters.purchaseDate) {
        const purchaseDateObj = new Date(billingAppliedFilters.purchaseDate);
        queryParams.endDateFrom = purchaseDateObj.toISOString().split("T")[0];
      }

      if (billingAppliedFilters.endDate) {
        const endDateObj = new Date(billingAppliedFilters.endDate);
        queryParams.endDateTo = endDateObj.toISOString().split("T")[0];
      }

      const response = await managementApi.getUserBilling(userId, queryParams);
      setAllBillingData(response.data.data);
      
      // Update pagination from API response
      if (response.data.pagination) {
        setBillingPagination({
          total: response.data.pagination.total || 0,
          pageSize: response.data.pagination.limit || billingItemsPerPage,
          currentPage: response.data.pagination.page || billingCurrentPage,
          totalPages: response.data.pagination.totalPages || 1,
          nextPage: response.data.pagination.nextPage || null,
          prevPage: response.data.pagination.prevPage || null,
          hasNextPage: response.data.pagination.hasNextPage || false,
          hasPrevPage: response.data.pagination.hasPrevPage || false
        });
      }
      
    } catch (error) {
      console.error("Failed to fetch billing:", error);
      setAllBillingData([]);
      setBillingPagination({
        total: 0,
        pageSize: billingItemsPerPage,
        currentPage: 1,
        totalPages: 1,
        nextPage: null,
        prevPage: null,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setBillingLoading(false);
    }
  }, [
    userId,
    debouncedBillingSearch,
    billingAppliedFilters.status,
    billingAppliedFilters.purchaseDate,
    billingAppliedFilters.endDate,
    billingCurrentPage,
    billingItemsPerPage,
    isValidBillingSearch, // Add this dependency
  ]);

  // Single useEffect for properties data fetching - only when valid search
  useEffect(() => {
    if (isValidPropertySearch) {
      fetchProperties();
    }
  }, [fetchProperties, isValidPropertySearch]);

  // Single useEffect for billing data fetching - only when valid search
  useEffect(() => {
    if (isValidBillingSearch) {
      fetchBilling();
    }
  }, [fetchBilling, isValidBillingSearch]);

  // Reset to page 1 when property filters/search change
  useEffect(() => {
    setPropertyCurrentPage(1);
  }, [debouncedPropertySearch, propertyAppliedFilters.ownership, propertyAppliedFilters.status, propertyAppliedFilters.submittedDate]);

  // Reset to page 1 when billing filters/search change
  useEffect(() => {
    setBillingCurrentPage(1);
  }, [debouncedBillingSearch, billingAppliedFilters.status, billingAppliedFilters.purchaseDate, billingAppliedFilters.endDate]);

  // Sync temp filters when filter drawers open
  useEffect(() => {
    if (isPropertyFilterOpen) {
      setPropertyTempFilters(propertyAppliedFilters);
      if (propertyAppliedFilters.submittedDate) {
        setPropertySubmittedDate(new Date(propertyAppliedFilters.submittedDate));
      } else {
        setPropertySubmittedDate(null);
      }
    }
  }, [isPropertyFilterOpen, propertyAppliedFilters]);

  useEffect(() => {
    if (isBillingFilterOpen) {
      setBillingTempFilters(billingAppliedFilters);
      if (billingAppliedFilters.purchaseDate) {
        setBillingPurchaseDate(new Date(billingAppliedFilters.purchaseDate));
      } else {
        setBillingPurchaseDate(null);
      }
      if (billingAppliedFilters.endDate) {
        setBillingEndDate(new Date(billingAppliedFilters.endDate));
      } else {
        setBillingEndDate(null);
      }
    }
  }, [isBillingFilterOpen, billingAppliedFilters]);

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

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setIsDropdownOpen(false);
  };

  const statusOptions = [
    { label: "Active", onClick: () => handleStatusSelect("Active") },
    { label: "Inactive", onClick: () => handleStatusSelect("Inactive") },
    { label: "Expired", onClick: () => handleStatusSelect("Expired") },
  ];

  // Delete property function
  const deleteProperty = async (propertyId: string) => {
    setDeletingProperties((prev) => new Set(prev).add(propertyId));
    try {
      await managementApi.deleteApplication(propertyId);
      await fetchProperties();
      // Remove from selected rows
      setPropertySelectedRows((prev) => {
        const newSelected = new Set(prev);
        newSelected.delete(propertyId);
        return newSelected;
      });
      return true;
    } catch (error) {
      console.error("Failed to delete property:", error);
      return false;
    } finally {
      setDeletingProperties((prev) => {
        const newDeleting = new Set(prev);
        newDeleting.delete(propertyId);
        return newDeleting;
      });
    }
  };

  // Delete multiple properties
  const deleteMultipleProperties = async (propertyIds: string[]) => {
    const results = await Promise.allSettled(
      propertyIds.map((id) => deleteProperty(id))
    );

    const successfulDeletes = results.filter(
      (result) => result.status === "fulfilled" && result.value
    ).length;

    if (successfulDeletes > 0) {
      console.log(`Successfully deleted ${successfulDeletes} properties`);
    }

    return successfulDeletes > 0;
  };

  // Transform API data for table display - Properties
  const displayPropertyData = useMemo(() => {
    if (!allPropertyData || allPropertyData.length === 0) {
      return [];
    }
    
    return allPropertyData.map((property) => {
      const propertyDetails = property.propertyDetails || {};
      
      return {
        "Application ID": property.id ? property.id.substring(0, 8).toUpperCase() : "N/A",
        "Property Name": propertyDetails.propertyName || "Unnamed Property",
        "Ownership": propertyDetails.ownership || "Unknown",
        "Submitted On": property.submittedAt 
          ? new Date(property.submittedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric", 
              year: "numeric",
            })
          : "Not Submitted",
        "Reviewed By": property.reviewedAt ? "Admin" : "Not Reviewed",
        "Status": property.status 
          ? property.status.charAt(0) + property.status.slice(1).toLowerCase()
          : "Unknown",
      };
    });
  }, [allPropertyData]);

  // Transform API data for table display - Billing
  const displayBillingData = useMemo(() => {
    if (!allBillingData || allBillingData.length === 0) return [];
    
    return allBillingData.map((billing) => ({
      "Plan Name": "Certification Fee",
      "Amount": `${billing.amount || 0} ${billing.currency || "USD"}`,
      "Purchase Date": billing.createdAt 
        ? new Date(billing.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "N/A",
      "End Date": billing.createdAt 
        ? new Date(billing.createdAt).toLocaleDateString("en-US", {
            month: "short", 
            day: "numeric",
            year: "numeric",
          })
        : "N/A",
      "Status": billing.status === "COMPLETED" ? "Active" : "Inactive",
    }));
  }, [allBillingData]);

  // Get unique values for filter options from API data
  const uniqueOwnerships = useMemo(() => {
    return [
      ...new Set(allPropertyData.map((item) => item.propertyDetails?.ownership || "")),
    ].filter(Boolean);
  }, [allPropertyData]);

  const uniquePropertyStatuses = useMemo(() => {
    return [...new Set(allPropertyData.map((item) => item.status))].filter(Boolean);
  }, [allPropertyData]);

  const uniqueBillingStatuses = useMemo(() => {
    return [...new Set(allBillingData.map((item) => item.status))].filter(Boolean);
  }, [allBillingData]);

  // Property Table Handlers
  const handlePropertySelectAll = (checked: boolean) => {
    const newSelected = new Set(propertySelectedRows);
    if (checked) {
      allPropertyData.forEach((item) => newSelected.add(item.id));
    } else {
      allPropertyData.forEach((item) => newSelected.delete(item.id));
    }
    setPropertySelectedRows(newSelected);
  };

  const handlePropertySelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(propertySelectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setPropertySelectedRows(newSelected);
  };

  const isAllPropertySelected = useMemo(() => {
    return (
      allPropertyData.length > 0 &&
      allPropertyData.every((item) => propertySelectedRows.has(item.id))
    );
  }, [allPropertyData, propertySelectedRows]);

  const isSomePropertySelected = useMemo(() => {
    return (
      allPropertyData.some((item) => propertySelectedRows.has(item.id)) &&
      !isAllPropertySelected
    );
  }, [allPropertyData, propertySelectedRows, isAllPropertySelected]);

  // Billing Table Handlers
  const handleBillingSelectAll = (checked: boolean) => {
    const newSelected = new Set(billingSelectedRows);
    if (checked) {
      allBillingData.forEach((item) => newSelected.add(item.id));
    } else {
      allBillingData.forEach((item) => newSelected.delete(item.id));
    }
    setBillingSelectedRows(newSelected);
  };

  const handleBillingSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(billingSelectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setBillingSelectedRows(newSelected);
  };

  const isAllBillingSelected = useMemo(() => {
    return (
      allBillingData.length > 0 &&
      allBillingData.every((item) => billingSelectedRows.has(item.id))
    );
  }, [allBillingData, billingSelectedRows]);

  const isSomeBillingSelected = useMemo(() => {
    return (
      allBillingData.some((item) => billingSelectedRows.has(item.id)) &&
      !isAllBillingSelected
    );
  }, [allBillingData, billingSelectedRows, isAllBillingSelected]);

  // Delete Handlers
  const openDeleteSingleModal = (
    row: Record<string, string>,
    id: string,
    type: "property" | "billing"
  ) => {
    setSingleRowToDelete({ row, id, type });
    setModalType("single");
    setDeleteType(type);
    setIsModalOpen(true);
  };

  const handleDeleteSelected = (type: "property" | "billing") => {
    const selectedRows = type === "property" ? propertySelectedRows : billingSelectedRows;
    if (selectedRows.size > 0) {
      setModalType("multiple");
      setDeleteType(type);
      setIsModalOpen(true);
    }
  };

  const handleModalConfirm = async () => {
    if (modalType === "single" && singleRowToDelete) {
      if (singleRowToDelete.type === "property") {
        await deleteProperty(singleRowToDelete.id);
      }
      // Handle billing deletion if needed
    } else if (modalType === "multiple" && deleteType === "property") {
      const propertyIds = Array.from(propertySelectedRows);
      await deleteMultipleProperties(propertyIds);
    }

    setIsModalOpen(false);
    setSingleRowToDelete(null);
  };

  // Property Filter Handlers
  const handlePropertyResetFilter = () => {
    const resetFilters = {
      ownership: "",
      status: "",
      submittedDate: "",
    };

    setPropertyTempFilters(resetFilters);
    setPropertyAppliedFilters(resetFilters);
    setPropertySubmittedDate(null);
    setPropertySearchTerm("");
    setPropertyCurrentPage(1);
    setIsPropertyFilterOpen(false);
  };

  const handlePropertyApplyFilter = () => {
    const dateString = formatDateForAPI(propertySubmittedDate);
    
    const filtersToApply = {
      ownership: propertyTempFilters.ownership,
      status: propertyTempFilters.status,
      submittedDate: dateString,
    };

    setPropertyAppliedFilters(filtersToApply);
    setPropertyCurrentPage(1);
    setIsPropertyFilterOpen(false);
  };

  const handlePropertyCloseFilter = () => {
    setPropertyTempFilters(propertyAppliedFilters);
    if (propertyAppliedFilters.submittedDate) {
      setPropertySubmittedDate(new Date(propertyAppliedFilters.submittedDate));
    } else {
      setPropertySubmittedDate(null);
    }
    setIsPropertyFilterOpen(false);
  };

  // Billing Filter Handlers
  const handleBillingResetFilter = () => {
    const resetFilters = {
      status: "",
      purchaseDate: "",
      endDate: "",
    };

    setBillingTempFilters(resetFilters);
    setBillingAppliedFilters(resetFilters);
    setBillingPurchaseDate(null);
    setBillingEndDate(null);
    setBillingSearchTerm("");
    setBillingCurrentPage(1);
    setIsBillingFilterOpen(false);
  };

  const handleBillingApplyFilter = () => {
    const purchaseDateString = formatDateForAPI(billingPurchaseDate);
    const endDateString = formatDateForAPI(billingEndDate);
    
    const filtersToApply = {
      status: billingTempFilters.status,
      purchaseDate: purchaseDateString,
      endDate: endDateString,
    };

    setBillingAppliedFilters(filtersToApply);
    setBillingCurrentPage(1);
    setIsBillingFilterOpen(false);
  };

  const handleBillingCloseFilter = () => {
    setBillingTempFilters(billingAppliedFilters);
    if (billingAppliedFilters.purchaseDate) {
      setBillingPurchaseDate(new Date(billingAppliedFilters.purchaseDate));
    } else {
      setBillingPurchaseDate(null);
    }
    if (billingAppliedFilters.endDate) {
      setBillingEndDate(new Date(billingAppliedFilters.endDate));
    } else {
      setBillingEndDate(null);
    }
    setIsBillingFilterOpen(false);
  };

  // Pagination Handlers
  const handlePropertyPageChange = (page: number) => {
    setPropertyCurrentPage(page);
  };

  const handleBillingPageChange = (page: number) => {
    setBillingCurrentPage(page);
  };

  // Search change handlers with validation
  const handlePropertySearchChange = (value: string) => {
    setPropertySearchTerm(value);
    // Only trigger API call if valid search (handled by useEffect)
  };

  const handleBillingSearchChange = (value: string) => {
    setBillingSearchTerm(value);
    // Only trigger API call if valid search (handled by useEffect)
  };

  const propertyDropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = allPropertyData[index];
        router.push(`sub-detail/${originalRow.id}`);
      },
    },
    {
      label: "Delete Application",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = allPropertyData[index];
        openDeleteSingleModal(row, originalRow.id, "property");
      },
    },
  ];

  const billingDropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = allBillingData[index];
        console.log("View billing details:", originalRow);
      },
    },
    {
      label: "Delete",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = allBillingData[index];
        openDeleteSingleModal(row, originalRow.id, "billing");
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

      <nav className="flex py-3 mb-5 text-gray-200 rounded-lg bg-transparent">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <Link
              href="/super-admin/dashboard/user-management"
              className="text-[16px] font-regular leading-5 text-white/60 hover:text-[#EFFC76] md:ms-2"
            >
              Registered Hosts
            </Link>
          </li>

          <Image
            src="/images/greater.svg"
            alt="Greater"
            height={16}
            width={16}
          />
          <li aria-current="page">
            <p className="text-[16px] leading-5 font-regular text-white">
              {userData?.name || "Loading..."}
            </p>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-0 justify-between">
        <div className="flex gap-4 items-center">
          <Image
            src="/images/profile.png"
            alt="profile"
            height={72}
            width={72}
          />
          <div>
            <h3 className="font-medium text-[24px] leading-7">
              {userData?.name || "Loading..."}
            </h3>
            <p className="font-regular text-[16px] leading-5 text-[#FFFFFFCC] mt-2">
              {userData?.email || "Loading..."}
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
          >
            {selectedStatus}
            <Image
              src="/images/dropdown.svg"
              alt="Dropdown"
              height={16}
              width={16}
            />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 right-10 sm:-right-21 z-10 w-[121px]">
              <Dropdown items={statusOptions} />
            </div>
          )}
        </div>
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
                <p className="text-white/80 font-regular text-[14px] leading-[18px] pt-2">
                  {item.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Listed Properties Table */}
      <div className="mt-8">
        <Table
          data={displayPropertyData}
          title="Listed Properties"
          showDeleteButton={true}
          onDeleteSingle={(row, index) => {
            const originalRow = allPropertyData[index];
            openDeleteSingleModal(row, originalRow.id, "property");
          }}
          showPagination={true}
          clickable={true}
          selectedRows={propertySelectedRows}
          setSelectedRows={setPropertySelectedRows}
          onSelectAll={handlePropertySelectAll}
          onSelectRow={handlePropertySelectRow}
          isAllSelected={isAllPropertySelected}
          isSomeSelected={isSomePropertySelected}
          rowIds={allPropertyData.map((item) => item.id)}
          dropdownItems={propertyDropdownItems}
          searchTerm={propertySearchTerm}
          onSearchChange={handlePropertySearchChange}
          currentPage={propertyCurrentPage}
          onPageChange={handlePropertyPageChange}
          itemsPerPage={propertyPagination.pageSize}
          totalItems={propertyPagination.total}
          showFilter={true}
          onFilterToggle={setIsPropertyFilterOpen}
          onDeleteAll={() => handleDeleteSelected("property")}
          isDeleteAllDisabled={propertySelectedRows.size === 0}
          disableClientSidePagination={true}
          isLoading={propertyLoading}
        />
      </div>

      {/* Billing History Table */}
      <div className="mt-10">
        <Table
          data={displayBillingData}
          title="Billing History"
          showDeleteButton={false}
          onDeleteSingle={(row, index) => {
            const originalRow = allBillingData[index];
            openDeleteSingleModal(row, originalRow.id, "billing");
          }}
          showPagination={true}
          clickable={true}
          selectedRows={billingSelectedRows}
          setSelectedRows={setBillingSelectedRows}
          onSelectAll={handleBillingSelectAll}
          onSelectRow={handleBillingSelectRow}
          isAllSelected={isAllBillingSelected}
          isSomeSelected={isSomeBillingSelected}
          rowIds={allBillingData.map((item) => item.id)}
          dropdownItems={billingDropdownItems}
          searchTerm={billingSearchTerm}
          onSearchChange={handleBillingSearchChange}
          currentPage={billingCurrentPage}
          onPageChange={handleBillingPageChange}
          itemsPerPage={billingPagination.pageSize}
          totalItems={billingPagination.total}
          showFilter={true}
          onFilterToggle={setIsBillingFilterOpen}
          onDeleteAll={() => handleDeleteSelected("billing")}
          isDeleteAllDisabled={billingSelectedRows.size === 0}
          disableClientSidePagination={true}
          isLoading={billingLoading}
        />
      </div>

      {/* Property Filter Drawer */}
      <FilterDrawer
        isOpen={isPropertyFilterOpen}
        onClose={handlePropertyCloseFilter}
        title="Apply Filter"
        description="Refine listings to find the right property faster."
        resetLabel="Reset"
        onReset={handlePropertyResetFilter}
        buttonLabel="Apply Filter"
        onApply={handlePropertyApplyFilter}
        filterValues={{
          ownership: propertyTempFilters.ownership,
          status: propertyTempFilters.status,
          "Submitted date": propertySubmittedDate,
        }}
        onFilterChange={(newValues) => {
          if (newValues.ownership !== undefined) {
            setPropertyTempFilters(prev => ({ ...prev, ownership: newValues.ownership as string }));
          }
          if (newValues.status !== undefined) {
            setPropertyTempFilters(prev => ({ ...prev, status: newValues.status as string }));
          }
          if (newValues["Submitted date"] !== undefined) {
            setPropertySubmittedDate(newValues["Submitted date"] as Date | null);
          }
        }}
        dropdownStates={{
          ownership: showOwnershipDropdown,
          status: showPropertyStatusDropdown,
        }}
        onDropdownToggle={(key, value) => {
          if (key === "ownership") setShowOwnershipDropdown(value);
          if (key === "status") setShowPropertyStatusDropdown(value);
        }}
        fields={[
          {
            label: "Ownership",
            key: "ownership",
            type: "dropdown",
            placeholder: "Select ownership",
            options: uniqueOwnerships,
          },
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: uniquePropertyStatuses,
          },
          {
            label: "Submitted date",
            key: "Submitted date",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />

      {/* Billing Filter Drawer */}
      <FilterDrawer
        isOpen={isBillingFilterOpen}
        onClose={handleBillingCloseFilter}
        title="Apply Filter"
        description="Refine billing records to find the right information."
        resetLabel="Reset"
        onReset={handleBillingResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleBillingApplyFilter}
        filterValues={{
          status: billingTempFilters.status,
          "Purchase Date": billingPurchaseDate,
          "End Date": billingEndDate,
        }}
        onFilterChange={(newValues) => {
          if (newValues.status !== undefined) {
            setBillingTempFilters(prev => ({ ...prev, status: newValues.status as string }));
          }
          if (newValues["Purchase Date"] !== undefined) {
            setBillingPurchaseDate(newValues["Purchase Date"] as Date | null);
          }
          if (newValues["End Date"] !== undefined) {
            setBillingEndDate(newValues["End Date"] as Date | null);
          }
        }}
        dropdownStates={{
          status: showBillingStatusDropdown,
        }}
        onDropdownToggle={(key, value) => {
          if (key === "status") setShowBillingStatusDropdown(value);
        }}
        fields={[
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: uniqueBillingStatuses,
          },
          {
            label: "Purchase Date",
            key: "Purchase Date",
            type: "date",
            placeholder: "Select date",
          },
          {
            label: "End Date",
            key: "End Date",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </div>
  );
}