"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/admin/tables-essentials/Filter";
import TicketDrawer from "./Drawer";

interface CertificationData {
  id: number;
  "Host Name": string;
  Email: string;
  "Listed Properties": number;
  "Certified Properties": number;
  "Account Created": string;
  Status: string;
}

interface AdminData {
  id: number;
  "Admin Name": string;
  Email: string;
  Status: string;
}

type ViewMode = "hosts" | "admins";

// Define proper types for table rows
type TableRowData = Record<string, string | number>;

export default function Applications() {
  const [viewMode, setViewMode] = useState<ViewMode>("hosts");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
// Change the selectedRows state to use string IDs
const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{ row: TableRowData; id: number } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");
  const [isAddAdminDrawerOpen, setIsAddAdminDrawerOpen] = useState(false);
  const [dropdownStates, setDropdownStates] = useState({ property: false, ownership: false, status: false, permissions: false });

  const [certificationFilters, setCertificationFilters] = useState({
    "Certified Properties": "", "Listed Properties": "", status: "", submittedDate: "",
  });

  const [adminFilters, setAdminFilters] = useState({
    role: "", status: "", "Properties verified": "", "Pending applications": "", "Rejected applications": "",
  });

  const [allCertificationData, setAllCertificationData] = useState<CertificationData[]>([
    { id: 1, "Host Name": "Sarah Kim", Email: "sarah.kim@example.com", "Listed Properties": 15, "Certified Properties": 12, "Account Created": "Aug 12, 2025", Status: "Active" },
    { id: 2, "Host Name": "Mike Johnson", Email: "mike.j@example.com", "Listed Properties": 8, "Certified Properties": 7, "Account Created": "Aug 12, 2025", Status: "Active" },
    { id: 3, "Host Name": "Emily Chen", Email: "emily.chen@example.com", "Listed Properties": 22, "Certified Properties": 10, "Account Created": "Aug 12, 2025", Status: "Active" },
    { id: 4, "Host Name": "David Wilson", Email: "david.w@example.com", "Listed Properties": 5, "Certified Properties": 10, "Account Created": "Aug 12, 2025", Status: "Active" },
    { id: 5, "Host Name": "Sarah Kim", Email: "sarah.kim@example.com", "Listed Properties": 15, "Certified Properties": 12, "Account Created": "Aug 12, 2025", Status: "Active" },
    { id: 6, "Host Name": "Mike Johnson", Email: "mike.j@example.com", "Listed Properties": 8, "Certified Properties": 7, "Account Created": "Aug 12, 2025", Status: "Active" },
    { id: 7, "Host Name": "Emily Chen", Email: "emily.chen@example.com", "Listed Properties": 22, "Certified Properties": 10, "Account Created": "Aug 12, 2025", Status: "Active" },
    { id: 8, "Host Name": "David Wilson", Email: "david.w@example.com", "Listed Properties": 5, "Certified Properties": 10, "Account Created": "Aug 12, 2025", Status: "Active" },
    { id: 9, "Host Name": "Lisa Brown", Email: "lisa.b@example.com", "Listed Properties": 18, "Certified Properties": 10, "Account Created": "Aug 12, 2025", Status: "Suspended" },
    { id: 10, "Host Name": "Alex Garcia", Email: "alex.g@example.com", "Listed Properties": 12, "Certified Properties": 10, "Account Created": "Aug 12, 2025", Status: "Active" },
  ]);

  const [allAdminData, setAllAdminData] = useState<AdminData[]>([
    { id: 1, "Admin Name": "John Smith", Email: "john.smith@company.com", Status: "Active" },
    { id: 2, "Admin Name": "Maria Rodriguez", Email: "maria.r@company.com", Status: "Active" },
    { id: 3, "Admin Name": "Robert Chen", Email: "robert.c@company.com", Status: "Suspended" },
    { id: 4, "Admin Name": "John Smith", Email: "john.smith@company.com", Status: "Active" },
    { id: 5, "Admin Name": "Maria Rodriguez", Email: "maria.r@company.com", Status: "Active" },
    { id: 6, "Admin Name": "Robert Chen", Email: "robert.c@company.com", Status: "Suspended" },
    { id: 7, "Admin Name": "John Smith", Email: "john.smith@company.com", Status: "Active" },
    { id: 8, "Admin Name": "Maria Rodriguez", Email: "maria.r@company.com", Status: "Active" },
    { id: 9, "Admin Name": "Robert Chen", Email: "robert.c@company.com", Status: "Suspended" },
  ]);

  const itemsPerPage = 6;

  const handleAddAdminNote = () => {
    const newAdmin: AdminData = {
      id: allAdminData.length + 1,
      "Admin Name": `New Admin ${allAdminData.length + 1}`,
      Email: `newadmin${allAdminData.length + 1}@company.com`,
      Status: "Active",
    };
    setAllAdminData(prev => [...prev, newAdmin]);
  };

  const handleDeleteApplications = (selectedRowIds: Set<string>) => {
  const idsToDelete = Array.from(selectedRowIds).map(id => parseInt(id));

  if (viewMode === "hosts") {
    setAllCertificationData(prev => prev.filter(item => !idsToDelete.includes(item.id)));
  } else {
    setAllAdminData(prev => prev.filter(item => !idsToDelete.includes(item.id)));
  }

  setIsModalOpen(false);
  setSelectedRows(new Set());
};

  const handleDeleteSingleApplication = (row: TableRowData, id: number) => {
  if (viewMode === "hosts") {
    setAllCertificationData(prev => prev.filter(item => item.id !== id));
  } else {
    setAllAdminData(prev => prev.filter(item => item.id !== id));
  }

  setIsModalOpen(false);
  setSingleRowToDelete(null);

  const newSelected = new Set(selectedRows);
  newSelected.delete(id.toString()); // Convert to string for deletion
  setSelectedRows(newSelected);

  const remainingDataCount = currentData.length - 1;
  const maxPageAfterDeletion = Math.ceil(remainingDataCount / itemsPerPage);
  if (currentPage > maxPageAfterDeletion) setCurrentPage(Math.max(1, maxPageAfterDeletion));
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
      setCertificationFilters({ "Certified Properties": "", "Listed Properties": "", status: "", submittedDate: "" });
    } else {
      setAdminFilters({ role: "", status: "", "Properties verified": "", "Pending applications": "", "Rejected applications": "" });
    }
    setSearchTerm("");
  };

  const filteredCertificationData = useMemo(() => {
    let filtered = allCertificationData.filter(item =>
      item["Host Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (certificationFilters["Listed Properties"]) {
      const [min, max] = certificationFilters["Listed Properties"].split("-").map(Number);
      filtered = filtered.filter(item => item["Listed Properties"] >= min && item["Listed Properties"] <= max);
    }

    if (certificationFilters["Certified Properties"]) {
      const [min, max] = certificationFilters["Certified Properties"].split("-").map(Number);
      filtered = filtered.filter(item => item["Certified Properties"] >= min && item["Certified Properties"] <= max);
    }

    if (certificationFilters.status) {
      filtered = filtered.filter(item => item.Status === certificationFilters.status);
    }

    return filtered;
  }, [searchTerm, certificationFilters, allCertificationData]);

  const filteredAdminData = useMemo(() => {
    let filtered = allAdminData.filter(item =>
      item["Admin Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (adminFilters.status) filtered = filtered.filter(item => item.Status === adminFilters.status);

    return filtered;
  }, [searchTerm, adminFilters, allAdminData]);

  const currentData = viewMode === "hosts" ? filteredCertificationData : filteredAdminData;
  const displayData = useMemo(() =>
    currentData.map((item) => {
      const { id, ...rest } = item;
      console.log(id)
      return rest;
    }), [currentData]
  );

  const handleSelectAll = (checked: boolean) => {
  setSelectedRows(new Set(checked ? currentData.map(item => item.id.toString()) : []));
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


 const isAllDisplayedSelected = currentData.length > 0 && currentData.every(item => selectedRows.has(item.id.toString()));
const isSomeDisplayedSelected = currentData.some(item => selectedRows.has(item.id.toString())) && !isAllDisplayedSelected;

  const getFilterFields = () => viewMode === "hosts" ? [
    { label: "Listed Properties", key: "Listed Properties", type: "dropdown" as const, placeholder: "Select Properties", options: ["0-50", "50-100", "100-200"] },
    { label: "Certified Properties", key: "Certified Properties", type: "dropdown" as const, placeholder: "Select Applications", options: ["0-5", "5-10", "10-15", "15-20"] },
    { label: "Status", key: "status", type: "dropdown" as const, placeholder: "Select status", options: [...new Set(allCertificationData.map(item => item.Status))] },
  ] : [
    { label: "Properties verified", key: "Properties verified", type: "dropdown" as const, placeholder: "Select Properties", options: ["0-50", "50-100", "100-200"] },
    { label: "Pending applications", key: "Pending applications", type: "dropdown" as const, placeholder: "Select applications", options: ["3", "8", "15", "18", "25"] },
    { label: "Rejected applications", key: "Rejected applications", type: "dropdown" as const, placeholder: "Select applications", options: ["5", "7", "12", "20", "30", "45"] },
    { label: "Status", key: "status", type: "dropdown" as const, placeholder: "Select status", options: ["Active", "Suspended"] },
  ];

  // Define proper type for dropdown item onClick
  type DropdownItemOnClick = (row: TableRowData, index: number) => void;

  interface DropdownItem {
    label: string;
    onClick: DropdownItemOnClick;
  }

  const getDropdownItems = (): DropdownItem[] => [
    {
      label: "View Details",
      onClick: (row: TableRowData, index: number) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const originalIndex = startIndex + index;
        const originalRow = currentData[originalIndex];
        window.location.href = `/super-admin/dashboard/user-management/${viewMode.slice(0, -1)}/detail/${originalRow.id}`;
      },
    },
    {
      label: `Delete ${viewMode === "hosts" ? "Host" : "Admin"}`,
      onClick: (row: TableRowData, index: number) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const originalIndex = startIndex + index;
        const originalRow = currentData[originalIndex];
        openDeleteSingleModal(row, originalRow.id);
      },
    },
  ];

  const handleDropdownToggle = (key: string, value: boolean) => {
    setDropdownStates(prev => ({
      ...prev,
      [key === "Listed Properties" || key === "Properties verified" ? "property" :
        key === "Certified Properties" || key === "Rejected applications" ? "ownership" :
          key === "Pending applications" ? "permissions" : "status"]: value
    }));
  };

  const getDropdownStates = () => {
    if (viewMode === "hosts") {
      return {
        "Listed Properties": dropdownStates.property,
        "Certified Properties": dropdownStates.ownership,
        "status": dropdownStates.status,
        "Properties verified": false,
        "Pending applications": false,
        "Rejected applications": false,
      };
    } else {
      return {
        "Properties verified": dropdownStates.property,
        "Pending applications": dropdownStates.permissions,
        "Rejected applications": dropdownStates.ownership,
        "status": dropdownStates.status,
        "Listed Properties": false,
        "Certified Properties": false,
      };
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [searchTerm, certificationFilters, adminFilters, viewMode]);

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
          <Tab className="px-4 py-2  text-[14px] cursor-pointer font-medium transition-colors text-[#FFFFFFCC] border-0 outline-none">Hosts</Tab>
          <Tab className="px-4 py-2  text-[14px] cursor-pointer font-medium transition-colors text-[#FFFFFFCC] border-0 outline-none">Admins</Tab>
        </TabList>

        <TabPanel>
          <div className="flex flex-col justify-between">
            <Table
              data={displayData}
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
rowIds={currentData.map(item => item.id.toString())}
              dropdownItems={getDropdownItems()}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={currentData.length}
              showFilter={true}
              onFilterToggle={setIsFilterOpen}
              onDeleteAll={handleDeleteSelected}
              isDeleteAllDisabled={selectedRows.size === 0}
            />
          </div>
        </TabPanel>

        <TabPanel>
          <div className="flex flex-col justify-between">
            <Table
              data={displayData}
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
              rowIds={currentData.map(item => item.id.toString())}
              dropdownItems={getDropdownItems()}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={currentData.length}
              showFilter={true}
              onFilterToggle={setIsFilterOpen}
              onDeleteAll={handleDeleteSelected}
              isDeleteAllDisabled={selectedRows.size === 0}
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
        onApply={() => setIsFilterOpen(false)}
        filterValues={viewMode === "hosts" ? certificationFilters : adminFilters}
        onFilterChange={(filters) => {
          if (viewMode === "hosts") {
            setCertificationFilters(prev => ({ ...prev, ...filters }));
          } else {
            setAdminFilters(prev => ({ ...prev, ...filters }));
          }
        }}
        dropdownStates={getDropdownStates()}
        onDropdownToggle={handleDropdownToggle}
        fields={getFilterFields()}
      />
    </>
  );
}