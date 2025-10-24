"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/admin/tables-essentials/Filter";
import TicketDrawer from "./Drawer";
import { managementApi, GetUsersParams } from "@/app/api/super-admin/user-management/index";

type ViewMode = "hosts" | "admins";
type TableRowData = Record<string, string | number>;
type DropdownStates = {
  "Listed Properties": boolean;
  "status": boolean;
};

// Match the UsersResponse data structure exactly
interface UserData {
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
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    applications: number;
    certifications: number;
    supportTickets: number;
  };
}

// Normalize status for display (convert API status to display format)
const normalizeStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'Active',
    'SUSPENDED': 'Suspended',
    'PENDING_VERIFICATION': 'Pending Verification'
  };
  return statusMap[status] || status;
};

// Convert display status to API status
const getApiStatus = (displayStatus: string): string => {
  const statusMap: Record<string, string> = {
    'Active': 'ACTIVE',
    'Suspended': 'SUSPENDED',
    'Pending Verification': 'PENDING_VERIFICATION'
  };
  return statusMap[displayStatus] || displayStatus;
};

export default function Applications() {
  const [viewMode, setViewMode] = useState<ViewMode>("hosts");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{ row: TableRowData; id: number } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");
  const [isAddAdminDrawerOpen, setIsAddAdminDrawerOpen] = useState(false);
  const [dropdownStates, setDropdownStates] = useState({ property: false, status: false });
  const [isLoading, setIsLoading] = useState(false);
  
  // API data state for both hosts and admins
  const [hostsData, setHostsData] = useState<UserData[]>([]);
  const [adminsData, setAdminsData] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  // Temporary filter states (before Apply is clicked)
  const [tempCertificationFilters, setTempCertificationFilters] = useState({
    "Listed Properties": "", 
    status: "", 
  });

  const [tempAdminFilters, setTempAdminFilters] = useState({
    status: "", 
  });

  // Applied filter states (after Apply is clicked)
  const [appliedCertificationFilters, setAppliedCertificationFilters] = useState({
    "Listed Properties": "", 
    status: "", 
  });

  const [appliedAdminFilters, setAppliedAdminFilters] = useState({
    status: "", 
  });

  // Fetch data based on view mode
  const fetchData = async (params?: GetUsersParams) => {
    setIsLoading(true);
    try {
      let response;
      
      if (viewMode === "hosts") {
        response = await managementApi.getUsers({
          ...params,
          page: currentPage,
          limit: 10
        });
      } else {
        response = await managementApi.getAdmins({
          ...params,
          page: currentPage,
          limit: 10
        });
      }
      
      if (response.data) {
        if (viewMode === "hosts") {
          setHostsData(response.data.data);
        } else {
          setAdminsData(response.data.data);
        }
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error(`Error fetching ${viewMode}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user/admin API call
  const deleteItem = async (itemId: number) => {
    try {
      if (viewMode === "hosts") {
        await managementApi.deleteUser(itemId);
      } else {
        await managementApi.deleteAdmin(itemId);
      }
      return true;
    } catch (error) {
      console.error(`Error deleting ${viewMode.slice(0, -1)}:`, error);
      return false;
    }
  };

  // Convert API data to table format (COMPLETELY REMOVE ID from table data)
  const convertToTableData = (users: UserData[]): TableRowData[] => {
    if (viewMode === "hosts") {
      return users.map(user => ({
        // ID is completely removed from the table data
        "Host Name": user.name,
        "Email": user.email,
        "Listed Properties": user._count.applications,
        "Certified Properties": user._count.certifications,
        "Account Created": new Date(user.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        }),
        "Status": normalizeStatus(user.status),
      }));
    } else {
      return users.map(user => ({
        // ID is completely removed from the table data
        "Admin Name": user.name,
        "Email": user.email,
        "Status": normalizeStatus(user.status),
      }));
    }
  };

  // Handle search and applied filter changes
  // Handle search and applied filter changes
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
    
    if (viewMode === "hosts") {
      // Apply all certification filters cumulatively
      if (appliedCertificationFilters.status) {
        params.status = getApiStatus(appliedCertificationFilters.status);
      }
      
      // Convert Listed Properties filter to min/max
      if (appliedCertificationFilters["Listed Properties"]) {
        const [min, max] = appliedCertificationFilters["Listed Properties"].split("-").map(Number);
        if (!isNaN(min)) params.minListedProperties = min;
        if (!isNaN(max)) params.maxListedProperties = max;
      }
    } else {
      // Apply all admin filters cumulatively
      if (appliedAdminFilters.status) {
        params.status = getApiStatus(appliedAdminFilters.status);
      }
    }
    
    fetchData(params);
  }, 500); // Debounce search

  return () => clearTimeout(timeoutId);
}, [searchTerm, appliedCertificationFilters, appliedAdminFilters, viewMode, currentPage,fetchData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, appliedCertificationFilters, appliedAdminFilters, viewMode]);

  // Fetch data when view mode changes
  useEffect(() => {
    fetchData();
    setSelectedRows(new Set());
  }, [viewMode,fetchData]);

  const handleAddAdminNote = () => {
    setIsAddAdminDrawerOpen(true);
  };

  const handleDeleteApplications = async (selectedRowIds: Set<string>) => {
    const idsToDelete = Array.from(selectedRowIds).map(id => parseInt(id));
    
    // Delete from API
    const deletePromises = idsToDelete.map(id => deleteItem(id));
    const results = await Promise.all(deletePromises);
    
    // Refresh the data after deletion
    if (results.every(result => result)) {
      fetchData();
    }

    setIsModalOpen(false);
    setSelectedRows(new Set());
  };

  const handleDeleteSingleApplication = async (row: TableRowData, id: number) => {
    const success = await deleteItem(id);
    if (success) {
      fetchData(); // Refresh data
    }

    setIsModalOpen(false);
    setSingleRowToDelete(null);

    const newSelected = new Set(selectedRows);
    newSelected.delete(id.toString());
    setSelectedRows(newSelected);
  };

  const openDeleteSingleModal = (row: TableRowData, id: number) => {
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
      handleDeleteApplications(selectedRows);
    } else if (singleRowToDelete) {
      handleDeleteSingleApplication(singleRowToDelete.row, singleRowToDelete.id);
    }
  };

  const handleResetFilter = () => {
    if (viewMode === "hosts") {
      setTempCertificationFilters({ 
        "Listed Properties": "", 
        status: "", 
      });
      setAppliedCertificationFilters({ 
        "Listed Properties": "", 
        status: "", 
      });
    } else {
      setTempAdminFilters({ 
        status: "", 
      });
      setAppliedAdminFilters({ 
        status: "", 
      });
    }
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleApplyFilter = () => {
    if (viewMode === "hosts") {
      setAppliedCertificationFilters(prev => ({...prev, ...tempCertificationFilters}));
    } else {
      setAppliedAdminFilters(prev => ({...prev, ...tempAdminFilters}));
    }
    setIsFilterOpen(false);
  };

  // Get current data based on view mode
  const currentData = useMemo(() => {
    const data = viewMode === "hosts" ? hostsData : adminsData;
    return convertToTableData(data);
  }, [viewMode, hostsData, adminsData,convertToTableData]);

  const currentApiData = useMemo(() => {
    return viewMode === "hosts" ? hostsData : adminsData;
  }, [viewMode, hostsData, adminsData]);

  const handleSelectAll = (checked: boolean) => {
    const rowIds = currentApiData.map(item => item.id.toString());
    setSelectedRows(new Set(checked ? rowIds : []));
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
  };

  const isAllDisplayedSelected = currentData.length > 0 && 
    currentApiData.every(item => selectedRows.has(item.id.toString()));
  const isSomeDisplayedSelected = currentApiData.some(item => selectedRows.has(item.id.toString())) && !isAllDisplayedSelected;

  const getRowIds = () => {
    return currentApiData.map(item => item.id.toString());
  };

  const getFilterFields = () => {
    if (viewMode === "hosts") {
      return [
        { 
          label: "Listed Properties", 
          key: "Listed Properties", 
          type: "dropdown" as const, 
          placeholder: "Select Properties", 
          options: ["0-50", "50-100", "100-200"] 
        },
        { 
          label: "Status", 
          key: "status", 
          type: "dropdown" as const, 
          placeholder: "Select status", 
          options: ["Active", "Suspended", "Pending Verification"] 
        },
      ];
    } else {
      return [
        { 
          label: "Status", 
          key: "status", 
          type: "dropdown" as const, 
          placeholder: "Select Status", 
          options: ["Active", "Suspended", "Pending Verification"] 
        },
      ];
    }
  };

  type DropdownItemOnClick = (row: TableRowData, index: number) => void;

  interface DropdownItem {
    label: string;
    onClick: DropdownItemOnClick;
  }

  const getDropdownItems = (): DropdownItem[] => [
    {
      label: "View Details",
      onClick: (row: TableRowData, index: number) => {
        const originalId = currentApiData[index].id;
        window.location.href = `/super-admin/dashboard/user-management/${viewMode.slice(0, -1)}/detail/${originalId}`;
      },
    },
    {
      label: `Delete ${viewMode === "hosts" ? "Host" : "Admin"}`,
      onClick: (row: TableRowData, index: number) => {
        const originalId = currentApiData[index].id;
        openDeleteSingleModal(row, originalId);
      },
    },
  ];

  const handleDropdownToggle = (key: string, value: boolean) => {
    setDropdownStates(prev => ({
      ...prev,
      [key === "Listed Properties" ? "property" : "status"]: value
    }));
  };

  const getDropdownStates = (): DropdownStates => {
    if (viewMode === "hosts") {
      return {
        "Listed Properties": dropdownStates.property,
        "status": dropdownStates.status,
      };
    } else {
      return {
        "Listed Properties": false, // Always include all properties for consistent type
        "status": dropdownStates.status,
      };
    }
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
          title={`Confirm ${viewMode === "hosts" ? "Host" : "Admin"} Deletion`}
          description={`Deleting this ${viewMode === "hosts" ? "Host" : "Admin"} means it will no longer appear in your ${viewMode}.`}
          image="/images/delete-modal.png"
          confirmText="Delete"
        />
      )}

      {isAddAdminDrawerOpen && (
        <TicketDrawer
          onClose={() => setIsAddAdminDrawerOpen(false)}
          onNoteSubmit={handleAddAdminNote}
        />
      )}

      <div className="flex flex-col sm:flex-row mb-6 sm:mb-0 justify-center sm:justify-between items-start">
        <div>
          <h2 className="font-semibold text-[20px] leading-[20px]">User Management</h2>
          <p className="font-regular text-[16px] leading-5 mb-[22px] pt-2 text-[#FFFFFF99]">
            View, manage, and control all hosts and admins on the platform with ease.
          </p>
        </div>
        {viewMode === "admins" && (
          <button
            onClick={() => setIsAddAdminDrawerOpen(true)}
            className="text-[16px] font-semibold leading-5 py-3 px-5 yellow-btn text-[#121315] cursor-pointer"
          >
            Add Admin
          </button>
        )}
      </div>

      <Tabs selectedIndex={viewMode === "hosts" ? 0 : 1} onSelect={(index) => setViewMode(index === 0 ? "hosts" : "admins")}>
        <TabList className="inline-flex p-[6px] rounded-xl bg-[#121315] space-x-4 mb-6 border-0">
          <Tab className="px-4 py-2 text-[14px] cursor-pointer font-medium transition-colors text-[#FFFFFFCC] border-0 outline-none">Hosts</Tab>
          <Tab className="px-4 py-2 text-[14px] cursor-pointer font-medium transition-colors text-[#FFFFFFCC] border-0 outline-none">Admins</Tab>
        </TabList>

        <TabPanel>
          <div className="flex flex-col justify-between">
            <Table
              data={currentData}
              title="Registered Hosts"
              showDeleteButton={true}
              onDeleteSingle={openDeleteSingleModal}
              showPagination={true}
              clickable={true}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              isAllSelected={isAllDisplayedSelected}
              isSomeSelected={isSomeDisplayedSelected}
              rowIds={getRowIds()}
              dropdownItems={getDropdownItems()}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={pagination.limit}
              totalItems={pagination.total}
              showFilter={true}
              onFilterToggle={setIsFilterOpen}
              onDeleteAll={handleDeleteSelected}
              isDeleteAllDisabled={selectedRows.size === 0}
              isLoading={isLoading}
            />
          </div>
        </TabPanel>

        <TabPanel>
          <div className="flex flex-col justify-between">
            <Table
              data={currentData}
              title="Registered Admins"
              showDeleteButton={true}
              onDeleteSingle={openDeleteSingleModal}
              showPagination={true}
              clickable={true}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              isAllSelected={isAllDisplayedSelected}
              isSomeSelected={isSomeDisplayedSelected}
              rowIds={getRowIds()}
              dropdownItems={getDropdownItems()}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={pagination.limit}
              totalItems={pagination.total}
              showFilter={true}
              onFilterToggle={setIsFilterOpen}
              onDeleteAll={handleDeleteSelected}
              isDeleteAllDisabled={selectedRows.size === 0}
              isLoading={isLoading}
            />
          </div>
        </TabPanel>
      </Tabs>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Apply Filter"
        description={`Refine ${viewMode} listings to find the right ${viewMode.slice(0, -1)} faster.`}
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={viewMode === "hosts" ? tempCertificationFilters : tempAdminFilters}
        onFilterChange={(filters) => {
          if (viewMode === "hosts") {
            setTempCertificationFilters(prev => ({ ...prev, ...filters }));
          } else {
            setTempAdminFilters(prev => ({ ...prev, ...filters }));
          }
        }}
        dropdownStates={getDropdownStates()}
        onDropdownToggle={handleDropdownToggle}
        fields={getFilterFields()}
      />
    </>
  );
}