"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/admin/tables-essentials/Filter";
import { managementApi } from "@/app/api/super-admin/user-management/index";
import { GetUsersParams } from "@/app/api/super-admin/user-management/types";
import toast from "react-hot-toast";

interface AdminData {
  id: number;
  "Admin Name": string;
  Email: string;
  Status: string;
}



// Normalize status for display (convert API status to display format)
const normalizeStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    ACTIVE: "Active",
    SUSPENDED: "Suspended",
    PENDING_VERIFICATION: "PENDING_VERIFICATION",
  };
  return statusMap[status] || status;
};

// Static status options for filter dropdown
const STATIC_STATUS_OPTIONS = ["Active", "Suspended", "PENDING_VERIFICATION"];

export default function Applications() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: number;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Separate state for applied filters and temporary filter selections
  const [appliedFilters, setAppliedFilters] = useState({
    status: "",
  });

  const [tempFilters, setTempFilters] = useState({
    status: "",
  });

  // API data state
  const [adminData, setAdminData] = useState<AdminData[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Fetch data from API
  const fetchData = async (params?: GetUsersParams) => {
    setIsLoading(true);
    try {
      const response = await managementApi.getAdmins({
        ...params,
        page: currentPage,
        limit: 10,
      });

      if (response.data) {
        // Convert API data to match our table format (simplified to match image)
        const convertedData: AdminData[] = response.data.data.map((admin) => ({
          id: admin.id,
          "Admin Name": admin.name,
          Email: admin.email,
          Status: normalizeStatus(admin.status),
        }));

        setAdminData(convertedData);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to load admin data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search changes (still works in real-time)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Don't fetch any data if search term has 1-3 characters
      if (searchTerm && searchTerm.length <= 3) {
        return;
      }

      const params: GetUsersParams = {};

      if (searchTerm && searchTerm.length > 3) {
        params.search = searchTerm;
      }

      // Apply status filter from applied filters
      if (appliedFilters.status) {
        params.status = appliedFilters.status.toUpperCase();
      }

      fetchData(params);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, appliedFilters, currentPage]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, appliedFilters]);

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set<string>();
    if (checked) {
      adminData.forEach((item) => newSelected.add(item.id.toString()));
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
      adminData.length > 0 &&
      adminData.every((item) => selectedRows.has(item.id.toString()))
    );
  }, [adminData, selectedRows]);

  const isSomeDisplayedSelected = useMemo(() => {
    return (
      adminData.some((item) => selectedRows.has(item.id.toString())) &&
      !isAllDisplayedSelected
    );
  }, [adminData, selectedRows, isAllDisplayedSelected]);

  const handleDeleteApplications = async (selectedRowIds: Set<string>) => {
    setIsDeleting(true);
    try {
      const idsToDelete = Array.from(selectedRowIds).map((id) => parseInt(id));

      // Get admin details for better error messages
      const adminsToDelete = adminData.filter((admin) =>
        selectedRowIds.has(admin.id.toString())
      );

      // Show loading toast for multiple deletions
      const loadingToast = toast.loading(
        `Deleting ${idsToDelete.length} admin(s)...`
      );

      // Delete from API
      const deletePromises = idsToDelete.map((id) =>
        managementApi.deleteAdmin(id)
      );
      const results = await Promise.allSettled(deletePromises);

      // Process results with proper error handling
      const successfulDeletions: { id: number; name: string; email: string }[] =
        [];
      const failedDeletions: {
        id: number;
        name: string;
        email: string;
        error: string;
      }[] = [];

      results.forEach((result, index) => {
        const adminId = idsToDelete[index];
        const admin = adminsToDelete.find((a) => a.id === adminId);
        const adminName = admin?.["Admin Name"] || `Admin ${adminId}`;
        const adminEmail = admin?.["Email"] || "Unknown email";

        if (result.status === "fulfilled" && result.value.success === true) {
          successfulDeletions.push({
            id: adminId,
            name: adminName,
            email: adminEmail,
          });
        } else {
          const error =
            result.status === "fulfilled" ? result.value : result.reason;
          failedDeletions.push({
            id: adminId,
            name: adminName,
            email: adminEmail,
            error,
          });
        }
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (failedDeletions.length === 0) {
        // All deletions successful
        toast.success(
          `Successfully deleted ${successfulDeletions.length} admin(s)`
        );
        fetchData(); // Refresh data
        setSelectedRows(new Set());
      } else if (successfulDeletions.length > 0 && failedDeletions.length > 0) {
        // Partial success - show which ones failed with proper error messages
        const errorMessages = failedDeletions.map((failed) => {
          return getErrorMessage(failed.error, failed.name);
        });

        toast.error(
          <div>
            <p>
              Successfully deleted {successfulDeletions.length} admin(s), but
              failed to delete {failedDeletions.length} admin(s):
            </p>
            <ul className="list-disc list-inside mt-1">
              {errorMessages.map((msg, idx) => (
                <li key={idx} className="text-sm">
                  {msg}
                </li>
              ))}
            </ul>
          </div>,
          { duration: 6000 }
        );
        fetchData(); // Still refresh data to reflect successful deletions
        setSelectedRows(new Set());
      } else {
        // All deletions failed
        const errorMessages = failedDeletions.map((failed) => {
          return getErrorMessage(failed.error, failed.name);
        });

        toast.error(
          <div>
            <p>Failed to delete all {failedDeletions.length} admin(s):</p>
            <ul className="list-disc list-inside mt-1">
              {errorMessages.map((msg, idx) => (
                <li key={idx} className="text-sm">
                  {msg}
                </li>
              ))}
            </ul>
          </div>,
          { duration: 6000 }
        );
      }
    } catch (error) {
      console.error("Error deleting admins:", error);
      toast.error(
        "An unexpected error occurred while deleting admins. Please try again."
      );
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };
  const handleDeleteSingleApplication = async (
    row: Record<string, string>,
    id: number
  ) => {
    setIsDeleting(true);
    try {
      const adminName = row["Admin Name"] || "this admin";

      // Show loading toast
      const loadingToast = toast.loading(`Deleting admin ${adminName}...`);

      const result = await managementApi.deleteAdmin(id);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (result.success === true) {
        toast.success(`Admin ${adminName} has been successfully deleted`);
        fetchData(); // Refresh data
      } else {
        // Handle API error response
        const errorMessage = getErrorMessage(result, adminName);
        toast.error(errorMessage, { duration: 5000 });
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      const adminName = row["Admin Name"] || "this admin";
      const errorMessage = getErrorMessage(error, adminName);
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
      setSingleRowToDelete(null);
    }
  };

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error: unknown, adminName: string): string => {
  console.log("Error details:", error);

  // Type guard to check if error is an object
  const isErrorObject = (err: unknown): err is Record<string, unknown> => 
    typeof err === 'object' && err !== null;

  // Check for foreign key constraint violation
  if (isErrorObject(error)) {
    // Check for direct error properties
    if (
      error.code === "FOREIGN_KEY_CONSTRAINT_VIOLATION" ||
      error.prismaCode === "P2003"
    ) {
      let constraintDetails: string | undefined;
      
      // Check for constraint in error.details?.meta?.constraint
      if (isErrorObject(error.details) && 
          isErrorObject(error.details.meta) && 
          typeof error.details.meta.constraint === 'string') {
        constraintDetails = error.details.meta.constraint;
      }
      
      // Check for constraint in error.error?.details?.meta?.constraint
      if (!constraintDetails && 
          isErrorObject(error.error) && 
          isErrorObject(error.error.details) && 
          isErrorObject(error.error.details.meta) && 
          typeof error.error.details.meta.constraint === 'string') {
        constraintDetails = error.error.details.meta.constraint;
      }

      if (constraintDetails?.includes("notifications_userId_fkey")) {
        return `Cannot delete admin because they have associated notifications. Please clear their notifications first.`;
      } else if (constraintDetails) {
        return `Cannot delete ${adminName} because they have associated data in the system (${constraintDetails}).`;
      } else {
        return `Cannot delete ${adminName} because they have associated data in the system. Please remove all related records first.`;
      }
    }

    // Check for other specific error types
    if (error.code === "USER_HAS_ACTIVE_RECORDS") {
      return `Cannot delete ${adminName} because they have active records in the system.`;
    }

    // Check for message properties
    if (typeof error.message === 'string' && (
      error.message.includes("foreign key") || 
      error.message.includes("constraint")
    )) {
      return `Cannot delete ${adminName} because they have associated records in the system. Please remove all related data first.`;
    }

    // Generic error messages based on response
    if (typeof error.message === 'string') {
      return `Failed to delete ${adminName}: ${error.message}`;
    }
  }

  if (error === false) {
    return `Failed to delete ${adminName}. The server rejected the request.`;
  }

  // Default fallback
  return `Failed to delete ${adminName}. Please try again.`;
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
      handleDeleteSingleApplication(
        singleRowToDelete.row,
        singleRowToDelete.id
      );
    }
  };

  const handleResetFilter = () => {
    // Reset both temporary and applied filters
    const resetFilters = {
      status: "",
    };

    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters); // This will trigger the useEffect to fetch data without filters
    setCurrentPage(1);

    // Close the filter drawer
    setIsFilterOpen(false);
  };

  const handleApplyFilter = () => {
    setAppliedFilters(tempFilters);
    setIsFilterOpen(false);
    setCurrentPage(1); // Reset to first page when applying new filters
  };

  const handleFilterOpen = () => {
    // When opening filter, sync the current applied filters to temp filters
    setTempFilters(appliedFilters);
    setIsFilterOpen(true);
  };

  // Get appropriate modal content based on deletion type
  const getModalContent = () => {
    if (modalType === "single" && singleRowToDelete) {
      const adminName = singleRowToDelete.row["Admin Name"] || "this admin";
      return {
        title: "Confirm Admin Deletion",
        description: `Are you sure you want to delete ${adminName}? This action cannot be undone and they will no longer have access to the system.`,
        confirmText: isDeleting ? "Deleting..." : "Delete Admin",
      };
    } else {
      return {
        title: "Confirm Multiple Admin Deletions",
        description: `Are you sure you want to delete ${selectedRows.size} selected admin(s)? This action cannot be undone and they will lose system access.`,
        confirmText: isDeleting
          ? "Deleting..."
          : `Delete ${selectedRows.size} Admin(s)`,
      };
    }
  };

  const modalContent = getModalContent();

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
    return adminData.map(({ id: _id, ...rest }) => rest);
  }, [adminData]);

  const dropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = adminData[index];
        window.location.href = `/super-admin/dashboard/user-management/admin/detail/${originalRow.id}`;
      },
    },
    {
      label: "Delete Admin",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = adminData[index];
        openDeleteSingleModal(row, originalRow.id);
      },
    },
  ];

  return (
    <>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            if (!isDeleting) {
              setIsModalOpen(false);
              setSelectedRows(new Set());
              setSingleRowToDelete(null);
            }
          }}
          onConfirm={handleModalConfirm}
          title={modalContent.title}
          description={modalContent.description}
          image="/images/delete-modal.png"
          confirmText={modalContent.confirmText}
          // isConfirmDisabled={isDeleting}
          // isCancelDisabled={isDeleting}
        />
      )}

      <div className="flex flex-col justify-between pt-5">
        <Table
          setHeight={false}
          data={displayData}
          title="Registered Admins"
          control={tableControl}
          showDeleteButton={true}
          onDeleteSingle={(row, index) => {
            const originalRow = adminData[index];
            openDeleteSingleModal(row, originalRow.id);
          }}
          clickable={true}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          isAllSelected={isAllDisplayedSelected}
          isSomeSelected={isSomeDisplayedSelected}
          rowIds={adminData.map((item) => item.id.toString())}
          dropdownItems={dropdownItems}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          itemsPerPage={pagination.limit}
          totalItems={pagination.total}
          showFilter={true}
          onFilterToggle={handleFilterOpen}
          onDeleteAll={handleDeleteSelected}
          isDeleteAllDisabled={selectedRows.size === 0 || isDeleting}
          isLoading={isLoading}
        />
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Apply Filter"
        description="Refine admin listings to find the right admin faster."
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={tempFilters}
        onFilterChange={(filters) => {
          setTempFilters((prev) => ({
            ...prev,
            ...filters,
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
            options: STATIC_STATUS_OPTIONS,
          },
        ]}
      />
    </>
  );
}
