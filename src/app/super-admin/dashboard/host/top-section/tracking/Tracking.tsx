"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/admin/tables-essentials/Filter";
import { managementApi, GetUsersParams } from "@/app/api/super-admin/user-management/index";

interface AdminData {
  id: number;
  "Admin Name": string;
  "Email": string;
  Status: string;
}

// Normalize status for display (convert API status to display format)
const normalizeStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'Active',
    'SUSPENDED': 'Suspended',
    'PENDING_VERIFICATION': 'PENDING_VERIFICATION'
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
    totalPages: 1
  });

  // Fetch data from API
  const fetchData = async (params?: GetUsersParams) => {
    setIsLoading(true);
    try {
      const response = await managementApi.getAdmins({
        ...params,
        page: currentPage,
        limit: 10
      });
      
      if (response.data) {
        // Convert API data to match our table format (simplified to match image)
        const convertedData: AdminData[] = response.data.data.map(admin => ({
          id: admin.id,
          "Admin Name": admin.name,
          "Email": admin.email,
          Status: normalizeStatus(admin.status),
        }));
        
        setAdminData(convertedData);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
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
  }, [searchTerm, appliedFilters, currentPage,fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    const idsToDelete = Array.from(selectedRowIds).map(id => parseInt(id));
    
    // Delete from API
    const deletePromises = idsToDelete.map(id => managementApi.deleteAdmin(id));
    const results = await Promise.all(deletePromises);
    
    // Refresh data if all deletions were successful
    if (results.every(result => result)) {
      fetchData();
    }
    
    setIsModalOpen(false);
    setSelectedRows(new Set());
  };

  const handleDeleteSingleApplication = async (row: Record<string, string>, id: number) => {
    const success = await managementApi.deleteAdmin(id);
    if (success) {
      fetchData(); // Refresh data
    }
    
    setIsModalOpen(false);
    setSingleRowToDelete(null);
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
            setIsModalOpen(false);
            setSelectedRows(new Set());
            setSingleRowToDelete(null);
          }}
          onConfirm={handleModalConfirm}
          title="Confirm Admin Deletion"
          description="Deleting this admin means they will no longer have access to the system."
          image="/images/delete-modal.png"
          confirmText="Delete"
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
          isDeleteAllDisabled={selectedRows.size === 0}
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
            options: STATIC_STATUS_OPTIONS
          },
        ]}
      />
    </>
  );
}